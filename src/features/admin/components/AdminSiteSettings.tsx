import { useMemo, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase, STORAGE_BUCKETS, getSiteImagePublicUrl, getSiteVideoPublicUrl } from '@/services/supabase/client';
import { siteSettingsRepo, type SiteSettings, type LocalizedText } from '@/features/marketing';

type BackgroundType = 'video' | 'image';

function emptyLocalized(): LocalizedText {
  return { en: '', es: '' };
}

function extFromFilename(name: string, fallback: string): string {
  const ext = name.split('.').pop();
  return (ext && ext.length <= 8 ? ext : fallback).toLowerCase();
}

export function AdminSiteSettings() {
  const { t } = useTranslation();

  const settingsQuery = useQuery<SiteSettings | null>({
    queryKey: ['site_settings', 'global'],
    queryFn: () => siteSettingsRepo.getGlobal(),
    enabled: isSupabaseConfigured,
  });

  const initial = settingsQuery.data;

  const [heroTitle, setHeroTitle] = useState<LocalizedText>(() => initial?.hero_title ?? emptyLocalized());
  const [heroSubtitle, setHeroSubtitle] = useState<LocalizedText>(() => initial?.hero_subtitle ?? emptyLocalized());
  const [heroCta, setHeroCta] = useState<LocalizedText>(() => initial?.hero_cta ?? emptyLocalized());
  const [bgType, setBgType] = useState<BackgroundType>(() => initial?.hero_background_type ?? 'video');
  const [objectPath, setObjectPath] = useState<string>(() => initial?.hero_background_object_path ?? '');

  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Keep local state in sync when query loads the first time.
  // (We avoid useEffect to keep this file simple; derive a “loaded once” snapshot.)
  const loadedId = initial?.updated_at ?? null;
  useMemo(() => {
    if (!loadedId) return;
    setHeroTitle(initial?.hero_title ?? emptyLocalized());
    setHeroSubtitle(initial?.hero_subtitle ?? emptyLocalized());
    setHeroCta(initial?.hero_cta ?? emptyLocalized());
    setBgType((initial?.hero_background_type as BackgroundType) ?? 'video');
    setObjectPath(initial?.hero_background_object_path ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedId]);

  const previewUrl = useMemo(() => {
    if (!objectPath) return '';
    return bgType === 'image' ? getSiteImagePublicUrl(objectPath, { width: 1600, resize: 'cover' }) : getSiteVideoPublicUrl(objectPath);
  }, [bgType, objectPath]);

  const save = async () => {
    if (!isSupabaseConfigured) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await siteSettingsRepo.upsertGlobal({
        hero_title: { en: heroTitle.en?.trim() ?? '', es: heroTitle.es?.trim() ?? '' },
        hero_subtitle: { en: heroSubtitle.en?.trim() ?? '', es: heroSubtitle.es?.trim() ?? '' },
        hero_cta: { en: heroCta.en?.trim() ?? '', es: heroCta.es?.trim() ?? '' },
        hero_background_type: bgType,
        hero_background_object_path: objectPath.trim(),
      });
      setSuccess(t('admin.site_settings_saved'));
      await settingsQuery.refetch();
    } catch (e: unknown) {
      setError((e as Error)?.message || t('admin.site_settings_save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file: File) => {
    if (!isSupabaseConfigured || !supabase) return;
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      const kind: BackgroundType = isVideo ? 'video' : 'image';
      const bucket = kind === 'image' ? STORAGE_BUCKETS.images : STORAGE_BUCKETS.files;
      const ext = extFromFilename(file.name, isVideo ? 'mp4' : 'jpg');
      const path = `site/hero/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      setBgType(kind);
      setObjectPath(path);
      setSuccess(t('admin.site_settings_upload_ok'));
    } catch (e: unknown) {
      setError((e as Error)?.message || t('admin.site_settings_upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return <p className="text-slate-500 text-sm">{t('projects.supabase_not_configured')}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">{t('admin.site_settings_title')}</h1>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || uploading}
          className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-primary transition-colors"
        >
          {saving ? t('admin.site_settings_saving') : t('admin.site_settings_save')}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-700 text-sm">{success}</p>}

      <div className="border border-accent-line/40 bg-white p-6 space-y-6">
        <h2 className="text-xs font-bold tracking-widest uppercase text-primary">{t('admin.site_settings_hero_copy')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.site_settings_hero_title_en')}
            </label>
            <input
              value={heroTitle.en ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeroTitle((v) => ({ ...v, en: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.site_settings_hero_title_es')}
            </label>
            <input
              value={heroTitle.es ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeroTitle((v) => ({ ...v, es: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.site_settings_hero_subtitle_en')}
            </label>
            <textarea
              value={heroSubtitle.en ?? ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHeroSubtitle((v) => ({ ...v, en: e.target.value }))}
              rows={4}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.site_settings_hero_subtitle_es')}
            </label>
            <textarea
              value={heroSubtitle.es ?? ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHeroSubtitle((v) => ({ ...v, es: e.target.value }))}
              rows={4}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.site_settings_hero_cta_en')}
            </label>
            <input
              value={heroCta.en ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeroCta((v) => ({ ...v, en: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
              {t('admin.site_settings_hero_cta_es')}
            </label>
            <input
              value={heroCta.es ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeroCta((v) => ({ ...v, es: e.target.value }))}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border border-accent-line/40 bg-white p-6 space-y-6">
        <h2 className="text-xs font-bold tracking-widest uppercase text-primary">{t('admin.site_settings_hero_media')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400">
              {t('admin.site_settings_bg_type')}
            </label>
            <select
              value={bgType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setBgType(e.target.value as BackgroundType)}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
            >
              <option value="video">{t('admin.site_settings_bg_video')}</option>
              <option value="image">{t('admin.site_settings_bg_image')}</option>
            </select>

            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400">
              {t('admin.site_settings_object_path')}
            </label>
            <input
              value={objectPath}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setObjectPath(e.target.value)}
              className="w-full border border-accent-line/50 px-3 py-2 text-sm"
              placeholder="site/hero/..."
            />

            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400">
              {t('admin.site_settings_upload')}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              disabled={uploading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
                e.target.value = '';
              }}
              className="text-sm"
            />
            <p className="text-xs text-slate-500">
              {t('admin.site_settings_upload_help')}
            </p>
          </div>

          <div className="border border-accent-line/30 bg-slate-50 p-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
              {t('admin.site_settings_preview')}
            </p>
            {previewUrl ? (
              bgType === 'image' ? (
                <img src={previewUrl} alt="" className="w-full aspect-[16/10] object-cover" />
              ) : (
                <video src={previewUrl} className="w-full aspect-[16/10] object-cover" muted controls />
              )
            ) : (
              <p className="text-slate-500 text-sm">{t('admin.site_settings_no_preview')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

