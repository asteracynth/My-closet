import { supabase } from './supabase.js';

const FN = 'admin-users';

async function callAdmin(action, params = {}) {
  const { data, error } = await supabase.functions.invoke(FN, {
    body: { action, ...params },
  });
  if (error) {
    // Try to pull message from the function's JSON body if present.
    let msg = error.message || 'Admin call failed';
    try {
      const ctx = error.context;
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function adminListUsers() {
  const data = await callAdmin('list');
  return data.users || [];
}

export async function adminCreateUser({ email, password, isAdmin = false }) {
  const data = await callAdmin('create', { email, password, isAdmin });
  return data.user;
}

export async function adminUpdateUser(id, { email, password, isAdmin } = {}) {
  const params = { id };
  if (email) params.email = email;
  if (password) params.password = password;
  if (typeof isAdmin === 'boolean') params.isAdmin = isAdmin;
  const data = await callAdmin('update', params);
  return data.user;
}

export async function adminDeleteUser(id) {
  await callAdmin('delete', { id });
}

export async function adminClearUserData(id) {
  await callAdmin('clearData', { id });
}
