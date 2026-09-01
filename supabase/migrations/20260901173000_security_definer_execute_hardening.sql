-- Remove direct API-role execution from SECURITY DEFINER helpers.
-- Safe and idempotent: trigger execution is unaffected and the waitlist lookup
-- remains available only to the service role.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.auth_email_exists(text) from public, anon, authenticated;
grant execute on function public.auth_email_exists(text) to service_role;
