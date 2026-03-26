import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export default function AdminProjectsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRows([]);
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
      setLoading(false);
      return;
    }
    setError('');
    const { data, error: err } = await supabase
      .from('projects')
      .select('id, slug, year, published, sort_order, project_categories!projects_category_id_fkey(filter_key)')
      .order('sort_order', { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublished = async (id, published) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error: err } = await supabase.from('projects').update({ published: !published }).eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    load();
  };

  const remove = async (id) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!confirm('Delete this project and all its media?')) return;
    const { error: err } = await supabase.from('projects').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    load();
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading projects…</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Projects</h1>
        <Link
          to="/admin/projects/new"
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors inline-block"
        >
          New project
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
                {row.published ? 'published' : 'draft'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => togglePublished(row.id, row.published)}
                className="text-xs font-bold uppercase text-primary"
              >
                {row.published ? 'Unpublish' : 'Publish'}
              </button>
              <Link to={`/admin/projects/${row.id}`} className="text-xs font-bold uppercase text-slate-600">
                Edit
              </Link>
              <button type="button" onClick={() => remove(row.id)} className="text-xs font-bold uppercase text-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
