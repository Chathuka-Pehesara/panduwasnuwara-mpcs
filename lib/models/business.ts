import { supabase } from '@/lib/supabase';
import { BusinessItem } from '@/lib/types';
import { seedBusinesses } from '@/lib/db/seeds/businesses';

export async function getAllBusinesses(onlyActive: boolean = false): Promise<BusinessItem[]> {
  let queryBuilder = supabase
    .from('businesses')
    .select(`
      id, key, title_si, title_en, tagline_si, tagline_en,
      category_si, category_en, description_si, description_en,
      manager, location, hotline, image_src, cover_image, is_new, is_active, display_order,
      services, services_en, created_at, updated_at
    `)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  if (onlyActive) {
    queryBuilder = queryBuilder.eq('is_active', true);
  }

  let { data, error } = await queryBuilder;

  // Only trigger initial seed if table is completely empty
  if (!error && (!data || data.length === 0)) {
    await seedBusinesses();
    const retry = await queryBuilder;
    data = retry.data;
  }

  if (error) {
    console.error('Error fetching businesses from Supabase:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    key: r.key,
    title_si: r.title_si,
    title_en: r.title_en,
    tagline_si: r.tagline_si || '',
    tagline_en: r.tagline_en || '',
    category_si: r.category_si || '',
    category_en: r.category_en || '',
    description_si: r.description_si || '',
    description_en: r.description_en || '',
    manager: r.manager || '',
    location: r.location || '',
    hotline: r.hotline || '',
    image_src: r.image_src || '',
    cover_image: r.cover_image || null,
    is_new: Boolean(r.is_new),
    is_active: r.is_active !== false,
    display_order: Number(r.display_order || 0),
    services: Array.isArray(r.services) ? r.services : (typeof r.services === 'string' ? JSON.parse(r.services || '[]') : []),
    services_en: Array.isArray(r.services_en) ? r.services_en : (typeof r.services_en === 'string' ? JSON.parse(r.services_en || '[]') : []),
    created_at: r.created_at,
    updated_at: r.updated_at
  }));
}

export async function getBusinessById(id: number): Promise<BusinessItem | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    services: Array.isArray(data.services) ? data.services : (typeof data.services === 'string' ? JSON.parse(data.services || '[]') : []),
    services_en: Array.isArray(data.services_en) ? data.services_en : (typeof data.services_en === 'string' ? JSON.parse(data.services_en || '[]') : [])
  };
}

export interface CreateBusinessInput {
  key: string;
  title_si: string;
  title_en: string;
  tagline_si?: string;
  tagline_en?: string;
  category_si?: string;
  category_en?: string;
  description_si?: string;
  description_en?: string;
  manager?: string;
  location?: string;
  hotline?: string;
  image_src?: string;
  cover_image?: string;
  is_new?: boolean;
  is_active?: boolean;
  display_order?: number;
  services?: string[];
  services_en?: string[];
}

export async function createBusiness(data: CreateBusinessInput): Promise<BusinessItem> {
  const cleanKey = data.key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  const { data: inserted, error } = await supabase
    .from('businesses')
    .insert({
      key: cleanKey,
      title_si: data.title_si.trim(),
      title_en: data.title_en.trim(),
      tagline_si: data.tagline_si?.trim() || null,
      tagline_en: data.tagline_en?.trim() || null,
      category_si: data.category_si?.trim() || null,
      category_en: data.category_en?.trim() || null,
      description_si: data.description_si?.trim() || null,
      description_en: data.description_en?.trim() || null,
      manager: data.manager?.trim() || null,
      location: data.location?.trim() || null,
      hotline: data.hotline?.trim() || null,
      image_src: data.image_src?.trim() || null,
      cover_image: data.cover_image?.trim() || null,
      is_new: Boolean(data.is_new),
      is_active: data.is_active !== false,
      display_order: Number(data.display_order) || 0,
      services: data.services || [],
      services_en: data.services_en || []
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || 'Failed to create business in Supabase');
  }

  return {
    ...inserted,
    services: Array.isArray(inserted.services) ? inserted.services : [],
    services_en: Array.isArray(inserted.services_en) ? inserted.services_en : []
  };
}

export async function updateBusiness(id: number, data: Partial<CreateBusinessInput>): Promise<BusinessItem | null> {
  const current = await getBusinessById(id);
  if (!current) return null;

  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };

  if (data.title_si !== undefined) updatePayload.title_si = data.title_si.trim();
  if (data.title_en !== undefined) updatePayload.title_en = data.title_en.trim();
  if (data.tagline_si !== undefined) updatePayload.tagline_si = data.tagline_si?.trim() || null;
  if (data.tagline_en !== undefined) updatePayload.tagline_en = data.tagline_en?.trim() || null;
  if (data.category_si !== undefined) updatePayload.category_si = data.category_si?.trim() || null;
  if (data.category_en !== undefined) updatePayload.category_en = data.category_en?.trim() || null;
  if (data.description_si !== undefined) updatePayload.description_si = data.description_si?.trim() || null;
  if (data.description_en !== undefined) updatePayload.description_en = data.description_en?.trim() || null;
  if (data.manager !== undefined) updatePayload.manager = data.manager?.trim() || null;
  if (data.location !== undefined) updatePayload.location = data.location?.trim() || null;
  if (data.hotline !== undefined) updatePayload.hotline = data.hotline?.trim() || null;
  if (data.image_src !== undefined) updatePayload.image_src = data.image_src?.trim() || null;
  if (data.cover_image !== undefined) updatePayload.cover_image = data.cover_image?.trim() || null;
  if (data.is_new !== undefined) updatePayload.is_new = Boolean(data.is_new);
  if (data.is_active !== undefined) updatePayload.is_active = Boolean(data.is_active);
  if (data.display_order !== undefined) updatePayload.display_order = Number(data.display_order);
  if (data.services !== undefined) updatePayload.services = data.services;
  if (data.services_en !== undefined) updatePayload.services_en = data.services_en;

  const { data: updated, error } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error updating business in Supabase:', error);
    return null;
  }

  return {
    ...updated,
    services: Array.isArray(updated.services) ? updated.services : [],
    services_en: Array.isArray(updated.services_en) ? updated.services_en : []
  };
}

export async function deleteBusiness(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting business from Supabase:', error);
    return false;
  }
  return true;
}
