'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS, type PublicSiteSettings } from '@/lib/site-settings';

const defaultPublicSettings: PublicSiteSettings = {
  company_name: DEFAULT_SITE_SETTINGS.company_name,
  company_tagline: DEFAULT_SITE_SETTINGS.company_tagline,
  address: DEFAULT_SITE_SETTINGS.address,
  google_maps_url: DEFAULT_SITE_SETTINGS.google_maps_url,
  phone: DEFAULT_SITE_SETTINGS.phone,
  whatsapp: DEFAULT_SITE_SETTINGS.whatsapp,
  email: DEFAULT_SITE_SETTINGS.email,
  whatsapp_business_number: DEFAULT_SITE_SETTINGS.whatsapp_business_number,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultPublicSettings);

  useEffect(() => {
    let active = true;
    const refreshSettings = async () => {
      try {
        const response = await fetch('/api/site-settings', { cache: 'no-store' });
        const result = await response.json() as { settings?: PublicSiteSettings; message?: string };
        if (!response.ok || !result.settings) {
          throw new Error(result.message || 'Site settings could not be loaded.');
        }
        if (active) setSettings(result.settings);
      } catch (error) {
        if (active) console.error('Unable to refresh public site settings.', error);
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'icg-site-settings-updated') void refreshSettings();
    };
    window.addEventListener('focus', refreshSettings);
    window.addEventListener('icg:site-settings-updated', refreshSettings);
    window.addEventListener('storage', handleStorage);
    void refreshSettings();

    return () => {
      active = false;
      window.removeEventListener('focus', refreshSettings);
      window.removeEventListener('icg:site-settings-updated', refreshSettings);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return settings;
}
