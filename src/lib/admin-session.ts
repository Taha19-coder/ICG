import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const adminSessionCookie = 'icg_admin_session';
export const adminSessionLifetimeSeconds = 60 * 60 * 8;

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Admin session signing secret is not configured.');
  return secret;
}

function constantTimeEqual(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;

  return constantTimeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())
    && constantTimeEqual(password, expectedPassword);
}

export function createAdminSession(email: string, lifetimeSeconds = adminSessionLifetimeSeconds): string {
  const payload = Buffer.from(JSON.stringify({
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + lifetimeSeconds * 1000,
  })).toString('base64url');
  const signature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function getAdminSessionEmail(request: NextRequest): string | null {
  const token = request.cookies.get(adminSessionCookie)?.value;
  if (!token) return null;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;
  const payload = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const expectedSignature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (
      typeof session.email !== 'string'
      || !expectedEmail
      || session.email !== expectedEmail
      || typeof session.expiresAt !== 'number'
      || session.expiresAt <= Date.now()
    ) {
      return null;
    }
    return session.email;
  } catch {
    return null;
  }
}
