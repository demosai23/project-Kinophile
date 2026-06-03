import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const oauthError = new URLSearchParams(location.search).get('error');

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) return setErrors((p) => ({ ...p, email: 'Email required' }));
    if (!form.password) return setErrors((p) => ({ ...p, password: 'Password required' }));

    setLoading(true);
    const result = await login(form);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <main className="min-h-screen bg-cinema-950 flex items-center justify-center px-4 py-20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-700/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl italic text-white hover:text-brand-400 transition-colors">
            Kinophile
          </Link>
          <p className="text-neutral-500 text-sm font-body mt-2">Track the films you love.</p>
        </div>
        {oauthError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-sm text-red-400 text-sm font-mono">
            Google sign-in failed. Please try again.
          </div>
        )}
        <div className="form-card">
          <h1 className="font-display text-xl text-white mb-6">Sign in</h1>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-cinema-800 hover:bg-cinema-700 border border-cinema-600 hover:border-cinema-500 text-neutral-300 font-body text-sm py-3 rounded-sm transition-all duration-200"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="divider">
            <span className="text-xs font-mono text-neutral-600 uppercase tracking-widest">or</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="input-field"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                className="input-field"
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-neutral-500 mt-6 font-body">
          New to Kinophile?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}