import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionEmail } from '@/lib/admin-session';
import { readSiteSettings, siteSettingsSchema, writeSiteSettings } from '@/lib/site-settings-server';

export async function GET(request: NextRequest) {
  if (!getAdminSessionEmail(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    return NextResponse.json({ settings: await readSiteSettings() });
  } catch (error) {
    console.error('Unable to load site settings.', error);
    return NextResponse.json({ message: 'Settings could not be loaded.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!getAdminSessionEmail(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const parsed = siteSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Settings are invalid.', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    await writeSiteSettings(parsed.data);
    return NextResponse.json({ settings: parsed.data });
  } catch (error) {
    console.error('Unable to save site settings.', error);
    return NextResponse.json({ message: 'Settings could not be saved.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!getAdminSessionEmail(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const parsed = siteSettingsSchema.partial().strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data || {}).length === 0) {
    return NextResponse.json({ message: 'A valid setting is required.' }, { status: 400 });
  }

  try {
    await writeSiteSettings(parsed.data);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Unable to save site setting.', error);
    return NextResponse.json({ message: 'Setting could not be saved.' }, { status: 500 });
  }
}
