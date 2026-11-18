'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Edit, ImagePlus, Plus, Trash2 } from 'lucide-react';
import type { ConstructionProject, Property, PropertyImage, ProjectImage } from '@/lib/types';
import { PROPERTY_TYPES, LAHORE_SOCIETIES, PROJECT_STATUSES } from '@/lib/types';
import { compressImage } from '@/lib/catalog-store';

type CatalogKind = 'properties' | 'projects';
type CatalogEntry = Property | ConstructionProject;
type DraftImage = { url: string; alt: string };

function listValue(value: FormDataEntryValue | null): string[] {
  return String(value || '').split('\n').map(item => item.trim()).filter(Boolean);
}

function numericValue(data: FormData, key: string): number {
  const value = Number(data.get(key));
  return Number.isFinite(value) ? value : 0;
}

export function CatalogManager({ kind, editId }: { kind: CatalogKind; editId?: string }) {
  const isProperty = kind === 'properties';
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const [images, setImages] = useState<DraftImage[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      try {
        const response = await fetch(`/api/admin/catalog?kind=${kind}`, { cache: 'no-store' });
        const result = await response.json() as {
          properties?: Property[];
          projects?: ConstructionProject[];
          message?: string;
        };
        if (!response.ok) throw new Error(result.message || 'Could not load saved listings.');
        if (active) {
          const loadedProperties = result.properties || [];
          const loadedProjects = result.projects || [];
          setProperties(loadedProperties);
          setProjects(loadedProjects);

          if (editId) {
            const entries = isProperty ? loadedProperties : loadedProjects;
            const entry = entries.find(item => item.id === editId);
            if (entry) {
              setSelected(entry);
              setImages(entry.images.map(image => ({ url: image.url, alt: image.alt })));
              setIsOpen(true);
              setError('');
            } else {
              setError(`${isProperty ? 'Property' : 'Project'} not found.`);
            }
          } else {
            setError('');
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load saved listings.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadListings();
    return () => { active = false; };
  }, [editId, isProperty, kind]);

  const entries: CatalogEntry[] = isProperty ? properties : projects;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(entry =>
      `${entry.title} ${entry.location} ${entry.reference_id}`.toLowerCase().includes(query)
    );
  }, [entries, search]);

  const openNew = () => {
    setSelected(null);
    setImages([]);
    setError('');
    setNotice('');
    setIsOpen(true);
  };

  const openEdit = (entry: CatalogEntry) => {
    setSelected(entry);
    setImages(entry.images.map(image => ({ url: image.url, alt: image.alt })));
    setError('');
    setNotice('');
    setIsOpen(true);
  };

  const addImageUrl = (form: HTMLFormElement | null) => {
    if (!form) return;
    const data = new FormData(form);
    const url = String(data.get('new_image_url') || '').trim();
    const alt = String(data.get('new_image_alt') || '').trim();
    if (!url) return;
    setImages(current => [...current, { url, alt: alt || 'Listing image' }]);
    const urlInput = form.querySelector<HTMLInputElement>('[name="new_image_url"]');
    const altInput = form.querySelector<HTMLInputElement>('[name="new_image_alt"]');
    if (urlInput) urlInput.value = '';
    if (altInput) altInput.value = '';
  };

  const addImageFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    try {
      const newImages = await Promise.all(files.map(async file => ({
        url: await compressImage(file),
        alt: file.name.replace(/\.[^.]+$/, ''),
      })));
      setImages(current => [...current, ...newImages]);
      setError('');
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Could not process the selected image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleDelete = async (entry: CatalogEntry) => {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch('/api/admin/catalog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, id: entry.id }),
      });
      const result = await response.json() as { message?: string; warning?: string };
      if (!response.ok) throw new Error(result.message || 'Could not delete the listing.');
      if (isProperty) setProperties(current => current.filter(property => property.id !== entry.id));
      else setProjects(current => current.filter(project => project.id !== entry.id));
      setNotice(result.warning || `${isProperty ? 'Property' : 'Project'} deleted.`);
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not delete the listing.');
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    const id = selected?.id || crypto.randomUUID();
    setError('');
    setIsSaving(true);

    try {
      if (isProperty) {
        const old = selected as Property | null;
        const propertyId = id;
        const record: Property = {
          id,
          title: String(data.get('title') || '').trim(),
          description: String(data.get('description') || '').trim(),
          property_type: String(data.get('property_type') || 'house') as Property['property_type'],
          purpose: String(data.get('purpose') || 'buy') as Property['purpose'],
          price: numericValue(data, 'price'),
          location: String(data.get('location') || '').trim(),
          society: String(data.get('society') || '').trim(),
          bedrooms: numericValue(data, 'bedrooms'),
          bathrooms: numericValue(data, 'bathrooms'),
          kitchens: numericValue(data, 'kitchens'),
          floors: numericValue(data, 'floors'),
          covered_area: numericValue(data, 'covered_area'),
          plot_size: numericValue(data, 'plot_size'),
          area_unit: String(data.get('area_unit') || 'sqft') as Property['area_unit'],
          parking: numericValue(data, 'parking'),
          furnishing_status: String(data.get('furnishing_status') || 'unfurnished') as Property['furnishing_status'],
          features: listValue(data.get('features')),
          nearby_landmarks: listValue(data.get('nearby_landmarks')),
          status: String(data.get('status') || 'published') as Property['status'],
          is_featured: data.get('is_featured') === 'on',
          reference_id: String(data.get('reference_id') || '').trim() || `ICG-${Date.now()}`,
          created_at: old?.created_at || now,
          updated_at: now,
          images: images.map((image, index): PropertyImage => ({
            id: old?.images[index]?.id || crypto.randomUUID(),
            property_id: propertyId,
            url: image.url,
            alt: image.alt,
            is_primary: index === 0,
            sort_order: index,
            created_at: old?.images[index]?.created_at || now,
          })),
        };
        if (!record.title || !record.description || !record.location || !record.society || record.price <= 0) {
          throw new Error('Complete the title, description, location, society, and a price greater than zero.');
        }
        const response = await fetch('/api/admin/catalog', {
          method: selected ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, record }),
        });
        const result = await response.json() as { entry?: Property; message?: string };
        if (!response.ok || !result.entry) throw new Error(result.message || 'Could not save the property.');
        setProperties(current => selected
          ? current.map(item => item.id === id ? result.entry! : item)
          : [result.entry!, ...current]);
      } else {
        const old = selected as ConstructionProject | null;
        const record: ConstructionProject = {
          id,
          title: String(data.get('title') || '').trim(),
          description: String(data.get('description') || '').trim(),
          short_description: String(data.get('short_description') || '').trim(),
          location: String(data.get('location') || '').trim(),
          status: String(data.get('status') || 'upcoming') as ConstructionProject['status'],
          progress_percentage: Math.min(100, Math.max(0, numericValue(data, 'progress_percentage'))),
          expected_completion_date: String(data.get('expected_completion_date') || '') || null,
          key_features: listValue(data.get('key_features')),
          payment_plan: String(data.get('payment_plan') || '').trim() || null,
          available_units: numericValue(data, 'available_units'),
          total_units: numericValue(data, 'total_units'),
          reference_id: String(data.get('reference_id') || '').trim() || `PRJ-${Date.now()}`,
          is_published: data.get('is_published') === 'on',
          created_at: old?.created_at || now,
          updated_at: now,
          images: images.map((image, index): ProjectImage => ({
            id: old?.images[index]?.id || crypto.randomUUID(),
            project_id: id,
            url: image.url,
            alt: image.alt,
            is_primary: index === 0,
            sort_order: index,
            created_at: old?.images[index]?.created_at || now,
          })),
        };
        if (!record.title || !record.description || !record.short_description || !record.location) {
          throw new Error('Complete the title, short description, full description, and location.');
        }
        const response = await fetch('/api/admin/catalog', {
          method: selected ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, record }),
        });
        const result = await response.json() as { entry?: ConstructionProject; message?: string };
        if (!response.ok || !result.entry) throw new Error(result.message || 'Could not save the project.');
        setProjects(current => selected
          ? current.map(item => item.id === id ? result.entry! : item)
          : [result.entry!, ...current]);
      }
      setIsOpen(false);
      setNotice(`${isProperty ? 'Property' : 'Project'} ${selected ? 'updated' : 'added'} successfully.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const value = (key: string, fallback = '') => {
    if (!selected) return fallback;
    return String((selected as unknown as Record<string, unknown>)[key] ?? fallback);
  };
  const textAreaValue = (key: string) => {
    const raw = selected ? (selected as unknown as Record<string, unknown>)[key] : [];
    return Array.isArray(raw) ? raw.join('\n') : String(raw || '');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-light tracking-tight text-deep-black">
            {isProperty ? 'Properties' : 'Construction Projects'}
          </h1>
          <p className="mt-1 text-medium-grey">Add, edit, publish, and remove your {kind}.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add {isProperty ? 'Property' : 'Project'}
        </button>
      </header>

      <p className="border border-light-grey bg-off-white p-4 text-sm text-charcoal">
        Listings are stored in Supabase. Published entries appear on the public website.
      </p>
      {notice && <p className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
      {error && !isOpen && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      <div className="card p-4">
        <label className="sr-only" htmlFor={`${kind}-search`}>Search {kind}</label>
        <input id={`${kind}-search`} className="input-field" placeholder={`Search ${kind}...`} value={search} onChange={event => setSearch(event.target.value)} />
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-medium-grey" role="status">Loading {kind} from the database...</div>
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(entry => (
            <article key={entry.id} className="card overflow-hidden">
              <div className="aspect-[16/9] bg-off-white">
                {entry.images[0]?.url
                  ? <img src={entry.images[0].url} alt={entry.images[0].alt} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center text-medium-grey"><Building2 aria-hidden="true" /></div>}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-deep-black">{entry.title}</h2>
                    <p className="text-sm text-medium-grey">{entry.location}</p>
                  </div>
                  <span className="shrink-0 rounded bg-off-white px-2 py-1 text-xs capitalize text-charcoal">{entry.status}</span>
                </div>
                <p className="line-clamp-2 text-sm text-medium-grey">{entry.description}</p>
                <p className="text-xs font-mono text-medium-grey">{entry.reference_id}</p>
                <div className="flex items-center justify-between border-t border-light-grey pt-3">
                  <Link href={isProperty ? `/properties/${entry.id}` : `/projects/${entry.id}`} target="_blank" className="text-sm text-charcoal underline">View listing</Link>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(entry)} className="btn-secondary px-3 py-2" aria-label={`Edit ${entry.title}`}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(entry)} className="border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50" aria-label={`Delete ${entry.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-medium-grey">No {kind} found. Add one to get started.</div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-deep-black/60 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <section className="mx-auto my-6 max-w-4xl bg-pure-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="catalog-form-title">
            <div className="flex items-center justify-between border-b border-light-grey p-5 sm:p-7">
              <h2 id="catalog-form-title" className="text-2xl font-heading text-deep-black">
                {selected ? 'Edit' : 'Add'} {isProperty ? 'Property' : 'Construction Project'}
              </h2>
              <button type="button" className="text-medium-grey hover:text-deep-black" onClick={() => setIsOpen(false)} aria-label="Close editor">Close</button>
            </div>
            <form key={selected?.id || 'new'} onSubmit={handleSave} className="space-y-6 p-5 sm:p-7">
              {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="label-field sm:col-span-2">Title
                  <input required name="title" defaultValue={value('title')} className="input-field mt-2" />
                </label>
                <label className="label-field">Reference ID
                  <input name="reference_id" defaultValue={value('reference_id')} placeholder="Auto-generated if blank" className="input-field mt-2" />
                </label>
                <label className="label-field">Location
                  <input required name="location" defaultValue={value('location')} className="input-field mt-2" />
                </label>
                {isProperty ? (
                  <>
                    <label className="label-field">Property type
                      <select name="property_type" defaultValue={value('property_type', 'house')} className="input-field mt-2">
                        {PROPERTY_TYPES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                    <label className="label-field">Sale or rent
                      <select name="purpose" defaultValue={value('purpose', 'buy')} className="input-field mt-2">
                        <option value="buy">For sale</option><option value="rent">For rent</option>
                      </select>
                    </label>
                    <label className="label-field">Society
                      <input name="society" required list="lahore-societies" defaultValue={value('society')} className="input-field mt-2" />
                      <datalist id="lahore-societies">{LAHORE_SOCIETIES.map(society => <option key={society} value={society} />)}</datalist>
                    </label>
                    <label className="label-field">Price (PKR)
                      <input name="price" type="number" min="1" required defaultValue={value('price', '0')} className="input-field mt-2" />
                    </label>
                    {[
                      ['bedrooms', 'Bedrooms'], ['bathrooms', 'Bathrooms'], ['kitchens', 'Kitchens'], ['floors', 'Floors'],
                      ['covered_area', 'Covered area'], ['plot_size', 'Plot size'], ['parking', 'Parking spaces'],
                    ].map(([name, label]) => <label key={name} className="label-field">{label}
                      <input name={name} type="number" min="0" defaultValue={value(name, '0')} className="input-field mt-2" />
                    </label>)}
                    <label className="label-field">Area unit
                      <select name="area_unit" defaultValue={value('area_unit', 'marla')} className="input-field mt-2">
                        <option value="sqft">Square feet</option><option value="sqyd">Square yards</option><option value="marla">Marla</option><option value="kanal">Kanal</option>
                      </select>
                    </label>
                    <label className="label-field">Furnishing
                      <select name="furnishing_status" defaultValue={value('furnishing_status', 'unfurnished')} className="input-field mt-2">
                        <option value="unfurnished">Unfurnished</option><option value="semi_furnished">Semi-furnished</option><option value="furnished">Furnished</option>
                      </select>
                    </label>
                    <label className="label-field">Listing status
                      <select name="status" defaultValue={value('status', 'published')} className="input-field mt-2">
                        <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-charcoal"><input name="is_featured" type="checkbox" defaultChecked={value('is_featured') === 'true'} /> Feature this property</label>
                    <label className="label-field sm:col-span-2">Features (one per line)
                      <textarea name="features" rows={3} defaultValue={textAreaValue('features')} className="input-field mt-2" />
                    </label>
                    <label className="label-field sm:col-span-2">Nearby landmarks (one per line)
                      <textarea name="nearby_landmarks" rows={3} defaultValue={textAreaValue('nearby_landmarks')} className="input-field mt-2" />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="label-field sm:col-span-2">Short description
                      <textarea required name="short_description" rows={2} defaultValue={value('short_description')} className="input-field mt-2" />
                    </label>
                    <label className="label-field">Project status
                      <select name="status" defaultValue={value('status', 'upcoming')} className="input-field mt-2">
                        {PROJECT_STATUSES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                    <label className="label-field">Progress (%)
                      <input name="progress_percentage" type="number" min="0" max="100" defaultValue={value('progress_percentage', '0')} className="input-field mt-2" />
                    </label>
                    <label className="label-field">Expected completion
                      <input name="expected_completion_date" type="date" defaultValue={value('expected_completion_date')} className="input-field mt-2" />
                    </label>
                    <label className="label-field">Units available
                      <input name="available_units" type="number" min="0" defaultValue={value('available_units', '0')} className="input-field mt-2" />
                    </label>
                    <label className="label-field">Total units
                      <input name="total_units" type="number" min="0" defaultValue={value('total_units', '0')} className="input-field mt-2" />
                    </label>
                    <label className="label-field sm:col-span-2">Payment plan
                      <textarea name="payment_plan" rows={2} defaultValue={value('payment_plan')} className="input-field mt-2" />
                    </label>
                    <label className="label-field sm:col-span-2">Key features (one per line)
                      <textarea name="key_features" rows={4} defaultValue={textAreaValue('key_features')} className="input-field mt-2" />
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-charcoal"><input name="is_published" type="checkbox" defaultChecked={selected ? value('is_published') === 'true' : true} /> Publish on website</label>
                  </>
                )}
                <label className="label-field sm:col-span-2">{isProperty ? 'Full description' : 'Project description'}
                  <textarea required name="description" rows={5} defaultValue={value('description')} className="input-field mt-2" />
                </label>
              </div>

              <div className="space-y-4 border-t border-light-grey pt-5">
                <h3 className="font-semibold text-deep-black">Images</h3>
                <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-medium-grey p-5 text-sm text-charcoal hover:bg-off-white">
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  Upload image files (compressed for browser storage)
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={addImageFiles} />
                </label>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input name="new_image_url" type="url" placeholder="Image URL" className="input-field" />
                  <input name="new_image_alt" placeholder="Image description" className="input-field" />
                  <button type="button" onClick={event => addImageUrl(event.currentTarget.form)} className="btn-secondary">Add URL</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {images.map((image, index) => (
                    <div key={`${image.url}-${index}`} className="flex items-center gap-3 border border-light-grey p-2">
                      <img src={image.url} alt={image.alt} className="h-14 w-20 object-cover" />
                      <p className="min-w-0 flex-1 truncate text-sm text-charcoal">{image.alt || image.url}</p>
                      <button type="button" onClick={() => setImages(current => current.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-red-700" aria-label={`Remove image ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-light-grey pt-5">
                <button type="button" className="btn-secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : selected ? 'Save changes' : 'Create listing'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
