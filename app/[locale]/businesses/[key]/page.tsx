'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Building2, 
  MapPin, 
  Phone, 
  UserCheck, 
  CheckCircle2, 
  ChevronRight, 
  Home, 
  ArrowLeft,
  HelpCircle,
  Fuel
} from 'lucide-react';
import { businessesData, BusinessService } from '@/app/components/BusinessesSection';
import InquiryForm from '@/app/components/InquiryForm';
import { BusinessServiceItem, FuelPrice } from '@/lib/types';

export default function BusinessDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const isSi = locale === 'si';
  const businessKey = Array.isArray(params?.key) ? params.key[0] : params?.key as string;

  const fallbackBusiness: BusinessService | undefined = businessesData.find(b => b.key === businessKey);

  const [business, setBusiness] = useState<BusinessService | null>(fallbackBusiness || null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(!fallbackBusiness);
  const [isNotFound, setIsNotFound] = useState(false);

  const [services, setServices] = useState<BusinessServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);

  // Fetch live business data from database
  useEffect(() => {
    let isMounted = true;
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.businesses)) {
          const found = data.businesses.find((b: any) => b.key === businessKey);
          if (found) {
            setBusiness({
              key: found.key,
              titleSi: found.title_si,
              titleEn: found.title_en,
              taglineSi: found.tagline_si || '',
              taglineEn: found.tagline_en || '',
              categorySi: found.category_si || '',
              categoryEn: found.category_en || '',
              descriptionSi: found.description_si || '',
              descriptionEn: found.description_en || '',
              manager: found.manager || '',
              location: found.location || '',
              hotline: found.hotline || '',
              imageSrc: found.image_src || '/logo-photo.jpg',
              coverImage: found.cover_image || '',
              isNew: Boolean(found.is_new),
              services: Array.isArray(found.services) ? found.services : [],
              servicesEn: Array.isArray(found.services_en) ? found.services_en : []
            });
            setIsLoadingBusiness(false);
            return;
          }
        }
        if (!fallbackBusiness) {
          setIsNotFound(true);
        }
        setIsLoadingBusiness(false);
      })
      .catch(() => {
        if (!isMounted) return;
        if (!fallbackBusiness) {
          setIsNotFound(true);
        }
        setIsLoadingBusiness(false);
      });
    return () => { isMounted = false; };
  }, [businessKey, fallbackBusiness]);

  // Fetch fuel prices if on fuel station page
  useEffect(() => {
    if (businessKey === 'fuel-station') {
      fetch('/api/fuel-prices')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.prices)) {
            setFuelPrices(data.prices);
          }
        })
        .catch((err) => console.error('Error loading fuel prices:', err));
    }
  }, [businessKey]);

  // Fetch dynamic editable services from API
  useEffect(() => {
    let isMounted = true;
    async function loadServices() {
      try {
        const res = await fetch(`/api/admin/services?businessKey=${businessKey}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        } else if (isMounted) {
          // Fallback to static services in businessesData
          const fallbackList: BusinessServiceItem[] = (business?.services || []).map((s, idx) => ({
            id: idx + 1,
            business_key: businessKey,
            title_si: s,
            title_en: business?.servicesEn?.[idx] || s,
            desc_si: `${business?.titleSi} මඟින් පිරිනමන විශ්වාසදායක සේවාවකි.`,
            desc_en: `Premier service offered by ${business?.titleEn}.`,
            features_si: ['විශ්වාසදායක සේවය', 'සාමාජික වරප්‍රසාද'],
            features_en: ['Trusted quality', 'Member privileges'],
            display_order: idx + 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          setServices(fallbackList);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        if (isMounted) setIsLoadingServices(false);
      }
    }
    loadServices();
    return () => { isMounted = false; };
  }, [businessKey, business]);

  if (isNotFound) {
    notFound();
  }

  if (isLoadingBusiness || !business) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#f8fafc] text-neutral-600 gap-3">
        <div className="w-10 h-10 border-3 border-[#003399]/20 border-t-[#003399] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">
          {isSi ? 'ව්‍යාපාර තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading business division details...'}
        </p>
      </div>
    );
  }

  const cleanHotline = (business.hotline || '').replace(/\s+/g, '');

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen">
      
      {/* 1. HERO SECTION WITH OPTIONAL COVER PHOTO */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        {/* Cover Photo Backdrop if present */}
        {business.coverImage ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={business.coverImage}
              alt={business.titleEn}
              fill
              className="object-cover object-center scale-105"
              priority
            />
            {/* Rich multi-layer gradient overlays ensuring high contrast text & deep navy brand identity */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-blue-950/80 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        )}
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>{isSi ? 'මුල් පිටුව' : 'Home'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <Link href={`/${locale}#businesses`} className="hover:text-white transition-colors">
              <span>{isSi ? 'ව්‍යාපාර අංශ' : 'Businesses'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-amber-400 font-semibold truncate max-w-[180px]">
              {isSi ? business.titleSi : business.titleEn}
            </span>
          </nav>

          {/* Hero Banner Card */}
          <div className="flex flex-col md:flex-row items-center gap-8 pt-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3 shadow-2xl border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
              <Image
                src={business.imageSrc}
                alt={business.titleEn}
                width={100}
                height={100}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <div className="flex flex-col gap-3 sm:gap-3.5 text-center md:text-left flex-1">
              <div className="inline-flex items-center justify-center md:justify-start gap-2">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-blue-200/90">
                  {isSi ? 'සමුපකාර ව්‍යාපාර අංශය' : 'Cooperative Business Unit'}
                </span>
              </div>

              <h1 className="font-condensed text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-snug sm:leading-tight pt-1">
                {isSi ? business.titleSi : business.titleEn}
              </h1>

              <p className="text-sm sm:text-base text-amber-300/90 font-medium max-w-2xl">
                {isSi ? business.taglineSi : business.taglineEn}
              </p>

              {(isSi ? business.descriptionSi : business.descriptionEn) && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl pt-1">
                  {isSi ? business.descriptionSi : business.descriptionEn}
                </p>
              )}
            </div>
          </div>

        </div>
      </section>


      {/* TODAY'S FUEL PRICE SECTION (EXCLUSIVE FOR FUEL STATION) */}
      {businessKey === 'fuel-station' && (
        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200/80 pb-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-wider text-amber-700 uppercase">
                  {isSi ? 'දෛනික ඉන්ධන මිල' : 'Daily Fuel Rates'}
                </span>
              </div>
              <h2 className="font-condensed text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {isSi ? 'අද දින ඉන්ධන මිල ගණන්' : "Today's Fuel Price"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                {isSi
                  ? 'හැට්ටිපොල සමුපකාර ඉන්ධන පිරවුම්හලේ අද දින ලීටරයක සිල්ලර මිල ගණන් මෙහි දැක්වේ.'
                  : 'Official retail price per liter at our Hattipola Co-operative Fuel Station.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{isSi ? 'තොග ලබාගත හැක' : 'In Stock & Available'}</span>
            </div>
          </div>

          {/* 3 Fuel Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {fuelPrices.map((fuel) => {
              const isPetrol = fuel.id === 'petrol-92';
              const isDiesel = fuel.id === 'super-diesel';

              const accentBorder = isPetrol ? 'border-red-200/80' : isDiesel ? 'border-amber-200/80' : 'border-blue-200/80';
              const badgeBg = isPetrol ? 'bg-red-50 text-red-700 border-red-200' : isDiesel ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200';
              const iconColor = isPetrol ? 'text-red-600' : isDiesel ? 'text-amber-600' : 'text-blue-600';
              const iconBg = isPetrol ? 'bg-red-50' : isDiesel ? 'bg-amber-50' : 'bg-blue-50';

              return (
                <div
                  key={fuel.id}
                  className={`bg-white rounded-2xl border ${accentBorder} p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl ${iconBg} border border-neutral-200/60 flex items-center justify-center shadow-2xs`}>
                        <Fuel className={`w-6 h-6 ${iconColor}`} />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                        {fuel.id === 'kerosene' ? 'Kerosene' : fuel.id === 'petrol-92' ? 'Octane 92' : 'Super Diesel'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-condensed text-xl font-bold text-neutral-900">
                        {isSi ? fuel.name_si : fuel.name_en}
                      </h3>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {isSi ? fuel.name_en : fuel.name_si}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-neutral-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        {isSi ? 'ලීටරයක මිල' : 'Price Per Liter'}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xs font-bold text-neutral-700">Rs.</span>
                        <span className="font-mono text-2xl sm:text-3xl font-black text-neutral-900">
                          {Number(fuel.price_per_liter).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500">
                      / {isSi ? 'ලීටරය' : 'Liter'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}


      {/* 2. SERVICES SECTION */}
      <section className="w-full py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#003399] rounded-full shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wider text-[#003399] uppercase">
              {isSi ? 'පිරිනමන සේවාවන්' : 'Offered Services'}
            </span>
          </div>
          <h2 className="font-condensed text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {isSi ? 'අපගේ සේවාවන් සහ පහසුකම්' : 'Our Services & Facilities'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            {isSi 
              ? 'අපගේ පාරිභෝගිකයින් සහ සාමාජිකයින් වෙනුවෙන් පිරිනමනු ලබන සියලුම සේවා පහසුකම් මෙහි දැක්වේ.'
              : 'All services and facilities provided for our community members and valuable customers.'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, idx) => (
            <div
              key={svc.id || idx}
              className="group bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003399] flex items-center justify-center font-bold font-mono text-sm border border-blue-100 group-hover:bg-[#003399] group-hover:text-white transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-condensed text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#003399] transition-colors">
                    {isSi ? svc.title_si : svc.title_en}
                  </h3>
                  {(isSi ? svc.desc_si : svc.desc_en) && (
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {isSi ? svc.desc_si : svc.desc_en}
                    </p>
                  )}
                </div>
              </div>

              {/* Feature bullet points */}
              {((isSi ? svc.features_si : svc.features_en) || []).length > 0 && (
                <div className="pt-4 mt-4 border-t border-neutral-100 space-y-1.5">
                  {((isSi ? svc.features_si : svc.features_en) || []).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>


      {/* 3. BUSINESS PAGE BOTTOM DETAILS (CONTACT MANAGER, LOCATION, HOTLINE, SEND INQUIRY) */}
      <section className="w-full py-14 sm:py-18 bg-slate-100/70 border-t border-neutral-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-[#003399] rounded-full shrink-0" />
              <span className="text-xs sm:text-sm font-bold tracking-wider text-[#003399] uppercase">
                {isSi ? 'සම්බන්ධතා සහ තොරතුරු' : 'Contact & Information'}
              </span>
            </div>
            <h2 className="font-condensed text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {isSi ? 'අංශ කළමනාකාරීත්වය සහ විමසීම්' : 'Department Contacts & Inquiries'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              {isSi 
                ? 'අපගේ ශාඛාව වෙත පැමිණෙන්න, සෘජුවම අමතන්න හෝ ඔබගේ විමසීම යොමු කරන්න.'
                : 'Reach out to our department management, visit our office, or submit an official inquiry.'}
            </p>
          </div>

          {/* 4 Bottom Details Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* 1. Contact Manager */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
                  <UserCheck className="w-5 h-5 text-[#003399]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {isSi ? 'අංශ කළමනාකරු' : 'Contact Manager'}
                  </span>
                  <h4 className="font-condensed text-sm sm:text-base font-bold text-neutral-900 mt-0.5">
                    {business.manager}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                {isSi ? 'අංශයේ ප්‍රධාන මෙහෙයුම් නිලධාරී' : 'Head of Department Operations'}
              </p>
            </div>

            {/* 2. Location */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {isSi ? 'ස්ථානය' : 'Location'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-snug mt-0.5">
                    {business.location}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                {isSi ? 'සඳුදා - සෙනසුරාදා' : 'Open Mon - Sat'}
              </p>
            </div>

            {/* 3. Hotline */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-neutral-700 flex items-center justify-center border border-neutral-200">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {isSi ? 'ක්ෂණික ඇමතුම් අංකය' : 'Hotline'}
                  </span>
                  <a
                    href={`tel:${cleanHotline}`}
                    className="font-mono text-sm sm:text-base font-bold text-neutral-900 hover:text-[#003399] transition-colors mt-0.5 block"
                  >
                    {business.hotline}
                  </a>
                </div>
              </div>
              <a
                href={`tel:${cleanHotline}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003399] hover:underline"
              >
                <Phone className="w-3 h-3" />
                <span>{isSi ? 'දැන් අමතන්න' : 'Call Department'}</span>
              </a>
            </div>

            {/* 4. Send Inquiry Option */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#003399] text-white flex items-center justify-center shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-condensed text-sm sm:text-base font-bold text-neutral-900">
                  {isSi ? 'විමසීමක් යොමු කරන්න' : 'Send Inquiry'}
                </h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  {isSi 
                    ? 'සේවාවන් හෝ මිල ගණන් පිළිබඳ විමසන්න.' 
                    : 'Submit requirements, quotes, or questions directly.'}
                </p>
              </div>

              <InquiryForm
                businessKey={businessKey}
                businessNameEn={business.titleEn}
                businessNameSi={business.titleSi}
                buttonClassName="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              />
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
