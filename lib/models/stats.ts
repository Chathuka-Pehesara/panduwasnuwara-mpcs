import { supabase } from '@/lib/supabase';
import { query as pgQuery } from '@/lib/db';
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
  nic?: string;
  fullName: string;
  address?: string;
  postalAddress?: string;
  gender?: string;
  phone?: string;
  fileName?: string;
  location?: string;
}

export interface VoterRecord {
  voterNumber?: string;
  memberNumber?: string;
  nic?: string;
  fullName: string;
  address?: string;
  postalAddress?: string;
  gender?: string;
  division?: string;
  location?: string;
  fileName?: string;
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
  mode: 'append' | 'replace' | 'replace_file' = 'append',
  fileName?: string
): Promise<number> {
  const cleanFileName = fileName?.trim() || null;

  if (mode === 'replace') {
    await supabase.from('imported_members').delete().neq('id', 0);
  } else if (mode === 'replace_file' && cleanFileName) {
    await supabase.from('imported_members').delete().ilike('file_name', cleanFileName);
  }

  const validRows = records
    .filter(r => r.fullName && r.fullName.trim().length > 0)
    .map(r => {
      const fName = r.fileName?.trim() || cleanFileName;
      const cleanLoc = fName ? fName.replace(/\.[^/.]+$/, "") : (r.location?.trim() || null);
      return {
        member_number: r.memberNumber?.trim() || null,
        nic: r.nic?.trim().toUpperCase() || null,
        full_name: r.fullName.trim(),
        address: r.address?.trim() || null,
        postal_address: r.postalAddress?.trim() || null,
        gender: r.gender?.trim() || null,
        phone: r.phone?.trim() || null,
        file_name: fName,
        location: cleanLoc,
        imported_at: new Date().toISOString()
      };
    });

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
  mode: 'append' | 'replace' | 'replace_file' = 'append',
  fileName?: string
): Promise<number> {
  const cleanFileName = fileName?.trim() || null;

  if (mode === 'replace') {
    await supabase.from('eligible_voters').delete().neq('id', 0);
  } else if (mode === 'replace_file' && cleanFileName) {
    await supabase.from('eligible_voters').delete().ilike('file_name', cleanFileName);
  }

  const validRows = records
    .filter(r => r.fullName && r.fullName.trim().length > 0)
    .map(r => {
      const fName = r.fileName?.trim() || cleanFileName;
      const cleanLoc = fName ? fName.replace(/\.[^/.]+$/, "") : (r.location?.trim() || null);
      return {
        voter_number: (r.voterNumber || r.memberNumber)?.trim() || null,
        member_number: (r.memberNumber || r.voterNumber)?.trim() || null,
        nic: r.nic?.trim().toUpperCase() || null,
        full_name: r.fullName.trim(),
        address: r.address?.trim() || null,
        postal_address: r.postalAddress?.trim() || null,
        gender: r.gender?.trim() || null,
        division: r.division?.trim() || null,
        file_name: fName,
        location: cleanLoc,
        uploaded_at: new Date().toISOString()
      };
    });

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
 * Query imported members with optional search query, file filter, and pagination
 */
export async function getImportedMembersList(
  search?: string,
  limit: number = 50,
  offset: number = 0,
  fileFilter?: string
): Promise<{ members: any[]; total: number }> {
  const sanitizedLimit = Math.min(Math.max(limit, 1), 100);
  const sanitizedOffset = Math.max(offset, 0);

  let query = supabase
    .from('imported_members')
    .select('id, member_number, full_name, nic, address, postal_address, gender, phone, file_name, imported_at', { count: 'exact' });

  if (fileFilter && fileFilter.trim() && fileFilter.trim().toLowerCase() !== 'all') {
    const f = fileFilter.trim();
    if (f.toLowerCase() === 'unassigned') {
      query = query.is('file_name', null);
    } else {
      query = query.or(`file_name.ilike.%${f}%,location.ilike.%${f}%`);
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`full_name.ilike.%${term}%,nic.ilike.%${term}%,member_number.ilike.%${term}%,address.ilike.%${term}%,file_name.ilike.%${term}%`);
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
 * Get distinct imported member files with count of records per file
 */
export async function getMemberFiles(): Promise<{ fileName: string; displayName: string; count: number }[]> {
  try {
    const rows = await pgQuery<{ file_name: string; count: number }>(`
      SELECT 
        COALESCE(NULLIF(TRIM(file_name), ''), CASE WHEN location IS NOT NULL AND TRIM(location) != '' THEN location || '.csv' ELSE 'general_members.csv' END) as file_name,
        COUNT(*)::int as count
      FROM imported_members
      GROUP BY 1
      ORDER BY count DESC
    `);

    return rows.map(r => ({
      fileName: r.file_name,
      displayName: r.file_name.replace(/\.[^/.]+$/, ""),
      count: Number(r.count) || 0
    }));
  } catch (err) {
    console.error('Error fetching member files via pgQuery:', err);
    return [];
  }
}

/**
 * Fetch all imported member records for CSV download (filtered by file name if specified)
 */
export async function getMembersForDownload(fileFilter?: string): Promise<any[]> {
  try {
    if (!fileFilter || fileFilter.trim().toLowerCase() === 'all') {
      return await pgQuery(`
        SELECT member_number, nic, full_name, address, postal_address, gender, phone, file_name, location
        FROM imported_members
        ORDER BY id ASC
      `);
    }

    const clean = fileFilter.trim();
    if (clean.toLowerCase() === 'unassigned' || clean.toLowerCase() === 'general_members.csv' || clean.toLowerCase() === 'general_members') {
      return await pgQuery(`
        SELECT member_number, nic, full_name, address, postal_address, gender, phone, file_name, location
        FROM imported_members
        WHERE file_name IS NULL OR file_name = '' OR file_name ILIKE '%general_members%'
        ORDER BY id ASC
      `);
    }

    const baseName = clean.replace(/\.[^/.]+$/, "");
    return await pgQuery(`
      SELECT member_number, nic, full_name, address, postal_address, gender, phone, file_name, location
      FROM imported_members
      WHERE file_name ILIKE $1 OR file_name ILIKE $2 OR location ILIKE $1 OR location ILIKE $2
      ORDER BY id ASC
    `, [`%${clean}%`, `%${baseName}%`]);
  } catch (err) {
    console.error('Error fetching members for download via pgQuery:', err);
    return [];
  }
}

/**
 * Query eligible voters with optional search query, file name filter, and pagination
 */
export async function getEligibleVotersList(
  search?: string,
  limit: number = 50,
  offset: number = 0,
  fileFilter?: string
): Promise<{ voters: any[]; total: number }> {
  const sanitizedLimit = Math.min(Math.max(limit, 1), 100);
  const sanitizedOffset = Math.max(offset, 0);

  let query = supabase
    .from('eligible_voters')
    .select('id, voter_number, member_number, full_name, nic, address, postal_address, gender, division, location, file_name, uploaded_at', { count: 'exact' });

  if (fileFilter && fileFilter.trim() && fileFilter.trim().toLowerCase() !== 'all') {
    const f = fileFilter.trim();
    if (f.toLowerCase() === 'unassigned' || f.toLowerCase() === 'general_register.csv' || f.toLowerCase() === 'general_register') {
      query = query.is('file_name', null);
    } else {
      query = query.or(`file_name.ilike.%${f}%,location.ilike.%${f}%`);
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`full_name.ilike.%${term}%,nic.ilike.%${term}%,voter_number.ilike.%${term}%,member_number.ilike.%${term}%,address.ilike.%${term}%,file_name.ilike.%${term}%,location.ilike.%${term}%`);
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
 * Get distinct voter files with count of records per file
 */
export async function getVoterFiles(): Promise<{ fileName: string; displayName: string; count: number }[]> {
  try {
    const rows = await pgQuery<{ file_name: string; count: number }>(`
      SELECT 
        COALESCE(NULLIF(TRIM(file_name), ''), CASE WHEN location IS NOT NULL AND TRIM(location) != '' THEN location || '.csv' ELSE 'general_register.csv' END) as file_name,
        COUNT(*)::int as count
      FROM eligible_voters
      GROUP BY 1
      ORDER BY count DESC
    `);

    return rows.map(r => ({
      fileName: r.file_name,
      displayName: r.file_name.replace(/\.[^/.]+$/, ""),
      count: Number(r.count) || 0
    }));
  } catch (err) {
    console.error('Error fetching voter files via pgQuery:', err);
    return [];
  }
}

/**
 * Backward compatibility alias for getVoterFiles
 */
export async function getVoterLocations(): Promise<{ location: string; count: number }[]> {
  const files = await getVoterFiles();
  return files.map(f => ({ location: f.displayName, count: f.count }));
}

/**
 * Fetch all voter records for CSV download (filtered by file name if specified)
 */
export async function getVotersForDownload(fileFilter?: string): Promise<any[]> {
  try {
    if (!fileFilter || fileFilter.trim().toLowerCase() === 'all') {
      return await pgQuery(`
        SELECT voter_number, member_number, nic, full_name, address, postal_address, gender, division, file_name, location
        FROM eligible_voters
        ORDER BY id ASC
      `);
    }

    const clean = fileFilter.trim();
    if (clean.toLowerCase() === 'unassigned' || clean.toLowerCase() === 'general_register.csv' || clean.toLowerCase() === 'general_register') {
      return await pgQuery(`
        SELECT voter_number, member_number, nic, full_name, address, postal_address, gender, division, file_name, location
        FROM eligible_voters
        WHERE file_name IS NULL OR file_name = '' OR file_name ILIKE '%general_register%'
        ORDER BY id ASC
      `);
    }

    const baseName = clean.replace(/\.[^/.]+$/, "");
    return await pgQuery(`
      SELECT voter_number, member_number, nic, full_name, address, postal_address, gender, division, file_name, location
      FROM eligible_voters
      WHERE file_name ILIKE $1 OR file_name ILIKE $2 OR location ILIKE $1 OR location ILIKE $2
      ORDER BY id ASC
    `, [`%${clean}%`, `%${baseName}%`]);
  } catch (err) {
    console.error('Error fetching voters for download via pgQuery:', err);
    return [];
  }
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
