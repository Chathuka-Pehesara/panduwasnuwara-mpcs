import { supabase } from '@/lib/supabase';

export interface BoardMemberDB {
  id: number;
  name_si: string;
  name_en: string;
  position_si: string;
  position_en: string;
  qualification: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  role_type: 'chairman' | 'vice_chairman' | 'director' | 'officer';
  image_src: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardMemberInput {
  name_si: string;
  name_en: string;
  position_si: string;
  position_en: string;
  qualification?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  role_type: 'chairman' | 'vice_chairman' | 'director' | 'officer';
  image_src?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export async function getBoardMembers(activeOnly: boolean = false): Promise<BoardMemberDB[]> {
  let query = supabase
    .from('board_members')
    .select('*')
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching board members from Supabase:', error);
    return [];
  }

  return (data as BoardMemberDB[]) || [];
}

export async function createBoardMember(input: CreateBoardMemberInput): Promise<BoardMemberDB> {
  const { data, error } = await supabase
    .from('board_members')
    .insert({
      name_si: input.name_si.trim(),
      name_en: input.name_en.trim(),
      position_si: input.position_si.trim(),
      position_en: input.position_en.trim(),
      qualification: input.qualification?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      role_type: input.role_type || 'director',
      image_src: input.image_src?.trim() || null,
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create board member');
  }

  return data as BoardMemberDB;
}

export async function updateBoardMember(id: number, input: Partial<CreateBoardMemberInput>): Promise<BoardMemberDB | null> {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };

  if (input.name_si !== undefined) updatePayload.name_si = input.name_si.trim();
  if (input.name_en !== undefined) updatePayload.name_en = input.name_en.trim();
  if (input.position_si !== undefined) updatePayload.position_si = input.position_si.trim();
  if (input.position_en !== undefined) updatePayload.position_en = input.position_en.trim();
  if (input.qualification !== undefined) updatePayload.qualification = input.qualification?.trim() || null;
  if (input.phone !== undefined) updatePayload.phone = input.phone?.trim() || null;
  if (input.email !== undefined) updatePayload.email = input.email?.trim() || null;
  if (input.address !== undefined) updatePayload.address = input.address?.trim() || null;
  if (input.role_type !== undefined) updatePayload.role_type = input.role_type;
  if (input.image_src !== undefined) updatePayload.image_src = input.image_src?.trim() || null;
  if (input.display_order !== undefined) updatePayload.display_order = input.display_order;
  if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

  const { data, error } = await supabase
    .from('board_members')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating board member:', error);
    return null;
  }

  return data as BoardMemberDB;
}

export async function deleteBoardMember(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting board member:', error);
    return false;
  }

  return true;
}
