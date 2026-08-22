-- FinanceMeta notification integrity hardening
-- Target repository: build-the-future-11/finance4all-global-reach
-- Target observed main: fbdd503223edc5b1780509720391083f485a4a85
-- Generated 2026-08-22 after verifying canonical migration history contains only 001-003.
--
-- Threat closed:
--   003_bookmarks_notifications.sql currently grants authenticated users an
--   INSERT RLS policy with WITH CHECK (true), allowing arbitrary notification
--   creation for any user_id. Notifications are intended to be created only by
--   SECURITY DEFINER trigger functions.

BEGIN;

DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;

-- Remove direct client insert capability. Trigger functions created by the
-- migration owner continue to execute with their definer privileges.
REVOKE INSERT ON TABLE public.notifications FROM anon, authenticated;

COMMIT;
