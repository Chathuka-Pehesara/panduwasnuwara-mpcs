import { supabase } from '@/lib/supabase';
import { BusinessServiceItem } from '@/lib/types';
import { INITIAL_BUSINESSES } from '@/lib/db/seeds/businesses';

export interface CreateBusinessServiceInput {
  business_key: string;
  title_si: string;
  title_en: string;
  desc_si?: string | null;
  desc_en?: string | null;
  features_si?: string[];
  features_en?: string[];
  display_order?: number;
  is_active?: boolean;
}

export async function getServicesByBusinessKey(
  businessKey: string,
  activeOnly: boolean = true
): Promise<BusinessServiceItem[]> {
  let queryBuilder = supabase
    .from('business_services')
    .select('*')
    .eq('business_key', businessKey)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  if (activeOnly) {
    queryBuilder = queryBuilder.eq('is_active', true);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    console.error('Error fetching business services from Supabase:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    ...r,
    features_si: Array.isArray(r.features_si) ? r.features_si : (typeof r.features_si === 'string' ? JSON.parse(r.features_si || '[]') : []),
    features_en: Array.isArray(r.features_en) ? r.features_en : (typeof r.features_en === 'string' ? JSON.parse(r.features_en || '[]') : [])
  }));
}

export async function getAllBusinessServices(): Promise<BusinessServiceItem[]> {
  let { data, error } = await supabase
    .from('business_services')
    .select('*')
    .order('business_key', { ascending: true })
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  // Only trigger seed if table is completely empty
  if (!error && (!data || data.length === 0)) {
    await seedDefaultBusinessServices();
    const retry = await supabase
      .from('business_services')
      .select('*')
      .order('business_key', { ascending: true })
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });
    data = retry.data;
  }

  if (error) {
    console.error('Error fetching all business services from Supabase:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    ...r,
    features_si: Array.isArray(r.features_si) ? r.features_si : (typeof r.features_si === 'string' ? JSON.parse(r.features_si || '[]') : []),
    features_en: Array.isArray(r.features_en) ? r.features_en : (typeof r.features_en === 'string' ? JSON.parse(r.features_en || '[]') : [])
  }));
}

export async function syncBusinessServicesToBusiness(businessKey: string): Promise<void> {
  try {
    const { data: services } = await supabase
      .from('business_services')
      .select('title_si, title_en')
      .eq('business_key', businessKey)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });

    const servicesSi = (services || []).map(s => s.title_si);
    const servicesEn = (services || []).map(s => s.title_en);

    await supabase
      .from('businesses')
      .update({
        services: servicesSi,
        services_en: servicesEn,
        updated_at: new Date().toISOString()
      })
      .eq('key', businessKey);
  } catch (err) {
    console.error(`Error syncing services to business ${businessKey}:`, err);
  }
}

export async function createBusinessService(data: CreateBusinessServiceInput): Promise<BusinessServiceItem> {
  const { data: inserted, error } = await supabase
    .from('business_services')
    .insert({
      business_key: data.business_key,
      title_si: data.title_si,
      title_en: data.title_en,
      desc_si: data.desc_si || null,
      desc_en: data.desc_en || null,
      features_si: data.features_si || [],
      features_en: data.features_en || [],
      display_order: data.display_order ?? 0,
      is_active: data.is_active ?? true
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || 'Failed to create business service in Supabase');
  }

  const service: BusinessServiceItem = {
    ...inserted,
    features_si: Array.isArray(inserted.features_si) ? inserted.features_si : [],
    features_en: Array.isArray(inserted.features_en) ? inserted.features_en : []
  };

  await syncBusinessServicesToBusiness(service.business_key);
  return service;
}

