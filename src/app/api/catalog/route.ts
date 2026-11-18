import { NextResponse } from 'next/server';
import type { ConstructionProject, Property } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const [propertyResult, projectResult] = await Promise.all([
    supabase
      .from('properties')
      .select('*, property_images(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('construction_projects')
      .select('*, project_images(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ]);

  if (propertyResult.error || projectResult.error) {
    console.error('Unable to load public catalog.', propertyResult.error?.message, projectResult.error?.message);
    return NextResponse.json({ message: 'Listings could not be loaded.' }, { status: 500 });
  }

  const properties = (propertyResult.data ?? []).map((row) => {
    const { property_images, ...property } = row;
    return { ...property, images: property_images ?? [] };
  }) as Property[];
  const projects = (projectResult.data ?? []).map((row) => {
    const { project_images, ...project } = row;
    return { ...project, images: project_images ?? [] };
  }) as ConstructionProject[];

  return NextResponse.json({ properties, projects });
}
