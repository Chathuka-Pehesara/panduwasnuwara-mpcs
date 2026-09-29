import { supabase } from '@/lib/supabase';

export const INITIAL_BUSINESSES = [
  {
    key: 'rural-bank',
    titleSi: 'ග්‍රාමීය බැංකුව',
    titleEn: 'Rural Bank',
    taglineSi: 'විශ්වාසදායක ඉතුරුම් සහ ඉක්මන් ණය සේවා',
    taglineEn: 'Trusted savings & fast loans for our community',
    categorySi: 'ග්‍රාමීය බැංකු සේවා',
    categoryEn: 'Banking & Finance',
    descriptionSi: 'ග්‍රාමීය බැංකුව අපගේ සමිතියේ හදවතයි — ඔබේ ගමේම ආරක්ෂිත, සාමාජික-කේන්ද්‍රීය බැංකු සේවාව. විශ්වාසයෙන් තැන්පතු කරන්න, පහසුවෙන් ණය ලබා ගන්න, ආකර්ෂණීය පොලි අනුපාත සමඟ ඉතුරුම් වර්ධනය කරන්න.',
    descriptionEn: 'The Rural Bank is the heart of our society — safe, member-focused banking right in your village. Deposit with confidence, borrow with ease and grow your savings with attractive interest rates.',
    manager: 'කේ ඩබ් ජදසිංහ (Manager)',
    location: 'සමිති ගොඩනැගිල්ල, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1012',
    imageSrc: '/images/sections/rural-bank.png',
    isNew: false,
    displayOrder: 1,
    services: ['තැන්පතු ගිණුම්', 'නියමිත තැන්පතු', 'දිනක ණය ක්‍රම', 'රන් වටිකර ණය', 'ළමා තැන්පතු', 'ණය ආපසු ගෙවීමේ නියෝග'],
    servicesEn: ['Savings Accounts', 'Fixed Deposits', 'Daily Loan Schemes', 'Gold Jewellery Loans', "Children's Savings", 'Loan Repayment Orders']
  },
  {
    key: 'consumer',
    titleSi: 'පාරිභෝගික අංශය',
    titleEn: 'Consumer Section',
    taglineSi: 'සාමාජිකයන්ට සාධාරණ මිලට උසස් භාණ්ඩ',
    taglineEn: 'Quality goods at fair prices for members',
    categorySi: 'පාරිභෝගික වෙළඳසැල්',
    categoryEn: 'Retail & Consumer',
    descriptionSi: 'බත් සහ පරිප්පු සිට සබන් සහ ලියන ද්‍රව්‍ය දක්වා — පාරිභෝගික අංශය සාධාරණ මිලට උසස් අත්‍යවශ්‍ය භාණ්ඩ සපයයි. සාමාජිකයින්ට වට්ටම් ක්‍රම සහ සමයට අනුව ප්‍රවර්ධන ලැබේ.',
    descriptionEn: 'From rice and dhal to soaps and stationery — the Consumer Section supplies quality essential goods at fair prices. Members enjoy special discount schemes and seasonal offers throughout the year.',
    manager: 'එස් එම් රණසිංහ (Manager)',
    location: 'පාරිභෝගික අංශය, සමිති ගොඩනැගිල්ල, හැට්ටිපොල',
    hotline: '037 229 1013',
    imageSrc: '/images/sections/consumer.png',
    isNew: false,
    displayOrder: 2,
    services: ['තොග හා සිල්ලර විකිණීම', 'සාමාජික වට්ටම් ක්‍රමය', 'උත්සව සමයේ ප්‍රවර්ධන', 'උත්සව සඳහා තොග ඇණවුම්', 'ගෙදර බාරගෙන යාමේ සේවය', 'සාධාරණ මිලේ අත්‍යවශ්‍ය භාණ්ඩ'],
    servicesEn: ['Wholesale & Retail Sales', 'Member Discount Schemes', 'Festive Season Promotions', 'Bulk Orders for Events', 'Home Delivery Service', 'Fair-priced Essential Goods']
  },
  {
    key: 'maliban-biscuits',
    titleSi: 'මාලිබන් බිස්කට් නියෝජිතායතනය',
    titleEn: 'Maliban Biscuits Agency',
    taglineSi: 'මාලිබන් බිස්කට් නිල නියෝජිත සැපයුම',
    taglineEn: 'Authorized Maliban biscuits distribution',
    categorySi: 'වාණිජ නියෝජිතායතන',
    categoryEn: 'Commercial Distribution',
    descriptionSi: 'මාලිබන් බිස්කට් සඳහා නිල නියෝජිතායතනය — කඩ සාප්පු, සිල්ලර වෙළෙන්දන් සහ තොග වෙළෙන්දන්ට තරඟකාරී නියෝජිත මිලට සැපයීම. විශ්වාසදායක තොග, නිසි වේලාවට බෙදාහැරීම සහ සාමාජිකයින්ට ණය පහසුකම්.',
    descriptionEn: 'Official agency for Maliban biscuits — supplying shops, retailers, and wholesalers at competitive agency rates. Reliable stock, timely delivery, and credit facilities for members.',
    manager: 'ඩබ් පී සිල්වා (Manager)',
    location: 'නියෝජිතායතන ගබදාව, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1014',
    imageSrc: '/images/sections/maliban-biscuits.png',
    isNew: false,
    displayOrder: 3,
    services: ['නියෝජිත තොග මිල', 'දිවයින පුරා බෙදාහැරීම', 'උත්සව සමයේ තොග', 'සාමාජිකයින්ට ණය පහසුකම්', 'නැවුම් තොග සහතිකය', 'කඩ සාප්පු සඳහා උපකාරක සේවා'],
    servicesEn: ['Agency Wholesale Pricing', 'Island-wide Distribution', 'Festive Season Stock', 'Credit Facilities for Members', 'Fresh Stock Guarantee', 'Shop Support Services']
  },
  {
    key: 'maliban-kiri',
    titleSi: 'මාලිබන් කිරි නියෝජිතායතනය',
    titleEn: 'Maliban Milk Agency',
    taglineSi: 'මාලිබන් කිරිපිටි නිල නියෝජිත සැපයුම',
    taglineEn: 'Trusted Maliban milk powder distribution',
    categorySi: 'වාණිජ නියෝජිතායතන',
    categoryEn: 'Commercial Distribution',
    descriptionSi: 'මාලිබන් කිරිපිටි නිෂ්පාදන සඳහා නිල බෙදාහරන්නා — දෛනික කිරිපිටි සිට ළමා කිරිපිටි දක්වා. නිතිපතා බෙදාහැරීම, කඩ සඳහා තොග සැපයුම සහ සාමාජික ණය ක්‍රම.',
    descriptionEn: 'Official distributor for Maliban milk powder products — from daily milk powder to infant milk formulas. Regular delivery, wholesale supply for shops, and member credit schemes.',
    manager: 'ඒ එල් පෙරේරා (Manager)',
    location: 'නියෝජිතායතන ගබදාව, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1015',
    imageSrc: '/images/sections/maliban-kiri.png',
    isNew: false,
    displayOrder: 4,
    services: ['කිරිපිටි තොග විකිණීම', 'ළමා කිරිපිටි නිෂ්පාදන', 'කඩ සඳහා තොග සැපයුම', 'නිතිපතා බෙදාහැරීම', 'සාමාජික ණය ක්‍රම', 'සිල්ලර ප්‍රවර්ධන'],
    servicesEn: ['Milk Powder Wholesale', 'Infant Formula Products', 'Bulk Supply for Shops', 'Regular Delivery', 'Member Credit Schemes', 'Retail Promotions']
  },
  {
    key: 'nature-secrets',
    titleSi: 'නේචර්ස් සීක්‍රට්ස් නියෝජිතායතනය',
    titleEn: "Nature's Secrets Agency",
    taglineSi: 'ස්වභාවික ශාකසාර රූපලාවණ්‍ය නියෝජිතායතනය',
    taglineEn: 'Herbal beauty products agency',
    categorySi: 'වාණිජ නියෝජිතායතන',
    categoryEn: 'Commercial Distribution',
    descriptionSi: 'නේචර්ස් සීක්‍රට්ස් ශාකසාර රූපලාවණ්‍ය නිෂ්පාදන සඳහා නිල නියෝජිතායතනය — ඇලෝවෙරා, සුදු සඳුන් සහ ශාකසාර සත්කාරක නිෂ්පාදන තොග හා සිල්ලර මිලට.',
    descriptionEn: "Official agency for Nature's Secrets herbal beauty products — supplying Aloe Vera, White Sandalwood, and herbal care products at wholesale and retail rates.",
    manager: 'එම් ඩබ් ප්‍රනාන්දු (Manager)',
    location: 'ප්‍රධාන කාර්යාලය, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1016',
    imageSrc: '/images/sections/nature-secrets.png',
    isNew: false,
    displayOrder: 5,
    services: ['ශාකසාර රූපලාවණ්‍ය තොග', 'ඇලෝවෙරා නිෂ්පාදන', 'සුදු සඳුන් නිෂ්පාදන', 'තෑගි පැකේජ', 'සෞන්දර්යාගාර සැපයුම', 'සමයට අනුව ප්‍රවර්ධන'],
    servicesEn: ['Herbal Beauty Wholesale', 'Aloe Vera Products', 'White Sandalwood Range', 'Gift Packages', 'Salon Supply', 'Seasonal Promotions']
  },
  {
    key: 'hemas',
    titleSi: 'හෙමාස් නියෝජිතායතනය',
    titleEn: 'Hemas Agency',
    taglineSi: 'හෙමාස් සන්නාම නිල නියෝජිත සැපයුම',
    taglineEn: 'Trusted Hemas brands distribution',
    categorySi: 'වාණිජ නියෝජිතායතන',
    categoryEn: 'Commercial Distribution',
    descriptionSi: 'හෙමාස් නිෂ්පාදන නියෝජිතායතනය — Baby Cheramy ළමා සත්කාරක, Kumarika කෙස් සත්කාරක, පුද්ගලික සත්කාරක සහ ගෘහ භාණ්ඩ.',
    descriptionEn: 'Hemas products agency — supplying Baby Cheramy baby care, Kumarika hair care, personal care, and household items.',
    manager: 'බී ජී කුමාරි (Manager)',
    location: 'ප්‍රධාන කාර්යාලය, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1017',
    imageSrc: '/images/sections/hemas.png',
    isNew: false,
    displayOrder: 6,
    services: ['ළමා සත්කාරක නිෂ්පාදන', 'පුද්ගලික සත්කාරක', 'කෙස් සත්කාරක (Kumarika)', 'ගෘහ භාණ්ඩ', 'තොග සැපයුම', 'සාමාජික විශේෂ දීමනා'],
    servicesEn: ['Baby Care Products (Baby Cheramy)', 'Personal Care', 'Hair Care (Kumarika)', 'Household Items', 'Wholesale Supply', 'Member Special Offers']
  },
  {
    key: 'ristbury-tiara',
    titleSi: 'රිස්ට්බරි ටියාරා නියෝජිතායතනය',
    titleEn: 'Ristbury Tiara Agency',
    taglineSi: 'ටියාරා සහ රිස්ට්බරි නිෂ්පාදන නිල සැපයුම',
    taglineEn: 'Official Ristbury Tiara distribution',
    categorySi: 'වාණිජ නියෝජිතායතන',
    categoryEn: 'Commercial Distribution',
    descriptionSi: 'රිස්ට්බරි සහ ටියාරා කේක් හා චොක්ලට් නිෂ්පාදන සඳහා නිල නියෝජිතායතනය — උත්සව සහ වෙළෙඳපොළ සඳහා නැවුම් තොග සැපයුම.',
    descriptionEn: 'Official agency for Ristbury and Tiara confectionery products — fresh stock supply for retail shops and special events.',
    manager: 'ඩී එස් රත්නායක (Manager)',
    location: 'නියෝජිතායතන ගබදාව, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1018',
    imageSrc: '/images/sections/ristbury-tiara.png',
    isNew: false,
    displayOrder: 7,
    services: ['තොග සැපයුම', 'සිල්ලර බෙදාහැරීම', 'උත්සව තොග ඇණවුම්', 'ණය පහසුකම්', 'නිසි වේලාවට බෙදාහැරීම'],
    servicesEn: ['Wholesale Supply', 'Retail Distribution', 'Bulk Event Orders', 'Credit Facilities', 'Timely Delivery']
  },
  {
    key: 'fuel-station',
    titleSi: 'ඉන්ධන පිරවුම්හල',
    titleEn: 'Fuel Station',
    taglineSi: 'අපගේ නවතම ව්‍යාපෘතිය — දිනපතා පෙ.ව. 6.00 සිට විවෘතයි',
    taglineEn: 'Our newest venture — open daily from 6.00 AM',
    categorySi: 'ඉන්ධන සැපයුම',
    categoryEn: 'Energy & Fuel',
    descriptionSi: 'පෙට්‍රල් සහ ඩීසල් සපයන සම්පූර්ණ සේවා ඉන්ධන පිරවුම්හලක්; සමිති සාමාජිකයින්ට ප්‍රමුඛතා පෝලිම් සහ ඉන්ධන පාස් පහසුකම් සමඟ. වායු පිරවුම, ජලය සහ කුඩා සුපිරි වෙළඳසැලක් ද ඇත.',
    descriptionEn: 'Full service fuel filling station providing petrol and diesel; priority lines and fuel pass facilities for society members. Includes air, water, and convenience shop.',
    manager: 'එච් එම් බණ්ඩාර (Manager)',
    location: 'කුරුණෑගල පාර හංදිය, හැට්ටිපොල',
    hotline: '037 229 1019',
    imageSrc: '/images/sections/fuel-station.png',
    isNew: true,
    displayOrder: 8,
    services: ['පෙට්‍රල් 92 / 95', 'ඔටෝ ඩීසල් සහ සුපර් ඩීසල්', 'සාමාජිකයින්ට ඉන්ධන පාස් ක්‍රමය', 'සාමාජිකයින්ට ප්‍රමුඛතා පෝලිම', 'වායු හා ජල සේවා'],
    servicesEn: ['Petrol 92 / 95', 'Auto Diesel & Super Diesel', 'Fuel Pass Scheme for Members', 'Priority Queue for Members', 'Air & Water Services']
  },
  {
    key: 'funeral',
    titleSi: 'අවමංගල්‍ය සේවා අංශය',
    titleEn: 'Funeral Services Section',
    taglineSi: 'සාමාජිකයින්ට සහනදායී සහ සත්කාරක අවමංගල්‍ය සේවා',
    taglineEn: 'Compassionate & affordable funeral care services for members',
    categorySi: 'ප්‍රජා සත්කාර සේවා',
    categoryEn: 'Community Welfare',
    descriptionSi: 'සාමාජික පවුල්වල ශෝකජනක අවස්ථාවලදී සහනදායී සේවාවන් සහ මූල්‍ය අනුග්‍රහය සපයන සමුපකාර අවමංගල්‍ය සේවා අංශය.',
    descriptionEn: 'Co-operative funeral care section providing financial assistance and compassionate funeral services for member families during difficult times.',
    manager: 'කේ ඒ පී කුලරත්න (Manager)',
    location: 'සමිති ගොඩනැගිල්ල, හැට්ටිපොල',
    hotline: '037 229 1020',
    imageSrc: '/images/sections/funeral.png',
    isNew: false,
    displayOrder: 9,
    services: ['සාමාජික හා පවුලක දායක ක්‍රම', 'අවමංගල්‍ය වියදම් මුදල් සහාය', 'මරණයකදී ක්ෂණික සහාය', 'අඩු මිලට අවමංගල්‍ය උපකරණ'],
    servicesEn: ['Member & Family Contribution Schemes', 'Financial Assistance for Funeral Costs', 'Immediate Support on Bereavement', 'Subsidized Funeral Equipment']
  }
];

