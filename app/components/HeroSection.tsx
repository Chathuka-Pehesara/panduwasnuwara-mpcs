'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Users, ShieldCheck, Building2, Award } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('Hero');

  return (
    <section
      className="relative w-full min-h-[90vh] lg:min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-between"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}
    >
      {/* Cinematic gradient overlay protecting text legibility while revealing building architecture */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950/95" />

      {/* Main Hero Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-12 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Official Sri Lanka Co-op Heritage Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs text-slate-200 shadow-xl mb-6 hover:border-amber-400/40 transition-colors">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-[#8a004b] shrink-0 shadow-xs flex items-center justify-center">
            <Image
              src="/Logo_new.jpeg"
              alt="Co-op Emblem"
              width={30}
              height={16}
              className="w-auto h-3.5 max-w-none translate-y-[0.5px] object-contain"
            />
          </div>
          <span className="font-medium tracking-wide">{t('badgeMovement')}</span>
          <span className="w-px h-3 bg-white/25" />
          <span className="text-amber-300 font-semibold">{t('badgeEst')}</span>
        </div>

        {/* Hero Title with Solid White Clean Color */}
        <h1 className="font-condensed text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mb-3 sm:mb-4">
          {t('titlePrefix')} {t('titleHighlight')}
        </h1>

        {/* Hero Subtitle / Slogan */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-slate-100 max-w-2xl mx-auto mb-3 tracking-normal">
          {t('subtitle')}
        </p>

        {/* Hero Tagline / Description */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          {t('description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            href="#businesses-services"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#003399] hover:bg-[#002266] text-white font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{t('ctaBusinesses')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="#director-board"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t('ctaBoard')}</span>
          </Link>
        </div>

      </div>

      {/* Floating Glassmorphic Metric Ribbon at Hero Base */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
          
          <div className="flex flex-col items-center justify-center px-2">
            <div className="flex items-center gap-1.5 text-amber-400 mb-0.5">
              <Award className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{t('statYears')}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{t('statYearsLabel')}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 pt-3 md:pt-0">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
              <Building2 className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{t('statUnits')}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{t('statUnitsLabel')}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 pt-3 md:pt-0">
            <div className="flex items-center gap-1.5 text-sky-400 mb-0.5">
              <Users className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{t('statMembers')}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{t('statMembersLabel')}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 pt-3 md:pt-0">
            <div className="flex items-center gap-1.5 text-rose-400 mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{t('statReg')}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{t('statRegLabel')}</span>
          </div>

        </div>
      </div>

      {/* Signature Co-op 7-Color Rainbow Micro-Ribbon at Section Bottom */}
      <div className="relative z-10 w-full h-1 bg-gradient-to-r from-[#DC2626] via-[#EA580C] via-[#EAB308] via-[#16A34A] via-[#0284C7] via-[#1D4ED8] to-[#9333EA]" />
    </section>
  );
}
