import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function SetupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { push } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const data = await signUp(email, password);
      if (data?.session) {
        push('Account created — welcome!', 'success');
        navigate('/', { replace: true });
      } else {
        setInfo(
          'Check your inbox to confirm your email before logging in. ' +
            '(If your Supabase project has email confirmation disabled, just sign in.)'
        );
      }
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-lavender-100 flex items-center justify-center mb-3">
            <Sparkles className="text-lavender-600" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-lavender-700">Create your closet</h1>
          <p className="text-sm text-lavender-600 mt-1">Sign up with your email to start.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" size={16} />
              <input
                type="email"
                className="input-field pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" size={16} />
              <input
                type="password"
                className="input-field pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-type your password"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="text-sm text-blush-600 bg-blush-50 rounded-2xl p-3">{error}</div>
          )}
          {info && (
            <div className="text-sm text-sage-700 bg-sage-50 rounded-2xl p-3">{info}</div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-lavender-500 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-lavender-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
