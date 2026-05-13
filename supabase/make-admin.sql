-- ============================================================
-- Promote a user to admin
-- ============================================================
-- Step 1: In the app, sign up with the email you want as admin
--         (use the SetupPage flow as a normal user).
-- Step 2: Open Supabase Dashboard → SQL Editor → New query.
-- Step 3: Replace the email below and run.
-- After this, sign out and back in for the JWT to refresh with
-- the new admin claim — the "Users" page will appear in the
-- sidebar.
-- ============================================================

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                        || '{"is_admin": true}'::jsonb
where email = 'YOUR_ADMIN_EMAIL@example.com';

-- To revoke admin (run with the same email):
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data - 'is_admin'
-- where email = 'YOUR_ADMIN_EMAIL@example.com';

-- Check who is currently admin:
-- select email, raw_app_meta_data->>'is_admin' as is_admin
-- from auth.users
-- where (raw_app_meta_data->>'is_admin')::boolean = true;
