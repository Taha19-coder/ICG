import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSessionEmail } from '@/lib/admin-session';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { ConstructionProject, Property } from '@/lib/types';

const imageSchema = z.object({
  url: z.string().min(1).max(8_000_000),
  alt: z.string().trim().max(250).default('Listing image'),
});

const propertySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(20_000),
  property_type: z.enum(['house', 'apartment', 'penthouse', 'farmhouse', 'residential_plot', 'commercial_property', 'commercial_plot']),
  purpose: z.enum(['buy', 'rent']),
  price: z.number().int().positive(),
  location: z.string().trim().min(1).max(300),
  society: z.string().trim().min(1).max(200),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  kitchens: z.number().int().min(0),
  floors: z.number().int().min(0),
  covered_area: z.number().int().min(0),
  plot_size: z.number().int().min(0),
  area_unit: z.enum(['sqft', 'sqyd', 'marla', 'kanal']),
  parking: z.number().int().min(0),
  furnishing_status: z.enum(['furnished', 'semi_furnished', 'unfurnished']),
  features: z.array(z.string().trim().min(1).max(200)).max(100),
  nearby_landmarks: z.array(z.string().trim().min(1).max(200)).max(100),
  status: z.enum(['published', 'draft', 'archived']),
  is_featured: z.boolean(),
  reference_id: z.string().trim().min(1).max(100),
  images: z.array(imageSchema).max(30).default([]),
});

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(20_000),
  short_description: z.string().trim().min(1).max(500),
  location: z.string().trim().min(1).max(300),
  status: z.enum(['ongoing', 'completed', 'upcoming']),
  progress_percentage: z.number().int().min(0).max(100),
  expected_completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  key_features: z.array(z.string().trim().min(1).max(200)).max(100),
  payment_plan: z.string().trim().max(2000).nullable(),
  available_units: z.number().int().min(0),
  total_units: z.number().int().min(0),
  reference_id: z.string().trim().min(1).max(100),
  is_published: z.boolean(),
  images: z.array(imageSchema).max(30).default([]),
});

type CatalogKind = 'properties' | 'projects';
type ImageDraft = z.infer<typeof imageSchema>;

function isCatalogKind(value: string | null): value is CatalogKind {
  return value === 'properties' || value === 'projects';
}

function mapProperties(rows: Array<Record<string, unknown>>): Property[] {
  return rows.map(({ property_images, ...property }) => ({
    ...property,
    images: property_images ?? [],
  })) as Property[];
}

function mapProjects(rows: Array<Record<string, unknown>>): ConstructionProject[] {
  return rows.map(({ project_images, ...project }) => ({
    ...project,
    images: project_images ?? [],
  })) as ConstructionProject[];
}

function parseImageDataUrl(url: string): { contentType: string; extension: string; bytes: Buffer } | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(url);
  if (!match) return null;
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 5_000_000) throw new Error('Each uploaded image must be smaller than 5 MB.');
  const extension = match[1].toLowerCase().split('/')[1].replace('jpeg', 'jpg');
  return { contentType: match[1].toLowerCase(), extension, bytes };
}

async function storeImages(kind: CatalogKind, entryId: string, images: ImageDraft[]) {
  const supabase = createServerSupabaseClient();
  const bucket = kind === 'properties' ? 'property-images' : 'project-images';

  return Promise.all(images.map(async (image, index) => {
    const dataUrl = parseImageDataUrl(image.url);
    let url = image.url;
    if (dataUrl) {
      const path = `${entryId}/${randomUUID()}.${dataUrl.extension}`;
      const { error } = await supabase.storage.from(bucket).upload(path, dataUrl.bytes, {
        contentType: dataUrl.contentType,
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw new Error(`Image upload failed: ${error.message}`);
      url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    } else {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(image.url);
      } catch {
        throw new Error('Image URL must be a valid HTTP or HTTPS address.');
      }
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new Error('Image URL must use HTTP or HTTPS.');
      }
    }
    return { url, alt: image.alt || 'Listing image', is_primary: index === 0, sort_order: index };
  }));
}

