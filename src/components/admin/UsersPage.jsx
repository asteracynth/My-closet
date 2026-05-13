import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Loader2,
  Shield,
  ShieldOff,
  Database,
  Mail,
  Lock,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../shared/PageHeader.jsx';
import Modal, { ConfirmModal } from '../shared/Modal.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';
import {
  adminListUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminClearUserData,
} from '../../lib/admin.js';
import { formatDate } from '../../utils/format.js';

export default function UsersPage() {
  const { user: me } = useAuth();
  const { push } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingClear, setPendingClear] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListUsers();
      setUsers(list);
    } catch (err) {
      setError(err.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(u) {
    setBusyId(u.id);
    try {
      await adminDeleteUser(u.id);
      push(`Deleted ${u.email}`, 'success');
      await refresh();
    } catch (err) {
      push(err.message || 'Delete failed', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleClear(u) {
    setBusyId(u.id);
    try {
      await adminClearUserData(u.id);
      push(`Cleared data for ${u.email}`, 'success');
    } catch (err) {
      push(err.message || 'Clear failed', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleAdmin(u) {
    const next = !(u.app_metadata?.is_admin === true);
    setBusyId(u.id);
    try {
      await adminUpdateUser(u.id, { isAdmin: next });
      push(next ? `${u.email} is now admin` : `${u.email} demoted`, 'success');
      await refresh();
    } catch (err) {
      push(err.message || 'Update failed', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} account${users.length === 1 ? '' : 's'}`}
        actions={
          <>
            <button className="btn-secondary !px-3" onClick={refresh} aria-label="Refresh">
              <RefreshCw size={16} />
            </button>
            <button className="btn-primary" onClick={() => setAddOpen(true)}>
              <UserPlus size={18} /> Add user
            </button>
          </>
        }
      />

      {error && (
        <div className="card p-4 mb-4 bg-blush-50 border-blush-200 text-blush-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-10 text-center text-lavender-500">
          <Loader2 className="animate-spin inline" size={20} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users" description="Add the first account to get started." />
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isAdmin = u.app_metadata?.is_admin === true;
            const isSelf = u.id === me?.id;
            const busy = busyId === u.id;
            return (
              <div key={u.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-lavender-800 truncate">{u.email}</span>
                    {isAdmin && (
                      <span className="chip bg-blush-100 text-blush-700">
                        <Shield size={12} /> Admin
                      </span>
                    )}
                    {isSelf && <span className="chip">You</span>}
                  </div>
                  <div className="text-xs text-lavender-500 mt-1">
                    Created {formatDate(u.created_at)}
                    {u.last_sign_in_at && <> · Last sign-in {formatDate(u.last_sign_in_at)}</>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => setEditing(u)}
                    disabled={busy}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => handleToggleAdmin(u)}
                    disabled={busy}
                    title={isAdmin ? 'Revoke admin' : 'Make admin'}
                  >
                    {isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                    {isAdmin ? 'Revoke' : 'Promote'}
                  </button>
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => setPendingClear(u)}
                    disabled={busy}
                  >
                    <Database size={14} /> Clear data
                  </button>
                  <button
                    className="btn-danger text-sm"
                    onClick={() => setPendingDelete(u)}
                    disabled={busy || isSelf}
                    title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                  >
                    {busy ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          setAddOpen(false);
          await refresh();
        }}
      />

      <EditUserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await refresh();
        }}
      />

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => handleDelete(pendingDelete)}
        title={`Delete ${pendingDelete?.email}?`}
        description="This permanently removes the user, all their items, outfits, wear logs, and images."
        confirmLabel="Delete"
        danger
      />

      <ConfirmModal
        open={!!pendingClear}
        onClose={() => setPendingClear(null)}
        onConfirm={() => handleClear(pendingClear)}
        title={`Clear data for ${pendingClear?.email}?`}
        description="Deletes their items, outfits, wear logs, and uploaded images. The account stays."
        confirmLabel="Clear data"
        danger
      />
    </div>
  );
}

function AddUserModal({ open, onClose, onCreated }) {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);

  function reset() {
    setEmail('');
    setPassword('');
    setIsAdmin(false);
    setBusy(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.includes('@')) return push('Invalid email', 'error');
    if (password.length < 8) return push('Password must be ≥ 8 chars', 'error');
    setBusy(true);
    try {
      await adminCreateUser({ email, password, isAdmin });
      push(`User ${email} created`, 'success');
      reset();
      await onCreated();
    } catch (err) {
      push(err.message || 'Create failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add user"
      footer={
        <>
          <button
            className="btn-ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </button>
          <button className="btn-primary" onClick={onSubmit} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
            Create
          </button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" size={16} />
            <input
              type="email"
              className="input-field pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <div>
          <label className="label">Initial password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" size={16} />
            <input
              type="password"
              className="input-field pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-lavender-700">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="rounded"
          />
          Grant admin privileges
        </label>
      </form>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPassword('');
    }
  }, [user]);

  if (!user) return null;

  async function onSubmit() {
    setBusy(true);
    try {
      const updates = {};
      if (email && email !== user.email) updates.email = email;
      if (password) {
        if (password.length < 8) {
          push('Password must be ≥ 8 chars', 'error');
          setBusy(false);
          return;
        }
        updates.password = password;
      }
      if (Object.keys(updates).length === 0) {
        push('Nothing to update', 'error');
        setBusy(false);
        return;
      }
      await adminUpdateUser(user.id, updates);
      push('User updated', 'success');
      await onSaved();
    } catch (err) {
      push(err.message || 'Update failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={`Edit ${user.email}`}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSubmit} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Edit size={16} />}
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">New password (leave blank to keep current)</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>
      </div>
    </Modal>
  );
}