export async function updateBusinessService(
  id: number,
  data: Partial<CreateBusinessServiceInput>
): Promise<BusinessServiceItem | null> {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  };
  if (data.title_si !== undefined) updatePayload.title_si = data.title_si;
  if (data.title_en !== undefined) updatePayload.title_en = data.title_en;
  if (data.desc_si !== undefined) updatePayload.desc_si = data.desc_si;
  if (data.desc_en !== undefined) updatePayload.desc_en = data.desc_en;
  if (data.features_si !== undefined) updatePayload.features_si = data.features_si;
  if (data.features_en !== undefined) updatePayload.features_en = data.features_en;
  if (data.display_order !== undefined) updatePayload.display_order = data.display_order;
  if (data.is_active !== undefined) updatePayload.is_active = data.is_active;

  const { data: updated, error } = await supabase
    .from('business_services')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error updating business service in Supabase:', error);
    return null;
  }

  const service: BusinessServiceItem = {
    ...updated,
    features_si: Array.isArray(updated.features_si) ? updated.features_si : [],
    features_en: Array.isArray(updated.features_en) ? updated.features_en : []
  };

  await syncBusinessServicesToBusiness(service.business_key);
  return service;
}

export async function deleteBusinessService(id: number): Promise<boolean> {
  // First fetch the business_key for sync
  const { data: target } = await supabase
    .from('business_services')
    .select('business_key')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('business_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting business service from Supabase:', error);
    return false;
  }

  if (target?.business_key) {
    await syncBusinessServicesToBusiness(target.business_key);
  }
  return true;
}

let isServicesSeeded = false;

