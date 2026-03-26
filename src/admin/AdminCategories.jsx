import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const emptyForm = () => ({
  filter_key: '',
  label_es: '',
  label_en: '',
  sort_order: 0,
});

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRows([]);
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
      setLoading(false);
      return;
    }
    setError('');
    const { data, error: qError } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (qError) {
      setError(qError.message);
      return;
    }
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setEditingId('new');
    setForm(emptyForm());
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      filter_key: row.filter_key,
      label_es: row.label?.es ?? '',
      label_en: row.label?.en ?? '',
      sort_order: row.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const save = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setSaving(true);
    setError('');
    const payload = {
      filter_key: form.filter_key.trim().toUpperCase(),
      label: { es: form.label_es.trim(), en: form.label_en.trim() },
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId === 'new') {
        const { error: e } = await supabase.from('project_categories').insert(payload);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('project_categories').update(payload).eq('id', editingId);
        if (e) throw e;
      }
      cancelEdit();
      await load();
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!confirm('Delete this category? Projects using it may be blocked by FK.')) return;
    setError('');
    const { error: e } = await supabase.from('project_categories').delete().eq('id', id);
    if (e) {
      setError(e.message);
      return;
    }
    await load();
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading categories…</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Categories</h1>
        <button
          type="button"
          onClick={startCreate}
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors"
        >
          New category
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {editingId && (
        <div className="border border-accent-line/40 bg-white p-6 mb-8 space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-primary">
            {editingId === 'new' ? 'New category' : 'Edit category'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                Filter key (e.g. RESIDENTIAL)
              </label>
              <input
                value={form.filter_key}
                onChange={(e) => setForm((f) => ({ ...f, filter_key: e.target.value }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                disabled={editingId !== 'new'}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                Sort order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                Label (ES)
              </label>
              <input
                value={form.label_es}
                onChange={(e) => setForm((f) => ({ ...f, label_es: e.target.value }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                Label (EN)
              </label>
              <input
                value={form.label_en}
                onChange={(e) => setForm((f) => ({ ...f, label_en: e.target.value }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-primary text-white px-4 py-2 text-xs font-bold tracking-widest uppercase disabled:opacity-50"
            >
              Save
            </button>
            <button type="button" onClick={cancelEdit} className="text-xs font-bold tracking-widest uppercase text-slate-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-accent-line/30 bg-white px-4 py-3"
          >
            <div>
              <span className="font-bold text-sm">{row.filter_key}</span>
              <span className="text-slate-500 text-sm ml-3">
                {row.label?.es} / {row.label?.en}
              </span>
              <span className="text-slate-400 text-xs ml-3">order {row.sort_order}</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => startEdit(row)} className="text-xs font-bold uppercase text-primary">
                Edit
              </button>
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
