'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { 
  ArrowRight, 
  Phone, 
  MapPin, 
  UserCheck, 
  X, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';

export interface BusinessService {
  key: string;
  titleSi: string;
  titleEn: string;
  taglineSi: string;
  taglineEn: string;
  categorySi?: string;
  categoryEn?: string;
  descriptionSi: string;
  descriptionEn: string;
  services: string[];
  servicesEn: string[];
  manager: string;
  location: string;
  hotline: string;
  imageSrc: string;
  coverImage?: string;
  isNew?: boolean;
}

export const businessesData: BusinessService[] = [
  {
    key: 'rural-bank',
    titleSi: 'ග්‍රාමීය බැංකුව',
    titleEn: 'Rural Bank',
    taglineSi: 'විශ්වාසදායක ඉතුරුම් සහ ඉක්මන් ණය සේවා',
    taglineEn: 'Trusted savings & fast loans for our community',
    descriptionSi: 'ග්‍රාමීය බැංකුව අපගේ සමිතියේ හදවතයි — ඔබේ ගමේම ආරක්ෂිත, සාමාජික-කේන්ද්‍රීය බැංකු සේවාව. විශ්වාසයෙන් තැන්පතු කරන්න, පහසුවෙන් ණය ලබා ගන්න, ආකර්ෂණීය පොලි අනුපාත සමඟ ඉතුරුම් වර්ධනය කරන්න.',
    descriptionEn: 'The Rural Bank is the heart of our society — safe, member-focused banking right in your village. Deposit with confidence, borrow with ease and grow your savings with attractive interest rates.',
    services: [
      'තැන්පතු ගිණුම්',
      'නියමිත තැන්පතු',
      'දිනක ණය ක්‍රම',
      'රන් වටිකර ණය',
      'ළමා තැන්පතු',
      'ණය ආපසු ගෙවීමේ නියෝග'
    ],
    servicesEn: [
      'Savings Accounts',
      'Fixed Deposits',
      'Daily Loan Schemes',
      'Gold Jewellery Loans',
      'Children\'s Savings',
      'Loan Repayment Orders'
    ],
    manager: 'කේ ඩබ් ජදසිංහ (Manager)',
    location: 'සමිති ගොඩනැගිල්ල, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1012',
    imageSrc: '/images/sections/rural-bank.png',
  },
  {
    key: 'consumer',
    titleSi: 'පාරිභෝගික අංශය',
    titleEn: 'Consumer Section',
    taglineSi: 'සාමාජිකයන්ට සාධාරණ මිලට උසස් භාණ්ඩ',
    taglineEn: 'Quality goods at fair prices for members',
    descriptionSi: 'බත් සහ පරිප්පු සිට සබන් සහ ලියන ද්‍රව්‍ය දක්වා — පාරිභෝගික අංශය සාධාරණ මිලට උසස් අත්‍යවශ්‍ය භාණ්ඩ සපයයි. සාමාජිකයින්ට වට්ටම් ක්‍රම සහ සමයට අනුව ප්‍රවර්ධන ලැබේ.',
    descriptionEn: 'From rice and dhal to soaps and stationery — the Consumer Section supplies quality essential goods at fair prices. Members enjoy special discount schemes and seasonal offers throughout the year.',
    services: [
      'තොග හා සිල්ලර විකිණීම',
      'සාමාජික වට්ටම් ක්‍රමය',
      'උත්සව සමයේ ප්‍රවර්ධන',
      'උත්සව සඳහා තොග ඇණවුම්',
      'ගෙදර බාරගෙන යාමේ සේවය',
      'සාධාරණ මිලේ අත්‍යවශ්‍ය භාණ්ඩ'
    ],
    servicesEn: [
      'Wholesale & Retail Sales',
      'Member Discount Schemes',
      'Festive Season Promotions',
      'Bulk Orders for Events',
      'Home Delivery Service',
      'Fair-priced Essential Goods'
    ],
    manager: 'එස් එම් රණසිංහ (Manager)',
    location: 'පාරිභෝගික අංශය, සමිති ගොඩනැගිල්ල, හැට්ටිපොල',
    hotline: '037 229 1013',
    imageSrc: '/images/sections/consumer.png',
  },
  {
    key: 'maliban-biscuits',
    titleSi: 'මාලිබන් බිස්කට් නියෝජිතායතනය',
    titleEn: 'Maliban Biscuits Agency',
    taglineSi: 'මාලිබන් බිස්කට් නිල නියෝජිත සැපයුම',
    taglineEn: 'Authorized Maliban biscuits distribution',
    descriptionSi: 'මාලිබන් බිස්කට් සඳහා නිල නියෝජිතායතනය — කඩ සාප්පු, සිල්ලර වෙළෙන්දන් සහ තොග වෙළෙන්දන්ට තරඟකාරී නියෝජිත මිලට සැපයීම. විශ්වාසදායක තොග, නිසි වේලාවට බෙදාහැරීම සහ සාමාජිකයින්ට ණය පහසුකම්.',
    descriptionEn: 'Official agency for Maliban biscuits — supplying shops, retailers, and wholesalers at competitive agency rates. Reliable stock, timely delivery, and credit facilities for members.',
    services: [
      'නියෝජිත තොග මිල',
      'දිවයින පුරා බෙදාහැරීම',
      'උත්සව සමයේ තොග',
      'සාමාජිකයින්ට ණය පහසුකම්',
      'නැවුම් තොග සහතිකය',
      'කඩ සාප්පු සඳහා උපකාරක සේවා'
    ],
    servicesEn: [
      'Agency Wholesale Pricing',
      'Island-wide Distribution',
      'Festive Season Stock',
      'Credit Facilities for Members',
      'Fresh Stock Guarantee',
      'Shop Support Services'
    ],
    manager: 'ඩබ් පී සිල්වා (Manager)',
    location: 'නියෝජිතායතන ගබදාව, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1014',
    imageSrc: '/images/sections/maliban-biscuits.png',
  },
  {
    key: 'maliban-kiri',
    titleSi: 'මාලිබන් කිරි නියෝජිතායතනය',
    titleEn: 'Maliban Milk Agency',
    taglineSi: 'මාලිබන් කිරිපිටි නිල නියෝජිත සැපයුම',
    taglineEn: 'Trusted Maliban milk powder distribution',
    descriptionSi: 'මාලිබන් කිරිපිටි නිෂ්පාදන සඳහා නිල බෙදාහරන්නා — දෛනික කිරිපිටි සිට ළමා කිරිපිටි දක්වා. නිතිපතා බෙදාහැරීම, කඩ සඳහා තොග සැපයුම සහ සාමාජික ණය ක්‍රම.',
    descriptionEn: 'Official distributor for Maliban milk powder products — from daily milk powder to infant milk formulas. Regular delivery, wholesale supply for shops, and member credit schemes.',
    services: [
      'කිරිපිටි තොග විකිණීම',
      'ළමා කිරිපිටි නිෂ්පාදන',
      'කඩ සඳහා තොග සැපයුම',
      'නිතිපතා බෙදාහැරීම',
      'සාමාජික ණය ක්‍රම',
      'සිල්ලර ප්‍රවර්ධන'
    ],
    servicesEn: [
      'Milk Powder Wholesale',
      'Infant Formula Products',
      'Bulk Supply for Shops',
      'Regular Delivery',
      'Member Credit Schemes',
      'Retail Promotions'
    ],
    manager: 'ඒ එල් පෙරේරා (Manager)',
    location: 'නියෝජිතායතන ගබදාව, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1015',
    imageSrc: '/images/sections/maliban-kiri.png',
  },
  {
    key: 'nature-secrets',
    titleSi: 'නේචර්ස් සීක්‍රට්ස් නියෝජිතායතනය',
    titleEn: "Nature's Secrets Agency",
    taglineSi: 'ස්වභාවික ශාකසාර රූපලාවණ්‍ය නියෝජිතායතනය',
    taglineEn: 'Herbal beauty products agency',
    descriptionSi: 'නේචර්ස් සීක්‍රට්ස් ශාකසාර රූපලාවණ්‍ය නිෂ්පාදන සඳහා නිල නියෝජිතායතනය — ඇලෝවෙරා, සුදු සඳුන් සහ ශාකසාර සත්කාරක නිෂ්පාදන තොග හා සිල්ලර මිලට.',
    descriptionEn: "Official agency for Nature's Secrets herbal beauty products — supplying Aloe Vera, White Sandalwood, and herbal care products at wholesale and retail rates.",
    services: [
      'ශාකසාර රූපලාවණ්‍ය තොග',
      'ඇලෝවෙරා නිෂ්පාදන',
      'සුදු සඳුන් නිෂ්පාදන',
      'තෑගි පැකේජ',
      'සෞන්දර්යාගාර සැපයුම',
      'සමයට අනුව ප්‍රවර්ධන'
    ],
    servicesEn: [
      'Herbal Beauty Wholesale',
      'Aloe Vera Products',
      'White Sandalwood Range',
      'Gift Packages',
      'Salon Supply',
      'Seasonal Promotions'
    ],
    manager: 'එම් ඩබ් ප්‍රනාන්දු (Manager)',
    location: 'ප්‍රධාන කාර්යාලය, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1016',
    imageSrc: '/images/sections/nature-secrets.png',
  },
  {
    key: 'hemas',
    titleSi: 'හෙමාස් නියෝජිතායතනය',
    titleEn: 'Hemas Agency',
    taglineSi: 'හෙමාස් සන්නාම නිල නියෝජිත සැපයුම',
    taglineEn: 'Trusted Hemas brands distribution',
    descriptionSi: 'හෙමාස් නිෂ්පාදන නියෝජිතායතනය — Baby Cheramy ළමා සත්කාරක, Kumarika කෙස් සත්කාරක, පුද්ගලික සත්කාරක සහ ගෘහ භාණ්ඩ.',
    descriptionEn: 'Hemas products agency — supplying Baby Cheramy baby care, Kumarika hair care, personal care, and household items.',
    services: [
      'ළමා සත්කාරක නිෂ්පාදන',
      'පුද්ගලික සත්කාරක',
      'කෙස් සත්කාරක (Kumarika)',
      'ගෘහ භාණ්ඩ',
      'තොග සැපයුම',
      'සාමාජික විශේෂ දීමනා'
    ],
    servicesEn: [
      'Baby Care Products (Baby Cheramy)',
      'Personal Care',
      'Hair Care (Kumarika)',
      'Household Items',
      'Wholesale Supply',
      'Member Special Offers'
    ],
    manager: 'බී ජී කුමාරි (Manager)',
    location: 'ප්‍රධාන කාර්යාලය, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1017',
    imageSrc: '/images/sections/hemas.png',
  },
  {
    key: 'ristbury-tiara',
    titleSi: 'රිස්ට්බරි ටියාරා නියෝජිතායතනය',
    titleEn: 'Ristbury Tiara Agency',
    taglineSi: 'ටියාරා සහ රිස්ට්බරි නිෂ්පාදන නිල සැපයුම',
    taglineEn: 'Official Ristbury Tiara distribution',
    descriptionSi: 'රිස්ට්බරි සහ ටියාරා කේක් හා චොක්ලට් නිෂ්පාදන සඳහා නිල නියෝජිතායතනය — උත්සව සහ වෙළෙඳපොළ සඳහා නැවුම් තොග සැපයුම.',
    descriptionEn: 'Official agency for Ristbury and Tiara confectionery products — fresh stock supply for retail shops and special events.',
    services: [
      'තොග සැපයුම',
      'සිල්ලර බෙදාහැරීම',
      'උත්සව තොග ඇණවුම්',
      'ණය පහසුකම්',
      'නිසි වේලාවට බෙදාහැරීම'
    ],
    servicesEn: [
      'Wholesale Supply',
      'Retail Distribution',
      'Bulk Event Orders',
      'Credit Facilities',
      'Timely Delivery'
    ],
    manager: 'ඩී එස් රත්නායක (Manager)',
    location: 'නියෝජිතායතන ගබදාව, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1018',
    imageSrc: '/images/sections/ristbury-tiara.png',
  },
  {
    key: 'fuel-station',
    titleSi: 'ඉන්ධන පිරවුම්හල',
    titleEn: 'Fuel Station',
    taglineSi: 'අපගේ නවතම ව්‍යාපෘතිය — දිනපතා පෙ.ව. 6.00 සිට විවෘතයි',
    taglineEn: 'Our newest venture — open daily from 6.00 AM',
    descriptionSi: 'පෙට්‍රල් සහ ඩීසල් සපයන සම්පූර්ණ සේවා ඉන්ධන පිරවුම්හලක්; සමිති සාමාජිකයින්ට ප්‍රමුඛතා පෝලිම් සහ ඉන්ධන පාස් පහසුකම් සමඟ. වායු පිරවුම, ජලය සහ කුඩා සුපිරි වෙළඳසැලක් ද ඇත.',
    descriptionEn: 'Full service fuel filling station providing petrol and diesel; priority lines and fuel pass facilities for society members. Includes air, water, and convenience shop.',
    services: [
      'පෙට්‍රල් 92 / 95',
      'ඔටෝ ඩීසල් සහ සුපර් ඩීසල්',
      'සාමාජිකයින්ට ඉන්ධන පාස් ක්‍රමය',
      'සාමාජිකයින්ට ප්‍රමුඛතා පෝලිම',
      'වායු හා ජල සේවා'
    ],
    servicesEn: [
      'Petrol 92 / 95',
      'Auto Diesel & Super Diesel',
      'Fuel Pass Scheme for Members',
      'Priority Queue for Members',
      'Air & Water Services'
    ],
    manager: 'එච් එම් බණ්ඩාර (Manager)',
    location: 'කුරුණෑගල පාර හංදිය, හැට්ටිපොල',
    hotline: '037 229 1019',
    imageSrc: '/images/sections/fuel-station.png',
    isNew: true,
  },
  {
    key: 'funeral',
    titleSi: 'අවමංගල්‍ය සේවා අංශය',
    titleEn: 'Funeral Services Section',
    taglineSi: 'සාමාජිකයින්ට සහනදායී සහ සත්කාරක අවමංගල්‍ය සේවා',
    taglineEn: 'Compassionate & affordable funeral care services for members',
    descriptionSi: 'සාමාජික පවුල්වල ශෝකජනක අවස්ථාවලදී සහනදායී සේවාවන් සහ මූල්‍ය අනුග්‍රහය සපයන සමුපකාර අවමංගල්‍ය සේවා අංශය.',
    descriptionEn: 'Co-operative funeral care section providing financial assistance and compassionate funeral services for member families during difficult times.',
    services: [
      'සාමාජික හා පවුලක දායක ක්‍රම',
      'අවමංගල්‍ය වියදම් මුදල් සහාය',
      'මරණයකදී ක්ෂණික සහාය',
      'අඩු මිලට අවමංගල්‍ය උපකරණ'
    ],
    servicesEn: [
      'Member & Family Contribution Schemes',
      'Financial Assistance for Funeral Costs',
      'Immediate Support at Time of Death',
      'Affordable Funeral Equipment'
    ],
    manager: 'ටී එම් විජේසිංහ (Manager)',
    location: 'සමිති ගොඩනැගිල්ල, කුරුණෑගල පාර, හැට්ටිපොල',
    hotline: '037 229 1020',
    imageSrc: '/images/sections/funeral.png',
  },
];

