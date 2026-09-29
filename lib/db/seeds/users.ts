import { supabase } from '@/lib/supabase';

export async function seedUsers(): Promise<void> {
  // Ensure default system administrator exists in users
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'admin')
    .maybeSingle();

  if (!existingUser) {
    await supabase.from('users').insert({
      username: 'admin',
      full_name: 'System Administrator',
      nic: 'ADMIN',
      phone: '0770000000',
      password: 'admin123',
      role: 'admin'
    });
  }

  // Ensure default system administrator exists in admin_users
  const { data: existingAdmin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('username', 'admin')
    .maybeSingle();

  if (!existingAdmin) {
    await supabase.from('admin_users').insert({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
  }
}
