import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';

export default function ProtectedRoute() {
  const { t } = useTranslation();
  const { session, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center text-slate-500 text-sm">
        {t('admin.loading')}
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center gap-4 p-8 text-center max-w-lg mx-auto">
        <p className="text-slate-700 font-serif text-xl">{t('admin.access_denied_title')}</p>
        <p className="text-slate-500 text-sm whitespace-pre-wrap">{t('admin.access_denied_body')}</p>
        <a href="/" className="text-primary text-sm font-bold tracking-widest uppercase underline">
          {t('admin.back_home')}
        </a>
      </div>
    );
  }

  return <Outlet />;
}