let isBusinessesSeeded = false;

export async function seedBusinesses(): Promise<void> {
  if (isBusinessesSeeded) return;
  isBusinessesSeeded = true;

  const validKeys = INITIAL_BUSINESSES.map(b => b.key);

  // 1. Remove phantom/outdated businesses not in INITIAL_BUSINESSES
  const { data: currentRows } = await supabase
    .from('businesses')
    .select('id, key');

  if (currentRows && currentRows.length > 0) {
    const toDelete = currentRows.filter(r => !validKeys.includes(r.key)).map(r => r.id);
    if (toDelete.length > 0) {
      await supabase.from('businesses').delete().in('id', toDelete);
    }
  }

  // 2. Check and upsert the 9 active businesses
  for (const b of INITIAL_BUSINESSES) {
    const { data: existing } = await supabase
      .from('businesses')
      .select('*')
      .eq('key', b.key)
      .maybeSingle();

    if (!existing) {
      await supabase.from('businesses').insert({
        key: b.key,
        title_si: b.titleSi,
        title_en: b.titleEn,
        tagline_si: b.taglineSi,
        tagline_en: b.taglineEn,
        category_si: b.categorySi,
        category_en: b.categoryEn,
        description_si: b.descriptionSi,
        description_en: b.descriptionEn,
        manager: b.manager,
        location: b.location,
        hotline: b.hotline,
        image_src: b.imageSrc,
        is_new: b.isNew,
        is_active: true,
        display_order: b.displayOrder,
        services: b.services,
        services_en: b.servicesEn
      });
    } else {
      // Update missing fields while preserving user customizations
      await supabase
        .from('businesses')
        .update({
          title_si: existing.title_si || b.titleSi,
          title_en: existing.title_en || b.titleEn,
          display_order: b.displayOrder
        })
        .eq('key', b.key);
    }
  }
}

