import { supabase } from '@/lib/supabase';

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return defaultValue;
  return data.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({
      key,
      value: value.trim(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) {
    console.error(`Error setting setting ${key}:`, error);
  }
}

export async function getRecoveryWhatsAppNumber(): Promise<string> {
  return await getSetting('recovery_whatsapp_number', '94771234567');
}

export async function getContactDestinationEmail1(): Promise<string> {
  return await getSetting('contact_destination_email_1', '');
}

export async function getContactDestinationEmail2(): Promise<string> {
  return await getSetting('contact_destination_email_2', '');
}

export async function getContactNotificationEmails(): Promise<string[]> {
  const [email1, email2] = await Promise.all([
    getContactDestinationEmail1(),
    getContactDestinationEmail2()
  ]);

  const emails: string[] = [];
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  if (email1 && isValidEmail(email1)) emails.push(email1.trim());
  if (email2 && isValidEmail(email2)) emails.push(email2.trim());

  return emails;
}
