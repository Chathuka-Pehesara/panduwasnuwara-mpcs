import { supabase } from '@/lib/supabase';
import { MembershipApplication } from '@/lib/types';

export interface CreateMembershipApplicationInput {
  user_id?: number | null;
  full_name_si: string;
  full_name_en: string;
  address: string;
  postal_address: string;
  nic: string;
  phone: string;
  email?: string | null;
  certified_form_photo: string;
}

export async function createMembershipApplication(data: CreateMembershipApplicationInput): Promise<MembershipApplication> {
  const { data: inserted, error } = await supabase
    .from('membership_applications')
    .insert({
      user_id: data.user_id || null,
      full_name_si: data.full_name_si.trim(),
      full_name_en: data.full_name_en.trim(),
      address: data.address.trim(),
      postal_address: data.postal_address.trim(),
      nic: data.nic.trim().toUpperCase(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      certified_form_photo: data.certified_form_photo,
      status: 'pending'
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || 'Failed to create membership application');
  }

  return inserted;
}

export async function getMembershipApplications(status?: string): Promise<MembershipApplication[]> {
  let queryBuilder = supabase
    .from('membership_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    console.error('Error fetching membership applications from Supabase:', error);
    return [];
  }

  return data || [];
}

export async function getMembershipApplicationById(id: number): Promise<MembershipApplication | null> {
  const { data, error } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function updateMembershipApplicationStatus(
  id: number,
  status: 'pending' | 'approved' | 'rejected',
  adminNotes?: string
): Promise<MembershipApplication | null> {
  const updatePayload: any = {
    status,
    updated_at: new Date().toISOString()
  };
  if (adminNotes !== undefined) {
    updatePayload.admin_notes = adminNotes;
  }

  const { data, error } = await supabase
    .from('membership_applications')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating application status in Supabase:', error);
    return null;
  }

  return data;
}

export interface UpdateMembershipApplicationInput {
  full_name_si?: string;
  full_name_en?: string;
  address?: string;
  postal_address?: string;
  nic?: string;
  phone?: string;
  email?: string | null;
  certified_form_photo?: string;
  status?: 'pending' | 'approved' | 'rejected';
  admin_notes?: string | null;
}

export async function updateMembershipApplication(
  id: number,
  data: UpdateMembershipApplicationInput
): Promise<MembershipApplication | null> {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };

  if (data.full_name_si !== undefined) updatePayload.full_name_si = data.full_name_si.trim();
  if (data.full_name_en !== undefined) updatePayload.full_name_en = data.full_name_en.trim();
  if (data.address !== undefined) updatePayload.address = data.address.trim();
  if (data.postal_address !== undefined) updatePayload.postal_address = data.postal_address.trim();
  if (data.nic !== undefined) updatePayload.nic = data.nic.trim().toUpperCase();
  if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
  if (data.email !== undefined) updatePayload.email = data.email?.trim() || null;
  if (data.certified_form_photo !== undefined) updatePayload.certified_form_photo = data.certified_form_photo.trim();
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.admin_notes !== undefined) updatePayload.admin_notes = data.admin_notes?.trim() || null;

  const { data: updated, error } = await supabase
    .from('membership_applications')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error updating membership application in Supabase:', error);
    return null;
  }

  return updated;
}

export async function deleteMembershipApplication(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('membership_applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting membership application from Supabase:', error);
    return false;
  }

  return true;
}
