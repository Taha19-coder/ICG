import { NextResponse } from 'next/server';
import { readSiteSettings } from '@/lib/site-settings-server';
import type { PublicSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const storedSettings = await readSiteSettings();
    const settings: PublicSiteSettings = {
      company_name: storedSettings.company_name,
      company_tagline: storedSettings.company_tagline,
      address: storedSettings.address,
      google_maps_url: storedSettings.google_maps_url,
      phone: storedSettings.phone,
      whatsapp: storedSettings.whatsapp,
      email: storedSettings.email,
      whatsapp_business_number: storedSettings.whatsapp_business_number,
    };
    return NextResponse.json(
      { settings },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Unable to load public site settings.', error);
    return NextResponse.json({ message: 'Site settings could not be loaded.' }, { status: 500 });
  }
}
