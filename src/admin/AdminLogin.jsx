import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export default function AdminLogin() {
  const { t } = useTranslation();
  const { session, loading, isAdmin, signIn, signOut } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/projects';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session && isAdmin) {
    return <Navigate to={from} replace />;
  }

  if (!loading && session && !isAdmin) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center gap-4 p-8 text-center max-w-lg mx-auto">
        <p className="text-slate-700 font-medium">{t('admin.not_admin_title')}</p>
        <p className="text-slate-500 text-sm whitespace-pre-wrap">{t('admin.not_admin_body')}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase"
        >
          {t('admin.sign_out')}
        </button>
        <a href="/" className="text-primary text-xs font-bold tracking-widest uppercase">
          {t('admin.back_site')}
        </a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6">
      <div className="w-full max-w-sm border border-accent-line/40 bg-white p-8 shadow-sm rounded-sm">
        <h1 className="font-serif text-2xl text-bg-dark mb-6">{t('admin.login_title')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
              {t('admin.email_label')}
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
              {t('admin.password_label')}
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <p className="text-slate-400 text-xs leading-relaxed">{t('admin.help_sign_in')}</p>
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full bg-bg-dark text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50"
          >
            {submitting ? t('admin.signing_in') : t('admin.sign_in')}
          </button>
        </form>
        <a href="/" className="mt-6 block text-center text-xs text-slate-400 hover:text-primary">
          {t('admin.back_site')}
        </a>
      </div>
    </div>
  );
}
