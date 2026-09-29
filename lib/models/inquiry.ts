import { supabase } from '@/lib/supabase';
import { Inquiry } from '@/lib/types';

export interface CreateInquiryInput {
  business_key: string;
  business_name: string;
  user_id?: number | null;
  user_name: string;
  phone: string;
  email?: string | null;
  subject: string;
  message: string;
}

export async function createInquiry(data: CreateInquiryInput): Promise<Inquiry> {
  const { data: inserted, error } = await supabase
    .from('inquiries')
    .insert({
      business_key: data.business_key,
      business_name: data.business_name,
      user_id: data.user_id || null,
      user_name: data.user_name,
      phone: data.phone,
      email: data.email || null,
      subject: data.subject,
      message: data.message,
      status: 'unread'
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || 'Failed to submit inquiry');
  }

  return inserted;
}

export async function getInquiries(businessKey?: string, status?: string): Promise<Inquiry[]> {
  let queryBuilder = supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (businessKey && businessKey !== 'all') {
    queryBuilder = queryBuilder.eq('business_key', businessKey);
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    console.error('Error fetching inquiries from Supabase:', error);
    return [];
  }

  return data || [];
}

export async function getInquiryById(id: number): Promise<Inquiry | null> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export interface UpdateInquiryInput {
  status?: 'unread' | 'read' | 'replied';
  admin_notes?: string | null;
  reply_message?: string | null;
  replied_at?: string | null;
}

export async function updateInquiry(
  id: number,
  input: UpdateInquiryInput
): Promise<Inquiry | null> {
  const current = await getInquiryById(id);
  if (!current) return null;

  const newStatus = input.status !== undefined ? input.status : current.status;
  const newNotes = input.admin_notes !== undefined ? input.admin_notes : current.admin_notes;
  const newReply = input.reply_message !== undefined ? input.reply_message : current.reply_message;
  let newRepliedAt = input.replied_at !== undefined ? input.replied_at : current.replied_at;

  if (newStatus === 'replied' && !newRepliedAt) {
    newRepliedAt = new Date().toISOString();
  }

  const updatePayload: any = {
    status: newStatus,
    admin_notes: newNotes,
    reply_message: newReply,
    replied_at: newRepliedAt,
    updated_at: new Date().toISOString()
  };

  const { data: updated, error } = await supabase
    .from('inquiries')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error updating inquiry in Supabase:', error);
    return null;
  }

  return updated;
}

export async function updateInquiryStatus(
  id: number,
  status: 'unread' | 'read' | 'replied',
  adminNotes?: string
): Promise<Inquiry | null> {
  return updateInquiry(id, {
    status,
    admin_notes: adminNotes !== undefined ? adminNotes : undefined
  });
}

export async function deleteInquiry(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting inquiry from Supabase:', error);
    return false;
  }

  return true;
}

export async function getInquiryCategoryCounts(): Promise<{ business_key: string; count: number; unread_count: number }[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('business_key, status');

  if (error || !data) return [];

  const map = new Map<string, { count: number; unread_count: number }>();
  for (const item of data) {
    const key = item.business_key || 'general';
    const curr = map.get(key) || { count: 0, unread_count: 0 };
    curr.count++;
    if (item.status === 'unread') curr.unread_count++;
    map.set(key, curr);
  }

  return Array.from(map.entries()).map(([business_key, val]) => ({
    business_key,
    count: val.count,
    unread_count: val.unread_count
  }));
}