export default function BusinessesSection() {
  const t = useTranslations('Businesses');
  const locale = useLocale();
  const isSi = locale === 'si';
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessService | null>(null);
  const [liveBusinesses, setLiveBusinesses] = useState<BusinessService[]>(businessesData);

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.businesses) && data.businesses.length > 0) {
          const mapped: BusinessService[] = data.businesses.map((b: any) => ({
            key: b.key,
            titleSi: b.title_si,
            titleEn: b.title_en,
            taglineSi: b.tagline_si || '',
            taglineEn: b.tagline_en || '',
            categorySi: b.category_si || '',
            categoryEn: b.category_en || '',
            descriptionSi: b.description_si || '',
            descriptionEn: b.description_en || '',
            manager: b.manager || '',
            location: b.location || '',
            hotline: b.hotline || '',
            imageSrc: b.image_src || '/logo-photo.jpg',
            coverImage: b.cover_image || '',
            isNew: Boolean(b.is_new),
            services: Array.isArray(b.services) ? b.services : [],
            servicesEn: Array.isArray(b.services_en) ? b.services_en : []
          }));
          setLiveBusinesses(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Category details
  const getCategoryTheme = (key: string) => {
    switch (key) {
      case 'rural-bank':
        return {
          category: 'Banking & Finance',
          categorySi: 'ග්‍රාමීය බැංකු සේවා'
        };
      case 'consumer':
      case 'coop-city':
      case 'mini-super':
        return {
          category: 'Retail & Consumer',
          categorySi: 'පාරිභෝගික වෙළඳසැල්'
        };
      case 'fuel-station':
        return {
          category: 'Energy & Fuel',
          categorySi: 'ඉන්ධන සැපයුම'
        };
      case 'nestle-agency':
      case 'prima-agency':
      case 'ristbury-tiara':
      case 'maliban-biscuits':
      case 'maliban-kiri':
      case 'nature-secrets':
      case 'hemas':
      case 'tobacco-agency':
        return {
          category: 'Commercial Distribution',
          categorySi: 'වාණිජ නියෝජිතායතන'
        };
      case 'funeral':
      default:
        return {
          category: 'Community Welfare',
          categorySi: 'ප්‍රජා සත්කාර සේවා'
        };
    }
  };

  return (
    <section 
      id="businesses-services" 
      className="w-full bg-[#FAFAFA] pt-10 pb-16 sm:pt-12 sm:pb-20 px-4 sm:px-6 lg:px-8 font-sans scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">

        {/* Section Header */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 mx-auto text-[#003399]">
            <span className="w-5 h-[2px] bg-[#003399]/40 rounded-full shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">
              {t('eyebrow')}
            </span>
            <span className="w-5 h-[2px] bg-[#003399]/40 rounded-full shrink-0" />
          </div>

          <h2 className="font-condensed text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight pt-1">
            {t('heading')}
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed pt-1">
            {t('subtext')}
          </p>
        </div>

        {/* 1. Responsive 3-Column Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveBusinesses.map((item, index) => {
            const theme = getCategoryTheme(item.key);
            const categoryLabel = isSi 
              ? (item.categorySi || theme.categorySi) 
              : (item.categoryEn || theme.category);

            return (
              <div
                key={item.key}
                className="group p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white shadow-xs hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Category Pill & Top Baseline Alignment with Gray Number */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                        {categoryLabel}
                      </span>
                      {item.isNew && (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-2xs font-mono">
                          {isSi ? 'නව' : 'NEW'}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-400 select-none tracking-wider">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Consistent Logo Badge Container */}
                    <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200/80 p-1.5 flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={item.imageSrc}
                        alt={item.titleEn}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Title Stack */}
                    <div className="pt-0.5">
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#003399] transition-colors">
                        {isSi ? item.titleSi : item.titleEn}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {isSi ? item.taglineSi : item.taglineEn}
                      </p>
                    </div>
                  </div>

                  {/* Description Paragraph */}
                  {(isSi ? item.descriptionSi : item.descriptionEn) && (
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {isSi ? item.descriptionSi : item.descriptionEn}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[140px]">{item.location.split(',')[0]}</span>
                  </span>

                  <button
                    onClick={() => setSelectedBusiness(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-[#003399] text-slate-700 hover:text-white font-semibold transition-all duration-200 cursor-pointer shadow-2xs group/btn"
                  >
                    <span>{t('viewDetails')}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Modal / Pop-up Dialog */}
        {selectedBusiness && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
              
              {/* Fixed Modal Header */}
              <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-neutral-200/80 shrink-0 flex items-start justify-between gap-4 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-neutral-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    <Image
                      src={selectedBusiness.imageSrc}
                      alt={selectedBusiness.titleEn}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-condensed text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                      {isSi ? selectedBusiness.titleSi : selectedBusiness.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                      {isSi ? selectedBusiness.taglineSi : selectedBusiness.taglineEn}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body with Custom Sleek Scrollbar */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 custom-scrollbar">
                {/* Full Description */}
                {(isSi ? selectedBusiness.descriptionSi : selectedBusiness.descriptionEn) && (
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-neutral-200/80">
                    <p className="text-sm sm:text-[15px] text-neutral-600 leading-relaxed font-normal">
                      {isSi ? selectedBusiness.descriptionSi : selectedBusiness.descriptionEn}
                    </p>
                  </div>
                )}

                {/* Offered Services List */}
                <div className="space-y-3">
                  <h4 className="font-condensed text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('offeredServices')}</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(isSi ? selectedBusiness.services : selectedBusiness.servicesEn).map((svc, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2.5 text-xs sm:text-[13px] text-neutral-700 bg-slate-50 border border-neutral-200/80 px-3.5 py-2.5 rounded-xl font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Contact & Location Details */}
                <div className="pt-2 border-t border-neutral-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-neutral-200/80">
                    <UserCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                    <div className="truncate">
                      <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t('manager')}</span>
                      <span className="font-semibold text-neutral-800 truncate block mt-0.5">{selectedBusiness.manager}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-neutral-200/80">
                    <MapPin className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{t('location')}</span>
                      <span className="font-semibold text-neutral-800 block mt-0.5">{selectedBusiness.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-neutral-200/80 shrink-0 flex items-center justify-between rounded-b-2xl sm:rounded-b-3xl">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-neutral-500 font-medium">{t('hotline')}:</span>
                  <a 
                    href={`tel:${selectedBusiness.hotline.replace(/\s+/g, '')}`}
                    className="font-bold text-neutral-900 hover:text-[#003399] transition-colors"
                  >
                    {selectedBusiness.hotline}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {selectedBusiness.key === 'rural-bank' ? (
                    <Link
                      href={`/${locale}/rural-bank`}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#003399] hover:bg-[#002266] rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{isSi ? 'ග්‍රාමීය බැංකු පිටුව' : 'Explore Rural Bank'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/${locale}/businesses/${selectedBusiness.key}`}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#003399] hover:bg-[#002266] rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{isSi ? 'අංශයේ පිටුවට' : 'Visit Business Page'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedBusiness(null)}
                    className="px-5 py-2 text-xs font-semibold text-neutral-700 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
