import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Upload, Trash2, Lock, LogOut, Database, Loader2, User, Users } from 'lucide-react';
import PageHeader from '../shared/PageHeader.jsx';
import Modal from '../shared/Modal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';
import {
  exportAllData,
  downloadJSON,
  importDataFromJSON,
  readFileAsJSON,
} from '../../utils/exportUtils.js';
import { getAllItems, clearItems } from '../../db/itemsDB.js';
import { clearOutfits } from '../../db/outfitsDB.js';
import { clearWearLogs } from '../../db/wearLogDB.js';
import { supabase } from '../../lib/supabase.js';

export default function SettingsPage() {
  const { changePassword, logout, email, isAdmin } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submittingPwd, setSubmittingPwd] = useState(false);

  const [itemCount, setItemCount] = useState(0);

  const [clearOpen, setClearOpen] = useState(false);
  const [clearPwd, setClearPwd] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    refreshStats();
  }, []);

  async function refreshStats() {
    try {
      const items = await getAllItems();
      setItemCount(items.length);
    } catch (err) {
      console.error(err);
    }
  }

  async function onChangePwd(e) {
    e.preventDefault();
    if (next !== confirm) {
      push('New passwords do not match', 'error');
      return;
    }
    setSubmittingPwd(true);
    try {
      await changePassword(current, next);
      push('Password updated', 'success');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      push(err.message || 'Could not change password', 'error');
    } finally {
      setSubmittingPwd(false);
    }
  }

  async function onExport() {
    try {
      const data = await exportAllData();
      downloadJSON(data, `personal-closet-${new Date().toISOString().slice(0, 10)}.json`);
      push('Backup downloaded', 'success');
    } catch (err) {
      push('Export failed', 'error');
    }
  }

  async function onImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const json = await readFileAsJSON(file);
      await importDataFromJSON(json, { merge: false });
      await refreshStats();
      push('Backup restored', 'success');
    } catch (err) {
      push(err.message || 'Import failed', 'error');
    }
  }

  async function onClearAll() {
    if (!clearPwd) {
      push('Please confirm with your password', 'error');
      return;
    }
    setClearing(true);
    try {
      // Re-verify password via Supabase before destructive op.
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email,
        password: clearPwd,
      });
      if (verifyErr) {
        push('Incorrect password', 'error');
        return;
      }
      await Promise.all([clearItems(), clearOutfits(), clearWearLogs()]);
      await refreshStats();
      push('All data cleared', 'success');
      setClearOpen(false);
      setClearPwd('');
    } catch (err) {
      push(err.message || 'Could not clear data', 'error');
    } finally {
      setClearing(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Settings" />

      <div className="card p-4 sm:p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lavender-700 mb-3 flex items-center gap-2">
              <User size={16} /> Account
            </h3>
            <div className="text-sm">
              <div className="text-xs uppercase tracking-wide text-lavender-500">Signed in as</div>
              <div className="text-lavender-700 font-medium truncate">{email || '—'}</div>
              {isAdmin && (
                <span className="chip bg-blush-100 text-blush-700 mt-2">Admin</span>
              )}
            </div>
          </div>
          <button
            className="btn-secondary text-sm shrink-0 lg:hidden"
            onClick={handleLogout}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="card p-4 sm:p-5 mb-4">
          <h3 className="font-semibold text-lavender-700 mb-3 flex items-center gap-2">
            <Users size={16} /> Admin tools
          </h3>
          <Link to="/admin/users" className="btn-secondary w-full justify-center">
            <Users size={16} /> Manage users
          </Link>
        </div>
      )}

      <div className="card p-4 sm:p-5 mb-4">
        <h3 className="font-semibold text-lavender-700 mb-3 flex items-center gap-2">
          <Lock size={16} /> Change password
        </h3>
        <form onSubmit={onChangePwd} className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input-field"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                className="input-field"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                type="password"
                className="input-field"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <button className="btn-primary" disabled={submittingPwd}>
            {submittingPwd ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
            Update password
          </button>
        </form>
      </div>

      <div className="card p-4 sm:p-5 mb-4">
        <h3 className="font-semibold text-lavender-700 mb-3 flex items-center gap-2">
          <Database size={16} /> Backup & restore
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn-secondary flex-1" onClick={onExport}>
            <Download size={16} /> Export to JSON
          </button>
          <button className="btn-secondary flex-1" onClick={() => fileInput.current?.click()}>
            <Upload size={16} /> Import from JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportFile}
          />
        </div>
        <p className="text-xs text-lavender-500 mt-3">
          Importing replaces all existing data. Export first to keep a copy. Backups include only metadata
          (image references) — re-uploading images is not supported yet.
        </p>
      </div>

      <div className="card p-4 sm:p-5 mb-4">
        <h3 className="font-semibold text-lavender-700 mb-3">App info</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Version" value="1.0.0" />
          <Info label="Items" value={itemCount} />
          <Info label="Storage" value="Supabase Cloud" />
          <Info label="Sync" value="Across devices" />
        </div>
      </div>

      <div className="card p-4 sm:p-5 mb-4 border-blush-200">
        <h3 className="font-semibold text-blush-600 mb-3 flex items-center gap-2">
          <Trash2 size={16} /> Danger zone
        </h3>
        <button className="btn-danger w-full" onClick={() => setClearOpen(true)}>
          <Trash2 size={16} /> Clear all data
        </button>
        <p className="text-xs text-lavender-500 mt-2">
          Deletes every item, outfit, and wear log. Your account stays.
        </p>
      </div>

      <div className="lg:hidden mb-8">
        <button className="btn-secondary w-full" onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </button>
      </div>

      <Modal
        open={clearOpen}
        onClose={() => {
          setClearOpen(false);
          setClearPwd('');
        }}
        title="Clear all data?"
        footer={
          <>
            <button
              className="btn-ghost"
              onClick={() => {
                setClearOpen(false);
                setClearPwd('');
              }}
            >
              Cancel
            </button>
            <button className="btn-danger" onClick={onClearAll} disabled={clearing || !clearPwd}>
              {clearing ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              Delete everything
            </button>
          </>
        }
      >
        <p className="text-sm text-lavender-600 mb-3">
          This permanently deletes all items, outfits and wear logs from your Supabase project.
        </p>
        <input
          type="password"
          placeholder="Confirm with your password"
          value={clearPwd}
          onChange={(e) => setClearPwd(e.target.value)}
          className="input-field"
          autoComplete="current-password"
          autoFocus
        />
      </Modal>
    </div>
  );
}

function Info({ label, value, warning }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-lavender-500">{label}</div>
      <div className={'font-medium ' + (warning ? 'text-blush-600' : 'text-lavender-700')}>
        {value}
      </div>
    </div>
  );
}
