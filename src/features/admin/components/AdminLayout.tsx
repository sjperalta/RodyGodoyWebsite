import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTranslation } from 'react-i18next';

export function AdminLayout() {
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `text-xs font-bold tracking-widest uppercase pb-1 border-b-2 transition-colors ${
      isActive ? 'border-primary text-bg-dark' : 'border-transparent text-slate-400 hover:text-primary'
    }`;

  return (
    <div className="min-h-screen bg-bg-light text-bg-dark">
      <header className="border-b border-accent-line/30 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <span className="font-serif text-lg">{t('admin.layout_title')}</span>
          <nav className="flex flex-wrap items-center gap-6">
            <NavLink to="/admin/projects" className={linkClass}>
              {t('admin.layout_nav_projects')}
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              {t('admin.layout_nav_categories')}
            </NavLink>
            <NavLink to="/admin/site" className={linkClass}>
              {t('admin.layout_nav_site')}
            </NavLink>
            <a href="/" className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-primary">
              {t('admin.layout_view_site')}
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-primary"
            >
              {t('admin.sign_out')}
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
