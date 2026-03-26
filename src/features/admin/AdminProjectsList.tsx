import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { projectsRepo, type AdminProjectListItem } from '@/features/projects/services/projectsRepo';

export default function AdminProjectsList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<AdminProjectListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRows([]);
      setError(t('projects.supabase_not_configured'));
      setLoading(false);
      return;
    }
    setError('');
    try {
      const data = await projectsRepo.listAdminProjects();
      setRows(data || []);
    } catch (e: Error) {
      setError(e.message || t('admin.projects_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePublished = async (id: string, published: boolean) => {
    if (!isSupabaseConfigured) return;
    try {
      await projectsRepo.setPublished({ id, published: !published });
    } catch (e: Error) {
      setError(e.message || t('admin.projects_update_failed'));
      return;
    }
    void load();
  };

  const remove = async (id: string) => {
    if (!isSupabaseConfigured) return;
    if (!confirm(t('admin.projects_confirm_delete'))) return;
    try {
      await projectsRepo.deleteById(id);
    } catch (e: Error) {
      setError(e.message || t('admin.projects_delete_failed'));
      return;
    }
    void load();
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">{t('admin.projects_loading')}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">{t('admin.projects_title')}</h1>
        <Link
          to="/admin/projects/new"
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors inline-block"
        >
          {t('admin.projects_new')}
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-accent-line/30 bg-white px-4 py-3"
          >
            <div>
              <Link to={`/admin/projects/${row.id}`} className="font-bold text-sm hover:text-primary">
                {row.slug}
              </Link>
              <span className="text-slate-500 text-sm ml-3">{row.project_categories?.filter_key}</span>
              <span className="text-slate-400 text-xs ml-3">{row.year}</span>
              <span className={`text-xs ml-3 ${row.published ? 'text-green-600' : 'text-amber-600'}`}>
                {row.published ? t('admin.projects_status_published') : t('admin.projects_status_draft')}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => togglePublished(row.id, row.published)}
                className="text-xs font-bold uppercase text-primary"
              >
                {row.published ? t('admin.projects_unpublish') : t('admin.projects_publish')}
              </button>
              <Link to={`/admin/projects/${row.id}`} className="text-xs font-bold uppercase text-slate-600">
                {t('admin.projects_edit')}
              </Link>
              <button type="button" onClick={() => remove(row.id)} className="text-xs font-bold uppercase text-red-600">
                {t('admin.projects_delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
