-- Harden public.client_errors.
--
-- It is the only table an anonymous visitor can write to (by design, so runtime
-- errors get captured), which made it the one floodable surface in the app:
-- the policy was `for insert with check (true)` with no size or rate limit.
--
-- Before: anyone could POST unbounded rows or megabytes of text.
-- After:  inserts go through a rate-limited SECURITY DEFINER function, and the
--         columns have hard length caps. Reads stay admin-only (unchanged).

-- 1. Shrink anything already oversized so the constraints can be applied.
update public.client_errors
set message    = left(coalesce(message, ''), 500),
    stack      = left(coalesce(stack, ''), 4000),
    url        = left(coalesce(url, ''), 500),
    user_agent = left(coalesce(user_agent, ''), 500);

-- 2. Hard caps on what can be stored.
alter table public.client_errors
  drop constraint if exists client_errors_message_len,
  drop constraint if exists client_errors_stack_len,
  drop constraint if exists client_errors_url_len,
  drop constraint if exists client_errors_ua_len;

alter table public.client_errors
  add constraint client_errors_message_len check (length(message) <= 500),
  add constraint client_errors_stack_len   check (length(coalesce(stack, '')) <= 4000),
  add constraint client_errors_url_len     check (length(coalesce(url, '')) <= 500),
  add constraint client_errors_ua_len      check (length(coalesce(user_agent, '')) <= 500);

-- 3. The only way in: a rate-limited function.
create or replace function public.log_client_error(
  p_message text,
  p_stack text default null,
  p_url text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
begin
  -- Global flood guard: at most 120 rows a minute across all visitors.
  -- A genuine error storm still gets captured; a scripted flood is capped.
  select count(*) into recent
  from public.client_errors
  where created_at > now() - interval '1 minute';

  if recent >= 120 then
    return;
  end if;

  insert into public.client_errors (message, stack, url, user_agent)
  values (
    left(coalesce(p_message, ''), 500),
    nullif(left(coalesce(p_stack, ''), 4000), ''),
    nullif(left(coalesce(p_url, ''), 500), ''),
    nullif(left(coalesce(p_user_agent, ''), 500), '')
  );
end;
$$;

revoke all on function public.log_client_error(text, text, text, text) from public;
grant execute on function public.log_client_error(text, text, text, text) to anon, authenticated;

-- 4. Close the direct insert path — the function above is now the only door.
drop policy if exists "anyone can log errors" on public.client_errors;
