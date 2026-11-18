import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSessionEmail } from '@/lib/admin-session';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const inquiryIdSchema = z.string().uuid();
const updateSchema = z.object({
  id: inquiryIdSchema,
  status: z.enum(['new', 'contacted', 'resolved']),
});
const deleteSchema = z.object({ id: inquiryIdSchema });

export async function GET(request: NextRequest) {
  if (!getAdminSessionEmail(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('id, name, phone, email, inquiry_type, message, property_id, project_id, status, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const propertyIds = Array.from(new Set((inquiries ?? []).flatMap(item => item.property_id ? [item.property_id] : [])));
    const projectIds = Array.from(new Set((inquiries ?? []).flatMap(item => item.project_id ? [item.project_id] : [])));
    const [propertyResult, projectResult] = await Promise.all([
      propertyIds.length
        ? supabase.from('properties').select('id, title').in('id', propertyIds)
        : Promise.resolve({ data: [], error: null }),
      projectIds.length
        ? supabase.from('construction_projects').select('id, title').in('id', projectIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (propertyResult.error || projectResult.error) {
      throw propertyResult.error || projectResult.error;
    }

    const propertyTitles = new Map((propertyResult.data ?? []).map(item => [item.id, item.title]));
    const projectTitles = new Map((projectResult.data ?? []).map(item => [item.id, item.title]));
    return NextResponse.json({
      inquiries: (inquiries ?? []).map(item => ({
        ...item,
        property_title: item.property_id ? propertyTitles.get(item.property_id) ?? null : null,
        project_title: item.project_id ? projectTitles.get(item.project_id) ?? null : null,
      })),
    });
  } catch (error) {
    console.error('Unable to load admin inquiries.', error);
    return NextResponse.json({ message: 'Inquiries could not be loaded.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!getAdminSessionEmail(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'A valid inquiry ID and status are required.' }, { status: 400 });
  }

  try {
    const { data, error } = await createServerSupabaseClient()
      .from('inquiries')
      .update({ status: parsed.data.status })
      .eq('id', parsed.data.id)
      .select('id, status, updated_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 });
    return NextResponse.json({ inquiry: data });
  } catch (error) {
    console.error('Unable to update admin inquiry.', error);
    return NextResponse.json({ message: 'Inquiry status could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!getAdminSessionEmail(request)) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'A valid inquiry ID is required.' }, { status: 400 });
  }

  try {
    const { data, error } = await createServerSupabaseClient()
      .from('inquiries')
      .delete()
      .eq('id', parsed.data.id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Unable to delete admin inquiry.', error);
    return NextResponse.json({ message: 'Inquiry could not be deleted.' }, { status: 500 });
  }
}
