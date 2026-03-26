import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  supabase,
  isSupabaseConfigured,
  STORAGE_BUCKETS,
  getProjectImagePublicUrl,
  getProjectVideoPublicUrl,
} from '../utils/supabase';

const emptyForm = () => ({
  slug: '',
  category_id: '',
  name_es: '',
  name_en: '',
  description_es: '',
  description_en: '',
  location_es: '',
  location_en: '',
  area_es: '',
  area_en: '',
  year: '',
  published: true,
  sort_order: 0,
});

export default function AdminProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState(isNew ? null : id);

  const loadCategories = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setCategories([]);
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
      return;
    }
    const { data } = await supabase.from('project_categories').select('id, filter_key').order('sort_order');
    setCategories(data || []);
  }, []);

  const loadProject = useCallback(async () => {
    if (isNew || !id) return;
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const { data: proj, error: pErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (pErr) {
      setError(pErr.message);
      setLoading(false);
      return;
    }
    setProjectId(proj.id);
    setForm({
      slug: proj.slug,
      category_id: proj.category_id,
      name_es: proj.name?.es ?? '',
      name_en: proj.name?.en ?? '',
      description_es: proj.description?.es ?? '',
      description_en: proj.description?.en ?? '',
      location_es: proj.location?.es ?? '',
      location_en: proj.location?.en ?? '',
      area_es: proj.area?.es ?? '',
      area_en: proj.area?.en ?? '',
      year: proj.year ?? '',
      published: proj.published,
      sort_order: proj.sort_order ?? 0,
    });
    setProjectId(proj.id);

    const { data: m, error: mErr } = await supabase
      .from('project_media')
      .select('*')
      .eq('project_id', id)
      .order('sort_order', { ascending: true });
    if (mErr) setError(mErr.message);
    else setMedia(m || []);
    setLoading(false);
  }, [id, isNew]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      setProjectId(null);
      setForm(emptyForm());
      setMedia([]);
      return;
    }
    loadProject();
  }, [id, isNew, loadProject]);

  const saveProject = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      slug: form.slug.trim(),
      category_id: form.category_id,
      name: { es: form.name_es.trim(), en: form.name_en.trim() },
      description: { es: form.description_es.trim(), en: form.description_en.trim() },
      location: { es: form.location_es.trim(), en: form.location_en.trim() },
      area: { es: form.area_es.trim(), en: form.area_en.trim() },
      year: form.year.trim(),
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew || !projectId) {
        const { data, error: insErr } = await supabase.from('projects').insert(payload).select('id').single();
        if (insErr) throw insErr;
        setProjectId(data.id);
        navigate(`/admin/projects/${data.id}`, { replace: true });
      } else {
        const { error: upErr } = await supabase.from('projects').update(payload).eq('id', projectId);
        if (upErr) throw upErr;
      }
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (fileList) => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
      return;
    }
    if (!projectId) {
      setError('Save the project first, then upload media.');
      return;
    }
    const files = Array.from(fileList);
    let nextOrder =
      media.length > 0 ? Math.max(...media.map((m) => m.sort_order)) + 1 : 0;

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const bucket = isVideo ? STORAGE_BUCKETS.files : STORAGE_BUCKETS.images;
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `projects/${projectId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) {
        setError(upErr.message);
        return;
      }

      const { error: rowErr } = await supabase.from('project_media').insert({
        project_id: projectId,
        kind: isVideo ? 'video' : 'image',
        object_path: path,
        sort_order: nextOrder++,
      });
      if (rowErr) {
        setError(rowErr.message);
        return;
      }
    }
    loadProject();
  };

  const deleteMedia = async (row) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!confirm('Remove this file from the project?')) return;
    const bucket = row.kind === 'video' ? STORAGE_BUCKETS.files : STORAGE_BUCKETS.images;
    await supabase.storage.from(bucket).remove([row.object_path]);
    const { error: delErr } = await supabase.from('project_media').delete().eq('id', row.id);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    loadProject();
  };

  const moveMedia = async (index, direction) => {
    if (!isSupabaseConfigured || !supabase) return;
    const next = index + direction;
    if (next < 0 || next >= media.length) return;
    const a = media[index];
    const b = media[next];
    const { error: e1 } = await supabase.from('project_media').update({ sort_order: b.sort_order }).eq('id', a.id);
    const { error: e2 } = await supabase.from('project_media').update({ sort_order: a.sort_order }).eq('id', b.id);
    if (e1 || e2) {
      setError((e1 || e2).message);
      return;
    }
    loadProject();
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading project…</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">{isNew ? 'New project' : 'Edit project'}</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="border border-accent-line/40 bg-white p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              placeholder="my-project"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.filter_key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Year</label>
            <input
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <label htmlFor="published" className="text-sm">
              Published (visible on site)
            </label>
          </div>
        </div>

        <h2 className="text-xs font-bold tracking-widest uppercase text-primary pt-4">Localized copy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['name', 'description', 'location', 'area'].map((field) => (
            <div key={field} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                  {field} (ES)
                </label>
                {field === 'description' ? (
                  <textarea
                    value={form[`${field}_es`]}
                    onChange={(e) => setForm((f) => ({ ...f, [`${field}_es`]: e.target.value }))}
                    rows={4}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    value={form[`${field}_es`]}
                    onChange={(e) => setForm((f) => ({ ...f, [`${field}_es`]: e.target.value }))}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                  {field} (EN)
                </label>
                {field === 'description' ? (
                  <textarea
                    value={form[`${field}_en`]}
                    onChange={(e) => setForm((f) => ({ ...f, [`${field}_en`]: e.target.value }))}
                    rows={4}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    value={form[`${field}_en`]}
                    onChange={(e) => setForm((f) => ({ ...f, [`${field}_en`]: e.target.value }))}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveProject}
          disabled={saving || !form.slug || !form.category_id}
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save project'}
        </button>
      </div>

      <div className="border border-accent-line/40 bg-white p-6">
        <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-4">Media</h2>
        <p className="text-slate-500 text-sm mb-4">
          Images go to the <code className="bg-slate-100 px-1">project-images</code> bucket; videos to{' '}
          <code className="bg-slate-100 px-1">files</code>. Paths must start with <code className="bg-slate-100 px-1">projects/</code>.
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = '';
          }}
          className="text-sm mb-6"
          disabled={!projectId}
        />

        <ul className="space-y-4">
          {media.map((m, i) => (
            <li key={m.id} className="flex flex-wrap items-start gap-4 border-t border-accent-line/20 pt-4">
              <div className="w-32 h-20 bg-slate-100 shrink-0 overflow-hidden">
                {m.kind === 'video' ? (
                  <video src={getProjectVideoPublicUrl(m.object_path)} className="w-full h-full object-cover" muted />
                ) : (
                  <img
                    src={getProjectImagePublicUrl(m.object_path, { width: 200, height: 120, resize: 'cover' })}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 break-all">{m.object_path}</p>
                <p className="text-xs font-bold uppercase">{m.kind}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" className="text-xs uppercase text-primary" onClick={() => moveMedia(i, -1)}>
                  Up
                </button>
                <button type="button" className="text-xs uppercase text-primary" onClick={() => moveMedia(i, 1)}>
                  Down
                </button>
                <button type="button" className="text-xs uppercase text-red-600" onClick={() => deleteMedia(m)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
