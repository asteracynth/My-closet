# Deploying updates without committing to git

You can ship updates straight from your laptop to **Vercel** (frontend) and **Supabase** (backend edge functions / SQL) without going through a git push. Two CLIs do the work.

---

## 0 · One-time setup

```bash
# Vercel CLI
npm i -g vercel
vercel login

# Supabase CLI (only needed for Edge Functions or SQL via CLI)
npm i -g supabase
supabase login
```

Then **link your local folder to the existing cloud projects** (one-time per machine):

```bash
# Inside the project folder:
vercel link        # pick the existing Vercel project
supabase link --project-ref YOUR_PROJECT_REF   # find ref in Supabase URL
```

> `YOUR_PROJECT_REF` is the part before `.supabase.co` in your project URL, e.g.
> `abcdwxyz1234.supabase.co` → ref = `abcdwxyz1234`.

---

## 1 · Update the React frontend

Anything under `src/`, `index.html`, `vite.config.js`, etc.

```bash
npm run build      # local sanity check (optional)
vercel --prod      # deploys current code as production
```

Vercel re-builds in its own cloud and switches your production URL atomically. No git push needed.

If you only want a preview deploy (for testing):

```bash
vercel             # gives you a unique preview URL
```

### Tweak environment variables
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```
Or change them in the Vercel dashboard → **Project Settings → Environment Variables**, then run `vercel --prod` again.

---

## 2 · Update the Edge Function (admin-users)

Anything under `supabase/functions/admin-users/`.

```bash
supabase functions deploy admin-users
```

Done — the next browser call hits the new code.

Check logs:
```bash
supabase functions logs admin-users
```

---

## 3 · Update the SQL schema

Two options:

**A. Dashboard (easiest):**
Open Supabase Dashboard → **SQL Editor** → paste new SQL → Run.

**B. CLI migration (optional, for version control):**
```bash
supabase db push                  # pushes any new migrations in supabase/migrations/
```

---

## 4 · Promote a user to admin (one-time)

After someone signs up through the app, run this once in **SQL Editor**:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                        || '{"is_admin": true}'::jsonb
where email = 'you@example.com';
```

They need to **sign out and back in** for the JWT to refresh — then the "Users" link appears in the sidebar.

---

## Quick reference

| What changed | Command |
|---|---|
| React component, styles, etc. | `vercel --prod` |
| `admin-users` Edge Function | `supabase functions deploy admin-users` |
| Database schema | SQL Editor (paste) or `supabase db push` |
| Env vars | `vercel env add` then `vercel --prod` |

| Things that still need git | Notes |
|---|---|
| Sharing changes with teammates / backup | Push the same code to your repo whenever it's stable |
| Vercel "Production Branch" auto-deploy | Will still trigger on pushes; your CLI deploys override the live URL |

---

## Common gotchas

- **"Function not deployed" / 404** when calling admin actions → run `supabase functions deploy admin-users`.
- **403 "Not admin"** → you signed in *before* the SQL admin promotion. Sign out, then sign in again so the JWT picks up the new claim.
- **CORS error from browser** → the Edge Function already sets permissive CORS headers. If you customise the function, keep the `OPTIONS` preflight handler.
- **Service role key leaked?** In Supabase Dashboard → Project Settings → API → click **"Reset service_role secret"**, then redeploy the Edge Function (it picks up the new key automatically).
