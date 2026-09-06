-- Rate-limited, honeypot-protected contact form submission.
-- Replaces direct anon INSERT with a SECURITY DEFINER function.
drop policy if exists "messages_public_insert" on public.messages;

create or replace function public.submit_message(
  p_name text,
  p_email text,
  p_scope text,
  p_details text,
  p_honeypot text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  total_recent int;
begin
  -- Honeypot: real users never fill this hidden field
  if p_honeypot is not null and length(p_honeypot) > 0 then
    return false;
  end if;

  if p_name is null or length(trim(p_name)) = 0
     or p_email is null or length(trim(p_email)) = 0
     or p_details is null or length(trim(p_details)) = 0 then
    raise exception 'Please fill in your name, email and message.';
  end if;

  if length(trim(p_details)) > 5000 then
    raise exception 'Message is too long.';
  end if;

  -- Per-email rate limit: max 3 messages in 10 minutes
  select count(*) into recent_count
  from public.messages
  where email = trim(p_email) and created_at > now() - interval '10 minutes';
  if recent_count >= 3 then
    raise exception 'You are sending messages too quickly. Please try again later.';
  end if;

  -- Global rate limit: max 30 messages per hour
  select count(*) into total_recent
  from public.messages
  where created_at > now() - interval '1 hour';
  if total_recent >= 30 then
    raise exception 'Too many messages right now. Please try again later.';
  end if;

  insert into public.messages (name, email, scope, details)
  values (trim(p_name), trim(p_email), coalesce(p_scope, 'motion'), trim(p_details));

  return true;
end;
$$;

grant execute on function public.submit_message(text, text, text, text, text) to anon, authenticated;
revoke execute on function public.submit_message(text, text, text, text, text) from public;
