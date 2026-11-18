import 'server-only';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/site-settings';

export const siteSettingsSchema = z.object({
  company_name: z.string().trim().min(1).max(200),
  company_tagline: z.string().trim().min(1).max(300),
  address: z.string().trim().min(1).max(500),
  google_maps_url: z.string().trim().max(2000).refine(value => {
    if (!value) return true;
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter a valid HTTPS map URL.'),
  phone: z.string().trim().min(3).max(40),
  whatsapp: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(254),
  whatsapp_business_number: z.string().trim().min(3).max(40),
  session_timeout: z.number().int().min(5).max(480),
});

export async function readSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await createServerSupabaseClient()
    .from('site_config')
    .select('key, value')
    .in('key', Object.keys(DEFAULT_SITE_SETTINGS));
  if (error) throw new Error(error.message);

  const values = Object.fromEntries((data ?? []).map(row => [row.key, row.value]));
  const parsed = siteSettingsSchema.partial().safeParse(values);
  if (!parsed.success) throw new Error('Stored site settings are invalid.');
  return { ...DEFAULT_SITE_SETTINGS, ...parsed.data };
}

export async function writeSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    description: `ICG ${key.replaceAll('_', ' ')} setting`,
  }));
  const { error } = await createServerSupabaseClient()
    .from('site_config')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}
