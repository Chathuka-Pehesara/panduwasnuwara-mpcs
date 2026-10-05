'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Building2, 
  UserCheck, 
  Phone, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  PiggyBank, 
  Coins, 
  TrendingUp, 
  Gem, 
  HeartHandshake, 
  CalendarCheck,
  ChevronRight,
  Home,
  UserPlus,
  HelpCircle
} from 'lucide-react';
import { ruralBankBranches, RuralBankBranch } from '@/lib/data/ruralBankBranches';
import InquiryForm from '@/app/components/InquiryForm';
import { BusinessServiceItem } from '@/lib/types';

export default function RuralBankPage() {
  const t = useTranslations('RuralBank');
  const locale = useLocale();
  const isSi = locale === 'si';

  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicServices, setDynamicServices] = useState<BusinessServiceItem[]>([]);
  const [branches, setBranches] = useState<RuralBankBranch[]>(ruralBankBranches);

  useEffect(() => {
    let isMounted = true;
    async function fetchBankData() {
      try {
        const [svcRes, bizRes] = await Promise.all([
          fetch('/api/admin/services?businessKey=rural-bank'),
          fetch('/api/businesses')
        ]);
        const [svcData, bizData] = await Promise.all([svcRes.json(), bizRes.json()]);

        if (isMounted && svcData.success && Array.isArray(svcData.services) && svcData.services.length > 0) {
          setDynamicServices(svcData.services);
        }

        if (isMounted && bizData.success && Array.isArray(bizData.businesses)) {
          const rb = bizData.businesses.find((b: any) => b.key === 'rural-bank');
          if (rb && Array.isArray(rb.managers) && rb.managers.length > 0) {
            const mapped: RuralBankBranch[] = rb.managers.map((m: any, idx: number) => ({
              id: idx + 1,
              branchNameEn: m.branch || m.branchNameEn || `Branch ${idx + 1}`,
              branchNameSi: m.branch || m.branchNameSi || `ශාඛාව ${idx + 1}`,
              managerNameEn: m.name || m.managerNameEn || '',
              managerNameSi: m.name || m.managerNameSi || '',
              hotline: m.hotline || '',
              addressEn: m.location || m.addressEn || '',
              addressSi: m.location || m.addressSi || ''
            }));
            setBranches(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching bank data:', err);
      }
    }
    fetchBankData();
    return () => { isMounted = false; };
  }, []);

  // Filter branches based on search query
  const filteredBranches = branches.filter((branch: RuralBankBranch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const branchName = (isSi ? branch.branchNameSi : branch.branchNameEn).toLowerCase();
    const managerName = (isSi ? branch.managerNameSi : branch.managerNameEn).toLowerCase();
    const hotline = branch.hotline.replace(/\s+/g, '');
    return (
      branchName.includes(q) ||
      managerName.includes(q) ||
      hotline.includes(q.replace(/\s+/g, ''))
    );
  });

  // 6 Primary Banking Services (default static baseline)
  const bankingServices = [
    {
      icon: PiggyBank,
      titleEn: 'Savings Accounts',
      titleSi: 'තැන්පතු ගිණුම්',
      descEn: 'Flexible regular savings accounts with competitive interest rates and seamless withdrawals for daily needs.',
      descSi: 'දෛනික අවශ්‍යතා සඳහා පහසු මුදල් ආපසු ගැනීම් සහ ආකර්ෂණීය පොලී අනුපාත සහිත නම්‍යශීලී සාමාන්‍ය ඉතුරුම් ගිණුම්.',
      featuresEn: ['Instant account opening', 'High annual interest', 'Passbook facilities'],
      featuresSi: ['ක්ෂණික ගිණුම් විවෘත කිරීම', 'ඉහළ වාර්ෂික පොලියක්', 'ගිණුම් පොත් පහසුකම්']
    },
    {
      icon: TrendingUp,
      titleEn: 'Fixed Deposits',
      titleSi: 'නියමිත තැන්පතු (ස්ථාවර තැන්පතු)',
      descEn: 'Guaranteed high-yield investment options with flexible tenure terms ranging from 3 months to 5 years.',
      descSi: 'මාස 3 සිට වසර 5 දක්වා නම්‍යශීලී කාලසීමාවන් සහිත උපරිම පොලී ප්‍රතිලාභ සහතික කෙරෙන ආරක්ෂිත ස්ථාවර තැන්පතු.',
      featuresEn: ['Higher interest for seniors', 'Monthly/maturity payout', '100% security guarantee'],
      featuresSi: ['වැඩිහිටියන්ට විශේෂ පොලී අනුපාත', 'මාසික හෝ කල්පිරීමේ පොලිය', '100% සුරක්ෂිතතාවය']
    },
    {
      icon: Coins,
      titleEn: 'Daily Loan Schemes',
      titleSi: 'දිනක ණය ක්‍රම',
      descEn: 'Accessible working capital loans for self-employed individuals, retail vendors, and small agricultural enterprises.',
      descSi: 'ස්වයං රැකියාලාභීන්, වෙළඳුන් සහ ගොවි ප්‍රජාව වෙනුවෙන් පහසු දෛනික ආපසු ගෙවීමේ ක්‍රම සහිත කාරක ප්‍රාග්ධන ණය.',
      featuresEn: ['Fast approval within 24h', 'Minimal documentation', 'Flexible daily repayments'],
      featuresSi: ['පැය 24ක් තුළ කඩිනම් අනුමැතිය', 'අවම ලියකියවිලි', 'පහසු දෛනික ආපසු ගෙවීම්']
    },
    {
      icon: Gem,
      titleEn: 'Gold Pawning & Jewellery Loans',
      titleSi: 'රන් වටිකර ණය පහසුකම්',
      descEn: 'Confidential and highly secure gold pawning facilities with maximum valuation and lowest approved interest rates.',
      descSi: 'උපරිම තක්සේරු වටිනාකමක් සහ අවම පොලියක් සහිත අතිශය රහස්‍ය සහ ආරක්ෂිත රන් ආභරණ උකස් සේවාව.',
      featuresEn: ['Highest advance per sovereign', 'Vault security guarantee', 'Part payment options'],
      featuresSi: ['පවුමකට උපරිම මුදලක්', 'සුරක්ෂිත තැන්පතු සුරක්ෂිතතාව', 'කොටස් වශයෙන් පියවීමේ පහසුකම']
    },
    {
      icon: HeartHandshake,
      titleEn: "Children's Savings Schemes",
      titleSi: 'ළමා තැන්පතු ගිණුම්',
      descEn: 'Dedicated savings plans to build a bright future for children with bonus interest and educational rewards.',
      descSi: 'දරුවන්ගේ අනාගතය සුරක්ෂිත කරන විශේෂ ත්‍යාග සහ අධ්‍යාපනික දිරිගැන්වීම් සහිත සුවිශේෂී ළමා ඉතුරුම් සැලසුම්.',
      featuresEn: ['Attractive annual gifts', 'Educational grant bonuses', 'Parental standing orders'],
      featuresSi: ['වාර්ෂික වටිනා ත්‍යාග', 'අධ්‍යාපනික ප්‍රදාන', 'ස්ථාවර නියෝග මඟින් බැර කිරීම']
    },
    {
      icon: CalendarCheck,
      titleEn: 'Loan Repayment Orders & Transfers',
      titleSi: 'ණය ආපසු ගෙවීමේ නියෝග',
      descEn: 'Automated inter-branch transfers, standing orders, and institutional payroll deductions for smooth loan servicing.',
      descSi: 'ශාඛා අතර මුදල් මාරුකිරීම්, ස්ථාවර නියෝග සහ ආයතනික වැටුප් අඩුකිරීම් මඟින් ණය පියවීමේ පහසුකම්.',
      featuresEn: ['Network-wide inter-branch access', 'Zero hidden service fees', 'SMS payment updates'],
      featuresSi: ['ශාඛා 22 අතරම සේවා ප්‍රවේශය', 'සැඟවුණු ගාස්තු නොමැත', 'SMS පණිවිඩ මඟින් තහවුරු කිරීම']
    }
  ];

  const renderedServices = dynamicServices.length > 0
    ? dynamicServices.map((ds, idx) => ({
        icon: bankingServices[idx % bankingServices.length]?.icon || PiggyBank,
        titleEn: ds.title_en,
        titleSi: ds.title_si,
        descEn: ds.desc_en || '',
        descSi: ds.desc_si || '',
        featuresEn: ds.features_en || [],
        featuresSi: ds.features_si || []
      }))
    : bankingServices;

  return (
    <div className="w-full bg-[#f8fafc] font-sans">
      
      {/* 1. HEADER / HERO SECTION WITH PROMINENT COVER PHOTO */}
      <section className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Large Cover Photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sections/rural-bank-cover.jpg"
            alt="Panduwasnuwara Rural Bank Main Branch"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-102"
          />
          {/* Multi-layered cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/80" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 text-center space-y-6">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>{t('backHome')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
            <span className="text-amber-400 font-semibold">{isSi ? 'ග්‍රාමීය බැංකුව' : 'Rural Bank'}</span>
          </nav>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mx-auto">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-300">
              {t('eyebrow')}
            </span>
          </div>

          {/* Prominent Headline */}
          <h1 className="font-condensed text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight max-w-4xl mx-auto drop-shadow-md pt-1">
            {t('heroTitle')}
          </h1>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          {/* Key Stat Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{t('badgeBranches')}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('badgeYears')}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>{t('badgeOwnership')}</span>
            </div>
          </div>

        </div>
      </section>


      {/* 2. SERVICES SECTION ("OUR SERVICES") */}
      <section id="services" className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 mx-auto">
            <span className="w-5 h-[2px] bg-[#003399]/40 rounded-full shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wider text-[#003399] uppercase">
              {isSi ? 'මූල්‍ය විසඳුම්' : 'Financial Solutions'}
            </span>
            <span className="w-5 h-[2px] bg-[#003399]/40 rounded-full shrink-0" />
          </div>
          <h2 className="font-condensed text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {t('servicesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </div>

        {/* Services Grid (Clean Attractive Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {renderedServices.map((svc, idx) => {
            const IconComponent = svc.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon & Index Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#003399] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#003399] group-hover:text-white transition-all duration-300 shadow-2xs">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-neutral-300 group-hover:text-neutral-500 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-condensed text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-[#003399] transition-colors">
                      {isSi ? svc.titleSi : svc.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {isSi ? svc.descSi : svc.descEn}
                    </p>
                  </div>
                </div>

                {/* Key Features Pill List */}
                <div className="pt-5 mt-5 border-t border-neutral-100 space-y-2">
                  {(isSi ? svc.featuresSi : svc.featuresEn).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* 3. BRANCH CONTACTS GRID/LIST (22 BRANCH RECORDS IN ROW FORMAT) */}
      <section id="branches" className="w-full py-16 sm:py-20 bg-slate-100/70 border-t border-neutral-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          
          {/* Section Heading & Search Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-neutral-200/80 pb-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-[#003399] rounded-full shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-wider text-[#003399] uppercase">
                  {t('totalBranches')}
                </span>
              </div>
              <h2 className="font-condensed text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                {t('branchesTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {t('branchesSubtitle')}
              </p>
            </div>

            {/* Real-time Branch Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-[#003399] shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Branch Records Horizontal Row List */}
          {filteredBranches.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 p-12 text-center space-y-2 shadow-2xs">
              <Building2 className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">{t('noBranchesFound')}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#003399] font-bold hover:underline cursor-pointer"
              >
                Clear search query
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBranches.map((branch: RuralBankBranch) => {
                const branchName = isSi ? branch.branchNameSi : branch.branchNameEn;
                const managerName = isSi ? branch.managerNameSi : branch.managerNameEn;
                const cleanPhone = branch.hotline.replace(/\s+/g, '');

                return (
                  <div
                    key={branch.id}
                    className="group bg-white rounded-xl sm:rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200 p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    {/* Left Column: Number Badge & Bank Branch */}
                    <div className="flex items-center gap-3.5 min-w-[240px] lg:min-w-[280px]">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-neutral-500 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-neutral-200 group-hover:bg-[#003399] group-hover:text-white transition-colors">
                        {String(branch.id).padStart(2, '0')}
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block sm:hidden">
                          {t('branchCol')}
                        </span>
                        <h4 className="font-condensed text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#003399] transition-colors flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{branchName}</span>
                        </h4>
                      </div>
                    </div>

                    {/* Middle Column: Manager Name */}
                    <div className="flex items-center gap-2 min-w-[200px] text-xs text-neutral-700">
                      <UserCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block sm:hidden">
                          {t('managerCol')}
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {managerName}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Hotline & Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-800">
                        <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <a 
                          href={`tel:${cleanPhone}`}
                          className="hover:text-[#003399] transition-colors"
                        >
                          {branch.hotline}
                        </a>
                      </div>

                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#003399] text-neutral-700 hover:text-white text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                        title={`${t('callNow')}: ${branch.hotline}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>{t('callNow')}</span>
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}


          {/* 4. CALL TO ACTION (CTA): BECOME A MEMBER (DIRECTLY BENEATH THE BRANCH LIST) */}
          <div className="pt-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002266] via-[#003399] to-blue-900 p-8 sm:p-10 lg:p-12 text-white shadow-xl">
              {/* Background decorative watermark */}
              <Building2 className="absolute -right-10 -bottom-10 w-72 h-72 text-white/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSi ? 'සමුපකාර සාමාජිකත්වය' : 'Cooperative Membership'}</span>
                  </div>

                  <h3 className="font-condensed text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                    {t('ctaTitle')}
                  </h3>

                  <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
                    {t('ctaSubtitle')}
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={`/${locale}/register`}
                    className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer font-sans"
                  >
                    <UserPlus className="w-5 h-5 text-slate-950" />
                    <span>{t('ctaButton')}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </Link>

                  <InquiryForm
                    businessKey="rural-bank"
                    businessNameEn="Rural Bank"
                    businessNameSi="ග්‍රාමීය බැංකුව"
                    buttonLabel={isSi ? 'විමසීමක් යොමු කරන්න' : 'Send Inquiry'}
                    buttonClassName="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all duration-200 backdrop-blur-md cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
