export interface SiteSettings {
  company_name: string;
  company_tagline: string;
  address: string;
  google_maps_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  whatsapp_business_number: string;
  session_timeout: number;
}

export type PublicSiteSettings = Omit<SiteSettings, 'session_timeout'>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  company_name: 'ICG — Investment and Construction Group',
  company_tagline: 'Building Spaces. Creating Value.',
  address: '123 Main Boulevard, Gulberg III, Lahore, Pakistan',
  google_maps_url: 'https://maps.google.com/?q=ICG+Investment+Construction+Group+Lahore',
  phone: '+92 42 111 424 424',
  whatsapp: '+92 300 1234567',
  email: 'info@icg.com.pk',
  whatsapp_business_number: '+92 300 1234567',
  session_timeout: 60,
};
