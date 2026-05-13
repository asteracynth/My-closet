import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shirt } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ok = await login(email, password);
      if (!ok) {
        setError('Incorrect email or password');
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blush-100 flex items-center justify-center mb-3">
            <Shirt className="text-blush-600" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-lavender-700">Personal Closet</h1>
          <p className="text-sm text-lavender-600 mt-1">Welcome back.</p>
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
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-blush-600 bg-blush-50 rounded-2xl p-3">{error}</div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Unlocking…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-lavender-500 mt-4 text-center">
          New here?{' '}
          <Link to="/setup" className="text-lavender-700 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
