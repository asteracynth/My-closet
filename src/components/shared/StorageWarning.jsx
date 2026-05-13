import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase.js';

export default function StorageWarning() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="bg-blush-50 border-b border-blush-200 text-blush-700 px-4 py-2 text-sm flex items-center gap-2">
      <AlertTriangle size={16} />
      Supabase is not configured. Set <code className="font-mono mx-1">VITE_SUPABASE_URL</code> and{' '}
      <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to enable saving.
    </div>
  );
}
