import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Soft warning so the app at least renders, but every API call will fail.
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] Missing env vars VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Set them in .env.local (dev) or Vercel project settings (prod).'
  );
}

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const IMAGE_BUCKET = 'closet-images';

export function isSupabaseConfigured() {
  return !!url && !!anonKey;
}
