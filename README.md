# Personal Closet

A responsive wardrobe management web app — catalog clothing with photos, build outfits, log daily wears, and see usage stats.

**Stack:** React 18 + Vite + Tailwind CSS · React Router v6 · Recharts · Lucide React
**Backend:** Supabase (PostgreSQL + Auth + Storage)
**Hosting:** Vercel (front-end)

---

## 1. Setup Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → New query → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → Run.
   This creates the `items`, `outfits`, `wear_logs` tables, the `increment_wear_for_items` RPC, and Row-Level-Security policies so each user only sees their own data.
3. **Storage** → Create a new bucket named `closet-images`. Toggle **"Public bucket" ON**. The schema script already adds upload/delete policies that restrict writes to `{user_id}/*` paths.
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
5. (Optional, for personal use) **Authentication → Providers → Email** — turn off "Confirm email" so signup logs in immediately.

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account, and add your first item.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import your repo.
3. Framework preset is auto-detected as Vite. No build settings to change — `vercel.json` already configures the SPA rewrites.
4. **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Deploy. You'll get a `https://your-app.vercel.app` URL.
6. Back in Supabase: **Authentication → URL Configuration** → add your Vercel URL to **Site URL** and **Redirect URLs** so email confirmations work.

---

## Project structure

```
src/
├── lib/
│   └── supabase.js          ← Supabase client
├── db/
│   ├── itemsDB.js           ← CRUD: items
│   ├── outfitsDB.js         ← CRUD: outfits
│   ├── wearLogDB.js         ← CRUD: wear_logs
│   ├── storage.js           ← image upload / delete / public URL
│   └── mappers.js           ← snake_case ↔ camelCase
├── hooks/                   ← useAuth, useItems, useOutfits, useWearLog, useToast
├── utils/                   ← imageUtils (client-side compression), export, stats, format
├── components/
│   ├── auth/                ← SetupPage, LoginPage, ProtectedRoute
│   ├── shared/              ← Layout, Sidebar, BottomNav, Modal, Toast, …
│   ├── closet/              ← ClosetPage, ItemForm, ItemDetail, ImageUploader, …
│   ├── outfits/             ← OutfitsPage, OutfitForm, OutfitDetail, ItemPicker
│   ├── log/                 ← WearLogPage, LogForm
│   ├── stats/               ← StatsPage (Recharts)
│   ├── settings/            ← SettingsPage
│   └── dashboard/           ← DashboardPage
└── App.jsx                  ← Routes
supabase/
└── schema.sql               ← run once in Supabase SQL editor
```

## Data model

| Supabase table | Purpose | Notes |
|---|---|---|
| `items` | One row per garment | Stores `image_path` (string), not base64 |
| `outfits` | Saved combinations | `item_ids` is a JSONB array of item UUIDs |
| `wear_logs` | Daily wear records | Insert bumps wear counts via the RPC |
| Storage `closet-images` | JPEGs scaled to 800px wide | Path `{user_id}/{uuid}.jpg` |

Images are compressed client-side before upload (canvas → JPEG @ 0.82 quality). The DB only stores the storage path; the UI derives the public URL on read.

## Scripts

```
npm run dev       # vite dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```
