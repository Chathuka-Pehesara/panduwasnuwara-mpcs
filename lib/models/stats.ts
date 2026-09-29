import { supabase } from '@/lib/supabase';
import { getSetting, setSetting } from './setting';

export interface LiveStats {
  membersCount: number;
  votersCount: number;
  businessesCount: number;
  yearsOfService: number;
  updatedAt: string;
}

export interface MemberRecord {
  memberNumber?: string;
  fullName: string;
  nic?: string;
  phone?: string;
}

export interface VoterRecord {
  voterNumber?: string;
  fullName: string;
  nic?: string;
  division?: string;
}

export interface BusinessRecord {
  id?: number;
  key: string;
  titleSi: string;
  titleEn: string;
  manager?: string;
  hotline?: string;
  isActive?: boolean;
}

/**
 * Retrieve aggregated real-time statistics for the frontend counter
 */
export async function getLiveStats(): Promise<LiveStats> {
  // Execute all count queries concurrently for maximum speed
  const [
    { count: membersResCount },
    { count: votersCountRes },
    { count: businessesCountRes },
    yearsSetting
  ] = await Promise.all([
    supabase.from('imported_members').select('*', { count: 'exact', head: true }),
    supabase.from('eligible_voters').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    getSetting('years_of_service', '50')
  ]);

  let membersCount = membersResCount || 0;

  // If no imported members yet, fall back to registered users count as initial baseline
  if (membersCount === 0) {
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    membersCount = usersCount || 0;
  }

  const votersCount = votersCountRes || 0;
  let businessesCount = businessesCountRes || 0;
  if (businessesCount === 0) {
    businessesCount = 10; // 10 core cooperative divisions
  }

  const yearsOfService = parseInt(yearsSetting, 10) || 50;

  return {
    membersCount,
    votersCount,
    businessesCount,
    yearsOfService,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Import members from CSV / parsed tabular records
 */
export async function importMembers(
  records: MemberRecord[],
  mode: 'append' | 'replace' = 'append'
): Promise<number> {
  if (mode === 'replace') {
    await supabase.from('imported_members').delete().neq('id', 0);
  }

  const validRows = records
    .filter(r => r.fullName && r.fullName.trim().length > 0)
    .map(r => ({
      member_number: r.memberNumber?.trim() || null,
      full_name: r.fullName.trim(),
      nic: r.nic?.trim().toUpperCase() || null,
      phone: r.phone?.trim() || null,
      imported_at: new Date().toISOString()
    }));

  if (validRows.length > 0) {
    // Insert in chunks of 200 for optimal performance
    const chunkSize = 200;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const { error } = await supabase.from('imported_members').insert(chunk);
      if (error) {
        console.error('Error batch inserting imported members:', error);
      }
    }
  }

  const { count } = await supabase
    .from('imported_members')
    .select('*', { count: 'exact', head: true });

  return count || 0;
}

/**
 * Upload verified voters from electoral register file
 */
export async function uploadEligibleVoters(
  records: VoterRecord[],
  mode: 'append' | 'replace' = 'append'
): Promise<number> {
  if (mode === 'replace') {
    await supabase.from('eligible_voters').delete().neq('id', 0);
  }

  const validRows = records
    .filter(r => r.fullName && r.fullName.trim().length > 0)
    .map(r => ({
      voter_number: r.voterNumber?.trim() || null,
      full_name: r.fullName.trim(),
      nic: r.nic?.trim().toUpperCase() || null,
      division: r.division?.trim() || null,
      uploaded_at: new Date().toISOString()
    }));

  if (validRows.length > 0) {
    const chunkSize = 200;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const { error } = await supabase.from('eligible_voters').insert(chunk);
      if (error) {
        console.error('Error batch inserting eligible voters:', error);
      }
    }
  }

  const { count } = await supabase
    .from('eligible_voters')
    .select('*', { count: 'exact', head: true });

  return count || 0;
}

/**
 * Query imported members with optional search query and pagination
 */
export async function getImportedMembersList(
  search?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ members: any[]; total: number }> {
  const sanitizedLimit = Math.min(Math.max(limit, 1), 100);
  const sanitizedOffset = Math.max(offset, 0);

  let query = supabase
    .from('imported_members')
    .select('id, member_number, full_name, nic, phone, imported_at', { count: 'exact' });

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`full_name.ilike.%${term}%,nic.ilike.%${term}%,member_number.ilike.%${term}%`);
  }

  const { data, count, error } = await query
    .order('id', { ascending: true })
    .range(sanitizedOffset, sanitizedOffset + sanitizedLimit - 1);

  if (error || !data) {
    console.error('Error fetching imported members list:', error);
    return { members: [], total: 0 };
  }

  return { members: data, total: count || 0 };
}

/**
 * Query eligible voters with optional search query and pagination
 */
export async function getEligibleVotersList(
  search?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ voters: any[]; total: number }> {
  const sanitizedLimit = Math.min(Math.max(limit, 1), 100);
  const sanitizedOffset = Math.max(offset, 0);

  let query = supabase
    .from('eligible_voters')
    .select('id, voter_number, full_name, nic, division, uploaded_at', { count: 'exact' });

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`full_name.ilike.%${term}%,nic.ilike.%${term}%,voter_number.ilike.%${term}%,division.ilike.%${term}%`);
  }

  const { data, count, error } = await query
    .order('id', { ascending: true })
    .range(sanitizedOffset, sanitizedOffset + sanitizedLimit - 1);

  if (error || !data) {
    console.error('Error fetching eligible voters list:', error);
    return { voters: [], total: 0 };
  }

  return { voters: data, total: count || 0 };
}

/**
 * Years of service configuration
 */
export async function getYearsOfService(): Promise<number> {
  const val = await getSetting('years_of_service', '50');
  return parseInt(val, 10) || 50;
}

export async function setYearsOfService(years: number | string): Promise<void> {
  const sanitized = String(parseInt(String(years), 10) || 50);
  await setSetting('years_of_service', sanitized);
}

/**
 * Businesses management
 */
export async function getAllBusinesses(): Promise<BusinessRecord[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, key, title_si, title_en, manager, hotline, is_active')
    .order('id', { ascending: true });

  if (error || !data) return [];

  return data.map(r => ({
    id: r.id,
    key: r.key,
    titleSi: r.title_si,
    titleEn: r.title_en,
    manager: r.manager || undefined,
    hotline: r.hotline || undefined,
    isActive: r.is_active
  }));
}
