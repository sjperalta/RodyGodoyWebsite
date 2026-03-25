import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const { signOut } = useAuth();

  const linkClass = ({ isActive }) =>
    `text-xs font-bold tracking-widest uppercase pb-1 border-b-2 transition-colors ${
      isActive ? 'border-primary text-bg-dark' : 'border-transparent text-slate-400 hover:text-primary'
    }`;

  return (
    <div className="min-h-screen bg-bg-light text-bg-dark">
      <header className="border-b border-accent-line/30 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <span className="font-serif text-lg">Studio admin</span>
          <nav className="flex flex-wrap items-center gap-6">
            <NavLink to="/admin/projects" className={linkClass}>
              Projects
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              Categories
            </NavLink>
            <a href="/" className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-primary">
              View site
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-primary"
            >
              Sign out
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
