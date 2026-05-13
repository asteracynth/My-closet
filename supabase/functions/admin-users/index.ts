// Supabase Edge Function: admin-users
// Runs on Supabase with the service_role key (server-side only).
// The browser calls this via supabase.functions.invoke('admin-users', { body: {...} }).
//
// Deploy:
//   supabase functions deploy admin-users
//
// Required project env vars (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BUCKET = 'closet-images';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function clearUserStorage(admin: ReturnType<typeof createClient>, userId: string) {
  const { data: files } = await admin.storage
    .from(BUCKET)
    .list(userId, { limit: 1000 });
  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await admin.storage.from(BUCKET).remove(paths);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 1) Verify the caller is signed in and is an admin.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing auth header' }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: uErr,
    } = await userClient.auth.getUser();
    if (uErr || !user) return json({ error: 'Not authenticated' }, 401);

    const isAdmin =
      (user.app_metadata as Record<string, unknown> | null)?.is_admin === true;
    if (!isAdmin) return json({ error: 'Forbidden — admin only' }, 403);

    // 2) Service-role client for privileged operations.
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? '');

    switch (action) {
      case 'list': {
        const { data, error } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (error) throw error;
        return json({ users: data.users });
      }

      case 'create': {
        const { email, password, isAdmin: makeAdmin } = body;
        if (!email || !password) {
          return json({ error: 'email and password required' }, 400);
        }
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          app_metadata: makeAdmin ? { is_admin: true } : {},
        });
        if (error) throw error;
        return json({ user: data.user });
      }

      case 'update': {
        const { id, email, password, isAdmin: makeAdmin } = body;
        if (!id) return json({ error: 'id required' }, 400);

        // Pull existing metadata so we don't wipe other fields.
        const { data: existing } = await admin.auth.admin.getUserById(id);
        const currentMeta =
          (existing?.user?.app_metadata as Record<string, unknown>) ?? {};

        const updates: Record<string, unknown> = {};
        if (email) updates.email = email;
        if (password) updates.password = password;
        if (typeof makeAdmin === 'boolean') {
          updates.app_metadata = { ...currentMeta, is_admin: makeAdmin };
        }

        // Prevent the only admin from demoting themselves.
        if (makeAdmin === false && id === user.id) {
          const { data: all } = await admin.auth.admin.listUsers({
            page: 1,
            perPage: 200,
          });
          const adminCount = (all.users || []).filter(
            (u) => (u.app_metadata as any)?.is_admin === true
          ).length;
          if (adminCount <= 1) {
            return json({ error: 'Cannot demote the only admin' }, 400);
          }
        }

        const { data, error } = await admin.auth.admin.updateUserById(
          id,
          updates
        );
        if (error) throw error;
        return json({ user: data.user });
      }

      case 'delete': {
        const { id } = body;
        if (!id) return json({ error: 'id required' }, 400);
        if (id === user.id) return json({ error: 'Cannot delete yourself' }, 400);
        // Clean up Storage; DB rows cascade via FK on delete.
        await clearUserStorage(admin, id);
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) throw error;
        return json({ ok: true });
      }

      case 'clearData': {
        const { id } = body;
        if (!id) return json({ error: 'id required' }, 400);
        await admin.from('items').delete().eq('user_id', id);
        await admin.from('outfits').delete().eq('user_id', id);
        await admin.from('wear_logs').delete().eq('user_id', id);
        await clearUserStorage(admin, id);
        return json({ ok: true });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    console.error('[admin-users]', err);
    return json({ error: (err as Error).message ?? 'Internal error' }, 500);
  }
});
