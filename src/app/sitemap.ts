import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://icg.com.pk';
  const supabase = createServerSupabaseClient();
  const [propertyResult, projectResult] = await Promise.all([
    supabase.from('properties').select('id, updated_at').eq('status', 'published'),
    supabase.from('construction_projects').select('id, updated_at').eq('is_published', true),
  ]);
  if (propertyResult.error || projectResult.error) {
    console.error('Unable to load public catalog for sitemap.', propertyResult.error?.message, projectResult.error?.message);
    throw new Error('Public catalog could not be loaded for the sitemap.');
  }

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  const propertyRoutes = (propertyResult.data ?? []).map((property) => ({
    url: `${baseUrl}/properties/${property.id}`,
    lastModified: new Date(property.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const projectRoutes = (projectResult.data ?? []).map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes, ...projectRoutes];
}