import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { isSupabaseConfigured } from '@/services/supabase/client'; // Updated import path for isSupabaseConfigured
import { categoriesRepo, type ProjectCategory } from '@/features/projects/services/categoriesRepo'; // Updated import path for categoriesRepo and ProjectCategory
import { useTranslation } from 'react-i18next';

interface CategoryForm {
  filter_key: string;
  label: { es: string; en: string; }; // Changed to localized object
  sort_order: number;
}

const emptyForm = (): CategoryForm => ({
  filter_key: '',
  label: { es: '', en: '' }, // Initialize label as an object
  sort_order: 0,
});

export function AdminCategories() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm());
  const [saving, setSaving] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRows([]);
      setError(t('projects.supabase_not_configured'));
      setLoading(false);
      return;
    }
    setError('');
    try {
      const data = await categoriesRepo.listAll();
      setRows(data || []);
    } catch (e: Error) {
      setError(e.message || t('admin.categories_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setEditingId('new');
    setForm(emptyForm());
  };

  const startEdit = (row: ProjectCategory) => {
    setEditingId(row.id);
    setForm({
      filter_key: row.filter_key,
      label: { es: row.label.es ?? '', en: row.label.en ?? '' }, // Access label as object
      sort_order: row.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const save = async () => {
    if (!isSupabaseConfigured) return;
    setSaving(true);
    setError('');
    const payload = {
      filter_key: form.filter_key.trim().toUpperCase(),
      label: { es: form.label.es.trim(), en: form.label.en.trim() }, // Construct label as object
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId === 'new') {
        await categoriesRepo.create(payload);
      } else if (editingId) {
        await categoriesRepo.update(editingId, payload);
      }
      cancelEdit();
      await load();
    } catch (e: Error) {
      setError(e.message || t('admin.categories_save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!isSupabaseConfigured) return;
    if (!confirm(t('admin.categories_confirm_delete'))) return;
    setError('');
    try {
      await categoriesRepo.deleteById(id);
      await load();
    } catch (e: Error) {
      setError(e.message || t('admin.categories_delete_failed'));
    }
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">{t('admin.categories_loading')}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">{t('admin.categories_title')}</h1>
        <button
          type="button"
          onClick={startCreate}
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors"
        >
          {t('admin.categories_new')}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {editingId && (
        <div className="border border-accent-line/40 bg-white p-6 mb-8 space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-primary">
            {editingId === 'new' ? t('admin.categories_new') : t('admin.categories_edit')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                {t('admin.categories_filter_key_label')}
              </label>
              <input
                value={form.filter_key}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, filter_key: e.target.value }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                disabled={editingId !== 'new'}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                {t('admin.categories_sort_order_label')}
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                {t('admin.categories_label_es_label')}
              </label>
              <input
                value={form.label.es}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, label: { ...f.label, es: e.target.value } }))}
                className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                {t('admin.categories_label_en_label')}
              </label>
              <input
                value={form.label.en}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, label: { ...f.label, en: e.target.value } }))}
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
              {t('admin.categories_save')}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-bold tracking-widest uppercase text-slate-500"
            >
              {t('admin.categories_cancel')}
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
                {row.label.es} / {row.label.en} {/* Access label as object */}
              </span>
              <span className="text-slate-400 text-xs ml-3">
                {t('admin.categories_order_label', { order: row.sort_order })}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => startEdit(row)}
                className="text-xs font-bold uppercase text-primary"
              >
                {t('admin.categories_edit_button')}
              </button>
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="text-xs font-bold uppercase text-red-600"
              >
                {t('admin.categories_delete_button')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
