import { supabase } from '@/lib/supabase';
import { NewsAnnouncement } from '@/lib/types';

export async function getNewsAnnouncements(publishedOnly: boolean = true): Promise<NewsAnnouncement[]> {
  let queryBuilder = supabase
    .from('news_announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (publishedOnly) {
    queryBuilder = queryBuilder.eq('is_published', true);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    console.error('Error fetching news announcements from Supabase:', error);
    return [];
  }

  return data || [];
}

export async function getNewsById(id: number): Promise<NewsAnnouncement | null> {
  const { data, error } = await supabase
    .from('news_announcements')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export interface CreateNewsInput {
  title_si: string;
  title_en: string;
  description_si: string;
  description_en: string;
  image_url?: string | null;
  category?: string;
  badge_text_si?: string | null;
  badge_text_en?: string | null;
  is_pinned?: boolean;
  is_published?: boolean;
  published_at?: string;
}

export async function createNewsAnnouncement(data: CreateNewsInput): Promise<NewsAnnouncement> {
  const { data: inserted, error } = await supabase
    .from('news_announcements')
    .insert({
      title_si: data.title_si,
      title_en: data.title_en,
      description_si: data.description_si,
      description_en: data.description_en,
      image_url: data.image_url || null,
      category: data.category || 'general',
      badge_text_si: data.badge_text_si || null,
      badge_text_en: data.badge_text_en || null,
      is_pinned: Boolean(data.is_pinned),
      is_published: data.is_published !== false,
      published_at: data.published_at || new Date().toISOString()
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || 'Failed to create news announcement');
  }

  return inserted;
}

export interface UpdateNewsInput {
  title_si?: string;
  title_en?: string;
  description_si?: string;
  description_en?: string;
  image_url?: string | null;
  category?: string;
  badge_text_si?: string | null;
  badge_text_en?: string | null;
  is_pinned?: boolean;
  is_published?: boolean;
  published_at?: string;
}

export async function updateNewsAnnouncement(id: number, data: UpdateNewsInput): Promise<NewsAnnouncement | null> {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };

  if (data.title_si !== undefined) updatePayload.title_si = data.title_si;
  if (data.title_en !== undefined) updatePayload.title_en = data.title_en;
  if (data.description_si !== undefined) updatePayload.description_si = data.description_si;
  if (data.description_en !== undefined) updatePayload.description_en = data.description_en;
  if (data.image_url !== undefined) updatePayload.image_url = data.image_url;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.badge_text_si !== undefined) updatePayload.badge_text_si = data.badge_text_si;
  if (data.badge_text_en !== undefined) updatePayload.badge_text_en = data.badge_text_en;
  if (data.is_pinned !== undefined) updatePayload.is_pinned = data.is_pinned;
  if (data.is_published !== undefined) updatePayload.is_published = data.is_published;
  if (data.published_at !== undefined) updatePayload.published_at = data.published_at;

  const { data: updated, error } = await supabase
    .from('news_announcements')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error updating news announcement in Supabase:', error);
    return null;
  }

  return updated;
}

export async function deleteNewsAnnouncement(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('news_announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news announcement from Supabase:', error);
    return false;
  }

  return true;
}
