-- The CMS Errors tab has "Del" and "Clear all" buttons, but client_errors had no
-- DELETE policy. Row Level Security therefore discarded those deletes silently
-- (the API returns 200 with zero rows affected, so the UI looks like it worked)
-- and logged errors could never be cleared.
--
-- This grants the authenticated admin the missing delete right. The anon role
-- still cannot delete anything.

drop policy if exists "admin can delete errors" on public.client_errors;
create policy "admin can delete errors"
  on public.client_errors for delete
  to authenticated
  using (true);
