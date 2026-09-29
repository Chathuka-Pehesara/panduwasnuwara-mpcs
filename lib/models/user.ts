import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export async function findUserByNicOrUsername(identifier: string): Promise<User | null> {
  const clean = identifier.trim();
  if (!clean) return null;

  // Search users table by NIC, username, or phone
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, nic, phone, email, password, role, created_at')
    .or(`nic.ilike.${clean},username.ilike.${clean},phone.eq.${clean}`)
    .limit(1);

  if (!error && data && data.length > 0) {
    return data[0] as User;
  }

  // Fallback check for admin in admin_users
  interface AdminRow {
    id: number;
    username: string;
    password: string;
    role: string;
    created_at: string;
  }

  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('id, username, password, role, created_at')
    .ilike('username', clean)
    .limit(1);

  if (!adminError && adminData && adminData.length > 0) {
    const admin = adminData[0] as AdminRow;
    return {
      id: admin.id,
      username: admin.username,
      full_name: 'Administrator',
      nic: 'ADMIN',
      phone: '',
      password: admin.password,
      role: 'admin',
      created_at: admin.created_at
    };
  }

  return null;
}

export async function findUserById(id: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, nic, phone, email, role, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, nic, phone, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Omit<User, 'password'>[];
}

export async function createUser(params: {
  fullName: string;
  nic: string;
  phone: string;
  password: string;
  email?: string;
}): Promise<User> {
  const cleanNic = params.nic.trim();
  const cleanName = params.fullName.trim();
  const cleanPhone = params.phone.trim();
  const username = cleanNic.toLowerCase();

  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      full_name: cleanName,
      nic: cleanNic,
      phone: cleanPhone,
      email: params.email?.trim() || null,
      password: params.password,
      role: 'user'
    })
    .select('id, username, full_name, nic, phone, email, role, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create user');
  }

  return data as User;
}

export async function updateUser(
  id: number,
  params: {
    fullName?: string;
    nic?: string;
    phone?: string;
    role?: 'user' | 'admin';
    password?: string;
  }
): Promise<User | null> {
  const updates: Record<string, unknown> = {};

  if (params.fullName !== undefined) {
    updates.full_name = params.fullName.trim();
  }
  if (params.nic !== undefined) {
    updates.nic = params.nic.trim();
    updates.username = params.nic.trim().toLowerCase();
  }
  if (params.phone !== undefined) {
    updates.phone = params.phone.trim();
  }
  if (params.role !== undefined) {
    updates.role = params.role;
  }
  if (params.password && params.password.trim().length > 0) {
    updates.password = params.password.trim();
  }

  if (Object.keys(updates).length === 0) {
    return await findUserById(id);
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, username, full_name, nic, phone, email, role, created_at')
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function deleteUser(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  return !error;
}