export async function seedDefaultBusinessServices(): Promise<void> {
  if (isServicesSeeded) return;
  isServicesSeeded = true;

  try {
    // Check and seed Rural Bank if it has no services
    const { count: rbCount } = await supabase
      .from('business_services')
      .select('*', { count: 'exact', head: true })
      .eq('business_key', 'rural-bank');

    if (!rbCount || rbCount === 0) {
      const ruralBankServices = [
        {
          titleEn: 'Savings Accounts',
          titleSi: 'තැන්පතු ගිණුම්',
          descEn: 'Flexible regular savings accounts with competitive interest rates and seamless withdrawals for daily needs.',
          descSi: 'දෛනික අවශ්‍යතා සඳහා පහසු මුදල් ආපසු ගැනීම් සහ ආකර්ෂණීය පොලී අනුපාත සහිත නම්‍යශීලී සාමාන්‍ය ඉතුරුම් ගිණුම්.',
          featuresEn: ['Instant account opening', 'High annual interest', 'Passbook facilities'],
          featuresSi: ['ක්ෂණික ගිණුම් විවෘත කිරීම', 'ඉහළ වාර්ෂික පොලියක්', 'ගිණුම් පොත් පහසුකම්']
        },
        {
          titleEn: 'Fixed Deposits',
          titleSi: 'නියමිත තැන්පතු (ස්ථාවර තැන්පතු)',
          descEn: 'Guaranteed high-yield investment options with flexible tenure terms ranging from 3 months to 5 years.',
          descSi: 'මාස 3 සිට වසර 5 දක්වා නම්‍යශීලී කාලසීමාවන් සහිත උපරිම පොලී ප්‍රතිලාභ සහතික කෙරෙන ආරක්ෂිත ස්ථාවර තැන්පතු.',
          featuresEn: ['Higher interest for seniors', 'Monthly/maturity payout', '100% security guarantee'],
          featuresSi: ['වැඩිහිටියන්ට විශේෂ පොලී අනුපාත', 'මාසික හෝ කල්පිරීමේ පොලිය', '100% සුරක්ෂිතතාවය']
        },
        {
          titleEn: 'Daily Loan Schemes',
          titleSi: 'දිනක ණය ක්‍රම',
          descEn: 'Accessible working capital loans for self-employed individuals, retail vendors, and small agricultural enterprises.',
          descSi: 'ස්වයං රැකියාලාභීන්, වෙළඳුන් සහ ගොවි ප්‍රජාව වෙනුවෙන් පහසු දෛනික ආපසු ගෙවීමේ ක්‍රම සහිත කාරක ප්‍රාග්ධන ණය.',
          featuresEn: ['Fast approval within 24h', 'Minimal documentation', 'Flexible daily repayments'],
          featuresSi: ['පැය 24ක් තුළ කඩිනම් අනුමැතිය', 'අවම ලියකියවිලි', 'පහසු දෛනික ආපසු ගෙවීම්']
        },
        {
          titleEn: 'Gold Pawning & Jewellery Loans',
          titleSi: 'රන් වටිකර ණය පහසුකම්',
          descEn: 'Confidential and highly secure gold pawning facilities with maximum valuation and lowest approved interest rates.',
          descSi: 'උපරිම තක්සේරු වටිනාකමක් සහ අවම පොලියක් සහිත අතිශය රහස්‍ය සහ ආරක්ෂිත රන් ආභරණ උකස් සේවාව.',
          featuresEn: ['Highest advance per sovereign', 'Vault security guarantee', 'Part payment options'],
          featuresSi: ['පවුමකට උපරිම මුදලක්', 'සුරක්ෂිත තැන්පතු සුරක්ෂිතතාව', 'කොටස් වශයෙන් පියවීමේ පහසුකම']
        },
        {
          titleEn: "Children's Savings Schemes",
          titleSi: 'ළමා තැන්පතු ගිණුම්',
          descEn: 'Dedicated savings plans to build a bright future for children with bonus interest and educational rewards.',
          descSi: 'දරුවන්ගේ අනාගතය සුරක්ෂිත කරන විශේෂ ත්‍යාග සහ අධ්‍යාපනික දිරිගැන්වීම් සහිත සුවිශේෂී ළමා ඉතුරුම් සැලසුම්.',
          featuresEn: ['Attractive annual gifts', 'Educational grant bonuses', 'Parental standing orders'],
          featuresSi: ['වාර්ෂික වටිනා ත්‍යාග', 'අධ්‍යාපනික ප්‍රදාන', 'ස්ථාවර නියෝග මඟින් බැර කිරීම']
        },
        {
          titleEn: 'Loan Repayment Orders & Transfers',
          titleSi: 'ණය ආපසු ගෙවීමේ නියෝග',
          descEn: 'Automated inter-branch transfers, standing orders, and institutional payroll deductions for smooth loan servicing.',
          descSi: 'ශාඛා අතර මුදල් මාරුකිරීම්, ස්ථාවර නියෝග සහ ආයතනික වැටුප් අඩුකිරීම් මඟින් ණය පියවීමේ පහසුකම්.',
          featuresEn: ['Network-wide inter-branch access', 'Zero hidden service fees', 'SMS payment updates'],
          featuresSi: ['ශාඛා 22 අතරම සේවා ප්‍රවේශය', 'සැඟවුණු ගාස්තු නොමැත', 'SMS පණිවිඩ මඟින් තහවුරු කිරීම']
        }
      ];

      for (let i = 0; i < ruralBankServices.length; i++) {
        const s = ruralBankServices[i];
        await createBusinessService({
          business_key: 'rural-bank',
          title_si: s.titleSi,
          title_en: s.titleEn,
          desc_si: s.descSi,
          desc_en: s.descEn,
          features_si: s.featuresSi,
          features_en: s.featuresEn,
          display_order: i + 1,
          is_active: true
        });
      }
    }

    // Seed services for all businesses in INITIAL_BUSINESSES (excluding rural-bank which we seeded above)
    for (const b of INITIAL_BUSINESSES) {
      if (b.key === 'rural-bank') continue;
      const { count: bCount } = await supabase
        .from('business_services')
        .select('*', { count: 'exact', head: true })
        .eq('business_key', b.key);

      if (!bCount || bCount === 0) {
        const count = Math.max((b.services || []).length, (b.servicesEn || []).length);
        for (let i = 0; i < count; i++) {
          const titleSi = b.services?.[i] || b.servicesEn?.[i] || `සේවාව ${i + 1}`;
          const titleEn = b.servicesEn?.[i] || b.services?.[i] || `Service ${i + 1}`;
          await createBusinessService({
            business_key: b.key,
            title_si: titleSi,
            title_en: titleEn,
            desc_si: `${b.titleSi} මඟින් පිරිනමන ප්‍රමුඛ සේවාවකි.`,
            desc_en: `Premier service offered by ${b.titleEn}.`,
            features_si: ['විශ්වාසදායක සේවය', 'සාමාජික වරප්‍රසාද', 'ගුණාත්මක ප්‍රමිතිය'],
            features_en: ['Trusted quality', 'Member privileges', 'Certified standard'],
            display_order: i + 1,
            is_active: true
          });
        }
      }
    }
  } catch (err) {
    console.error('Error seeding default business services:', err);
  }
}
