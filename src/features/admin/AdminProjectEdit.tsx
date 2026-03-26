import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isSupabaseConfigured, getProjectImagePublicUrl, getProjectVideoPublicUrl } from '@/services/supabase/client';
import { categoriesRepo, projectsRepo, projectMediaRepo, type CategoryIdAndFilterKey, type ProjectMedia, type CreateProjectPayload, type UpdateProjectPayload } from '@/features/projects/services';
import { useTranslation } from 'react-i18next';

interface LocalizedString {
  en: string;
  es: string;
}

interface ProjectForm {
  slug: string;
  category_id: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  location_es: string;
  location_en: string;
  area_es: string;
  area_en: string;
  year: string;
  published: boolean;
  sort_order: number;
}

const emptyForm = (): ProjectForm => ({
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
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [categories, setCategories] = useState<CategoryIdAndFilterKey[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm());
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [projectId, setProjectId] = useState<string | null>(isNew ? null : (id || null));

  const loadCategories = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCategories([]);
      setError(t('projects.supabase_not_configured'));
      return;
    }
    try {
      const data = await categoriesRepo.listIdAndFilterKey();
      setCategories(data || []);
    } catch (e: Error) {
      setError(e.message || t('admin.categories_load_failed'));
      setCategories([]);
    }
  }, [t]);

  const loadProject = useCallback(async () => {
    if (isNew || !id) return;
    if (!isSupabaseConfigured) {
      setError(t('projects.supabase_not_configured'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const proj = await projectsRepo.getById(id);
      setProjectId(proj.id);
      setForm({
        slug: proj.slug,
        category_id: proj.project_categories?.id || '', // Accessing id directly from project_categories
        name_es: (proj.name as LocalizedString)?.es ?? '',
        name_en: (proj.name as LocalizedString)?.en ?? '',
        description_es: (proj.description as LocalizedString)?.es ?? '',
        description_en: (proj.description as LocalizedString)?.en ?? '',
        location_es: (proj.location as LocalizedString)?.es ?? '',
        location_en: (proj.location as LocalizedString)?.en ?? '',
        area_es: (proj.area as LocalizedString)?.es ?? '',
        area_en: (proj.area as LocalizedString)?.en ?? '',
        year: proj.year?.toString() ?? '',
        published: proj.published,
        sort_order: proj.sort_order ?? 0,
      });

      const m = await projectMediaRepo.listByProjectId(id);
      setMedia(m || []);
    } catch (e: Error) {
      setError(e.message || t('admin.project_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [id, isNew, t]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      setProjectId(null);
      setForm(emptyForm());
      setMedia([]);
      return;
    }
    void loadProject();
  }, [id, isNew, loadProject]);

  const saveProject = async () => {
    if (!isSupabaseConfigured) {
      setError(t('projects.supabase_not_configured'));
      return;
    }
    setSaving(true);
    setError('');

    const payload: CreateProjectPayload | UpdateProjectPayload = {
      slug: form.slug.trim(),
      category_id: form.category_id,
      name: { es: form.name_es.trim(), en: form.name_en.trim() },
      description: { es: form.description_es.trim(), en: form.description_en.trim() },
      location: { es: form.location_es.trim(), en: form.location_en.trim() },
      area: { es: form.area_es.trim(), en: form.area_en.trim() },
      year: Number(form.year) || 0,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew || !projectId) {
        const newProjectPayload = payload as CreateProjectPayload;
        const data = await projectsRepo.create(newProjectPayload);
        if (data?.id) {
          setProjectId(data.id);
          navigate(`/admin/projects/${data.id}`, { replace: true });
        }
      } else {
        const updateProjectPayload = payload as UpdateProjectPayload;
        await projectsRepo.update(projectId, updateProjectPayload);
      }
    } catch (e: Error) {
      setError(e.message || t('admin.project_save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    if (!isSupabaseConfigured) {
      setError(t('projects.supabase_not_configured'));
      return;
    }
    if (!projectId) {
      setError(t('admin.project_save_first_upload_media'));
      return;
    }
    const files = Array.from(fileList);
    let nextOrder: number =
      media.length > 0 ? Math.max(...media.map((m) => m.sort_order)) + 1 : 0;

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const kind: 'image' | 'video' = isVideo ? 'video' : 'image';
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const objectPath = `projects/${projectId}/${crypto.randomUUID()}.${ext}`;

      try {
        await projectMediaRepo.uploadAndCreateRow({
          projectId,
          file,
          objectPath,
          kind,
          sortOrder: nextOrder++,
        });
      } catch (e: Error) {
        setError(e.message || t('admin.project_upload_failed'));
        return;
      }
    }
    void loadProject();
  };

  const deleteMedia = async (row: ProjectMedia) => {
    if (!isSupabaseConfigured) return;
    if (!confirm(t('admin.project_media_confirm_remove'))) return;
    try {
      await projectMediaRepo.deleteRowAndStorage({
        id: row.id,
        objectPath: row.object_path,
        kind: row.kind,
      });
    } catch (e: Error) {
      setError(e.message || t('admin.project_delete_failed'));
      return;
    }
    void loadProject();
  };

  const moveMedia = async (index: number, direction: number) => {
    if (!isSupabaseConfigured) return;
    const next = index + direction;
    if (next < 0 || next >= media.length) return;
    const a = media[index];
    const b = media[next];
    try {
      await projectMediaRepo.setSortOrder({ id: a.id, sortOrder: b.sort_order });
      await projectMediaRepo.setSortOrder({ id: b.id, sortOrder: a.sort_order });
    } catch (e: Error) {
      setError(e.message || t('admin.project_reorder_failed'));
      return;
    }
    void loadProject();
  };

  if (loading) {
    return <p className="text-slate-500 text-sm">{t('admin.project_loading')}</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">
        {isNew ? t('admin.project_new_title') : t('admin.project_edit_title')}
      </h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="border border-accent-line/40 bg-white p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.project_slug_label')}
            </label>
            <input
              value={form.slug}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              placeholder={t('admin.project_slug_placeholder')}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.project_category_label')}
            </label>
            <select
              value={form.category_id}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            >
              <option value="">{t('admin.project_category_select_placeholder')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.filter_key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.project_year_label')}
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.project_sort_order_label')}
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <label htmlFor="published" className="text-sm">
              {t('admin.project_published_label')}
            </label>
          </div>
        </div>

        <h2 className="text-xs font-bold tracking-widest uppercase text-primary pt-4">
          {t('admin.project_localized_copy_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'name',
              esLabel: t('admin.project_localized_name_es'),
              enLabel: t('admin.project_localized_name_en'),
            },
            {
              key: 'description',
              esLabel: t('admin.project_localized_description_es'),
              enLabel: t('admin.project_localized_description_en'),
            },
            {
              key: 'location',
              esLabel: t('admin.project_localized_location_es'),
              enLabel: t('admin.project_localized_location_en'),
            },
            {
              key: 'area',
              esLabel: t('admin.project_localized_area_es'),
              enLabel: t('admin.project_localized_area_en'),
            },
          ].map(({ key, esLabel, enLabel }) => (
            <div key={key} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                  {esLabel}
                </label>
                {key === 'description' ? (
                  <textarea
                    value={form[`${key}_es` as keyof ProjectForm] as string}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, [`${key}_es`]: e.target.value }))}
                    rows={4}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    value={form[`${key}_es` as keyof ProjectForm] as string}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [`${key}_es`]: e.target.value }))}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                  {enLabel}
                </label>
                {key === 'description' ? (
                  <textarea
                    value={form[`${key}_en` as keyof ProjectForm] as string}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, [`${key}_en`]: e.target.value }))}
                    rows={4}
                    className="w-full border border-accent-line/50 px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    value={form[`${key}_en` as keyof ProjectForm] as string}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [`${key}_en`]: e.target.value }))}
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
          {saving ? t('admin.project_saving') : t('admin.project_save_button')}
        </button>
      </div>

      <div className="border border-accent-line/40 bg-white p-6">
        <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-4">
          {t('admin.project_media_title')}
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          {t('admin.project_medi-instructions_images_to')}{' '}
          <code className="bg-slate-100 px-1">project-images</code>{' '}
          {t('admin.project_medi-instructions_videos_to')}{' '}
          <code className="bg-slate-100 px-1">files</code>.{' '}
          {t('admin.project_medi-instructions_paths_must_start')}{' '}
          <code className="bg-slate-100 px-1">projects/</code>.
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
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
                <button type="button" className="text-xs uppercase text-primary" onClick={() => void moveMedia(i, -1)}>
                  {t('admin.project_media_move_up')}
                </button>
                <button type="button" className="text-xs uppercase text-primary" onClick={() => void moveMedia(i, 1)}>
                  {t('admin.project_media_move_down')}
                </button>
                <button type="button" className="text-xs uppercase text-red-600" onClick={() => void deleteMedia(m)}>
                  {t('admin.project_media_delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
