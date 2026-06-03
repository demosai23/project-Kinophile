import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login?error=oauth_failed');
      return;
    }

    window.__kinophile_access_token = token;

    api.get('/auth/me')
      .then(({ data }) => {
        updateUser(data.user);
        toast.success('Signed in with Google!');
        navigate('/');
      })
      .catch(() => {
        navigate('/login?error=oauth_failed');
      });
  }, []);

  return (
    <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-2xl text-brand-500 italic">Kinophile</span>
        <div className="w-8 h-0.5 bg-brand-500 animate-pulse" />
        <p className="text-neutral-500 text-sm font-mono">Completing sign in…</p>
      </div>
    </div>
  );
}