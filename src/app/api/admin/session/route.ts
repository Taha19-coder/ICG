import { NextRequest, NextResponse } from 'next/server';
import {
  adminSessionCookie,
  createAdminSession,
  getAdminSessionEmail,
  verifyAdminCredentials,
} from '@/lib/admin-session';
import { readSiteSettings } from '@/lib/site-settings-server';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

export async function GET(request: NextRequest) {
  const email = getAdminSessionEmail(request);
  if (!email) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, user: { email, name: 'ICG Admin' } });
}

export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ message: 'Admin authentication is not configured.' }, { status: 503 });
  }

  let credentials: { email?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid login request.' }, { status: 400 });
  }

  if (
    typeof credentials.email !== 'string'
    || typeof credentials.password !== 'string'
    || !verifyAdminCredentials(credentials.email, credentials.password)
  ) {
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
  }

  let sessionLifetimeSeconds: number;
  try {
    sessionLifetimeSeconds = (await readSiteSettings()).session_timeout * 60;
  } catch (error) {
    console.error('Unable to load admin session settings.', error);
    return NextResponse.json({ message: 'Could not load admin session settings.' }, { status: 503 });
  }

  const response = NextResponse.json({ authenticated: true, user: { email: adminEmail, name: 'ICG Admin' } });
  response.cookies.set(adminSessionCookie, createAdminSession(adminEmail, sessionLifetimeSeconds), {
    ...cookieOptions(),
    maxAge: sessionLifetimeSeconds,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminSessionCookie, '', { ...cookieOptions(), maxAge: 0 });
  return response;
}
