import { isSupabaseConfigured, supabase } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError } from '@/shared/lib';

export type LocalizedText = { en?: string; es?: string };

export type SiteSettings = {
  id: 'global';
  hero_title: LocalizedText;
  hero_subtitle: LocalizedText;
  hero_cta: LocalizedText;
  hero_background_type: 'video' | 'image';
  hero_background_object_path: string;
  updated_at: string;
};

type SiteSettingsUpdate = Pick<
  SiteSettings,
  | 'hero_title'
  | 'hero_subtitle'
  | 'hero_cta'
  | 'hero_background_type'
  | 'hero_background_object_path'
  | 'updated_at'
>;

function requireSupabase(operation: string) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError({ operation });
}

export const siteSettingsRepo = {
  async getGlobal(): Promise<SiteSettings | null> {
    requireSupabase('siteSettingsRepo.getGlobal');

    const { data, error } = await supabase!
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) throw normalizeSupabaseError(error, { operation: 'siteSettingsRepo.getGlobal' });
    return (data as SiteSettings | null) ?? null;
  },

  async upsertGlobal(payload: Omit<SiteSettingsUpdate, 'updated_at'>): Promise<SiteSettings> {
    requireSupabase('siteSettingsRepo.upsertGlobal');

    const row: SiteSettings & { id: string } = {
      id: 'global',
      hero_title: payload.hero_title ?? {},
      hero_subtitle: payload.hero_subtitle ?? {},
      hero_cta: payload.hero_cta ?? {},
      hero_background_type: payload.hero_background_type,
      hero_background_object_path: payload.hero_background_object_path ?? '',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase!.from('site_settings').upsert(row).select('*').single();
    if (error) throw normalizeSupabaseError(error, { operation: 'siteSettingsRepo.upsertGlobal' });
    return data as SiteSettings;
  },
};

