import { supabase } from '@/lib/supabase';

export async function seedSettings(): Promise<void> {
  const { data: whatsappSetting } = await supabase
    .from('settings')
    .select('key')
    .eq('key', 'recovery_whatsapp_number')
    .maybeSingle();

  if (!whatsappSetting) {
    await supabase.from('settings').insert({
      key: 'recovery_whatsapp_number',
      value: '94771234567'
    });
  }

  const { data: yearsSetting } = await supabase
    .from('settings')
    .select('key')
    .eq('key', 'years_of_service')
    .maybeSingle();

  if (!yearsSetting) {
    await supabase.from('settings').insert({
      key: 'years_of_service',
      value: '50'
    });
  }
}