function storedImagePath(bucket: 'property-images' | 'project-images', url: string): string | null {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl) return null;
  const prefix = `${projectUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length));
}

async function removeStoredImages(kind: CatalogKind, urls: string[], retainedUrls: string[] = []) {
  const bucket = kind === 'properties' ? 'property-images' : 'project-images';
  const retained = new Set(retainedUrls);
  const paths = urls
    .filter(url => !retained.has(url))
    .map(url => storedImagePath(bucket, url))
    .filter((path): path is string => Boolean(path));
  if (!paths.length) return;

  const { error } = await createServerSupabaseClient().storage.from(bucket).remove(paths);
  if (error) throw new Error(`Catalog data was saved, but old image files could not be removed: ${error.message}`);
}

async function saveProperty(record: z.infer<typeof propertySchema>, update: boolean) {
  const supabase = createServerSupabaseClient();
  const id = update ? record.id : record.id || randomUUID();
  if (!id) throw new Error('A property ID is required.');

  const oldImagesResult = update
    ? await supabase.from('property_images').select('id, url').eq('property_id', id)
    : { data: [], error: null };
  if (oldImagesResult.error) throw new Error(oldImagesResult.error.message);

  const { images: imageDrafts, ...fields } = record;
  const images = await storeImages('properties', id, imageDrafts);
  const { data: saved, error } = await supabase.from('properties').upsert({
    ...fields,
    id,
  }).select().single();
  if (error) throw new Error(error.message);

  if (images.length) {
    const { error: insertError } = await supabase.from('property_images').insert(
      images.map(image => ({ ...image, property_id: id }))
    );
    if (insertError) throw new Error(`Property saved, but its images could not be saved: ${insertError.message}`);
  }

  const oldIds = (oldImagesResult.data ?? []).map(image => image.id);
  if (oldIds.length) {
    const { error: deleteError } = await supabase.from('property_images').delete().in('id', oldIds);
    if (deleteError) throw new Error(`Property saved, but old image records could not be replaced: ${deleteError.message}`);
  }
  await removeStoredImages('properties', (oldImagesResult.data ?? []).map(image => image.url), images.map(image => image.url));

  const imageRows = await supabase.from('property_images').select('*').eq('property_id', id).order('sort_order');
  if (imageRows.error) throw new Error(imageRows.error.message);
  return { ...saved, images: imageRows.data ?? [] } as Property;
}

async function saveProject(record: z.infer<typeof projectSchema>, update: boolean) {
  const supabase = createServerSupabaseClient();
  const id = update ? record.id : record.id || randomUUID();
  if (!id) throw new Error('A project ID is required.');

  const oldImagesResult = update
    ? await supabase.from('project_images').select('id, url').eq('project_id', id)
    : { data: [], error: null };
  if (oldImagesResult.error) throw new Error(oldImagesResult.error.message);

  const { images: imageDrafts, ...fields } = record;
  const images = await storeImages('projects', id, imageDrafts);
  const { data: saved, error } = await supabase.from('construction_projects').upsert({
    ...fields,
    id,
  }).select().single();
  if (error) throw new Error(error.message);

  if (images.length) {
    const { error: insertError } = await supabase.from('project_images').insert(
      images.map(image => ({ ...image, project_id: id }))
    );
    if (insertError) throw new Error(`Project saved, but its images could not be saved: ${insertError.message}`);
  }

  const oldIds = (oldImagesResult.data ?? []).map(image => image.id);
  if (oldIds.length) {
    const { error: deleteError } = await supabase.from('project_images').delete().in('id', oldIds);
    if (deleteError) throw new Error(`Project saved, but old image records could not be replaced: ${deleteError.message}`);
  }
  await removeStoredImages('projects', (oldImagesResult.data ?? []).map(image => image.url), images.map(image => image.url));

  const imageRows = await supabase.from('project_images').select('*').eq('project_id', id).order('sort_order');
  if (imageRows.error) throw new Error(imageRows.error.message);
  return { ...saved, images: imageRows.data ?? [] } as ConstructionProject;
}

export async function GET(request: NextRequest) {
  if (!getAdminSessionEmail(request)) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });

  const kindParam = new URL(request.url).searchParams.get('kind');
  if (kindParam !== 'all' && !isCatalogKind(kindParam)) {
    return NextResponse.json({ message: 'A valid catalog kind is required.' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const [propertyResult, projectResult] = await Promise.all([
    kindParam === 'projects' ? Promise.resolve({ data: [], error: null }) :
      supabase.from('properties').select('*, property_images(*)').order('created_at', { ascending: false }),
    kindParam === 'properties' ? Promise.resolve({ data: [], error: null }) :
      supabase.from('construction_projects').select('*, project_images(*)').order('created_at', { ascending: false }),
  ]);
  if (propertyResult.error || projectResult.error) {
    console.error('Unable to load admin catalog.', propertyResult.error?.message, projectResult.error?.message);
    return NextResponse.json({ message: 'Listings could not be loaded.' }, { status: 500 });
  }

  return NextResponse.json({
    properties: mapProperties((propertyResult.data ?? []) as Array<Record<string, unknown>>),
    projects: mapProjects((projectResult.data ?? []) as Array<Record<string, unknown>>),
  });
}

export async function POST(request: NextRequest) {
  return saveRequest(request, false);
}

export async function PUT(request: NextRequest) {
  return saveRequest(request, true);
}

async function saveRequest(request: NextRequest, update: boolean) {
  if (!getAdminSessionEmail(request)) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });

  let body: { kind?: unknown; record?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid listing data.' }, { status: 400 });
  }
  if (!isCatalogKind(typeof body.kind === 'string' ? body.kind : null)) {
    return NextResponse.json({ message: 'A valid catalog kind is required.' }, { status: 400 });
  }

  const kind = body.kind;
  const schema = kind === 'properties' ? propertySchema : projectSchema;
  const parsed = schema.safeParse(body.record);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Listing data is invalid.', issues: parsed.error.issues }, { status: 400 });
  }
  if (update && !parsed.data.id) {
    return NextResponse.json({ message: 'An ID is required to update a listing.' }, { status: 400 });
  }

  try {
    const entry = kind === 'properties'
      ? await saveProperty(parsed.data as z.infer<typeof propertySchema>, update)
      : await saveProject(parsed.data as z.infer<typeof projectSchema>, update);
    return NextResponse.json({ entry }, { status: update ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Listing could not be saved.';
    console.error('Unable to save admin listing.', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!getAdminSessionEmail(request)) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });

  let body: { kind?: unknown; id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid delete request.' }, { status: 400 });
  }
  if (
    typeof body.kind !== 'string'
    || !isCatalogKind(body.kind)
    || typeof body.id !== 'string'
    || !z.string().uuid().safeParse(body.id).success
  ) {
    return NextResponse.json({ message: 'A valid catalog kind and listing ID are required.' }, { status: 400 });
  }

  const kind = body.kind;
  const table = kind === 'properties' ? 'properties' : 'construction_projects';
  const imageTable = kind === 'properties' ? 'property_images' : 'project_images';
  const foreignKey = kind === 'properties' ? 'property_id' : 'project_id';
  const supabase = createServerSupabaseClient();
  const { data: images, error: imageReadError } = await supabase.from(imageTable).select('url').eq(foreignKey, body.id);
  if (imageReadError) {
    console.error('Unable to load listing images before deletion.', imageReadError.message);
    return NextResponse.json({ message: 'Listing images could not be loaded.' }, { status: 500 });
  }
  const { error } = await supabase.from(table).delete().eq('id', body.id);
  if (error) {
    console.error('Unable to delete admin listing.', error.message);
    return NextResponse.json({ message: 'Listing could not be deleted.' }, { status: 500 });
  }
  try {
    await removeStoredImages(kind, (images ?? []).map(image => image.url));
    return NextResponse.json({ deleted: true });
  } catch (cleanupError) {
    const warning = cleanupError instanceof Error ? cleanupError.message : 'Listing deleted, but image cleanup failed.';
    console.error('Listing deleted with image cleanup warning.', warning);
    return NextResponse.json({ deleted: true, warning });
  }
}
