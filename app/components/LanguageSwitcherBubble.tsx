'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ArrowRightLeft, Check } from 'lucide-react';

export default function LanguageSwitcherBubble() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isSi = currentLocale === 'si';
  const targetLocale = isSi ? 'en' : 'si';

  const getTargetUrl = (locale: string) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split('/');
    if (segments[1] === 'si' || segments[1] === 'en') {
      segments[1] = locale;
      return segments.join('/') || `/${locale}`;
    }
    return `/${locale}${pathname}`;
  };

  const handleSwitch = (locale: string) => {
    if (locale === currentLocale) return;
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);

    const targetUrl = getTargetUrl(locale);
    router.push(targetUrl);
  };

  return (
    <div
      className="fixed bottom-6 left-6 z-50 select-none print:hidden transition-transform duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Official Government Cooperative Interactive Language Bubble */}
      <div
        className={`group relative flex items-center bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-xl shadow-blue-950/15 rounded-full p-1.5 transition-all duration-300 ease-out hover:shadow-2xl hover:border-[#003399]/40 ${
          isClicked ? 'scale-95' : 'hover:scale-[1.02]'
        }`}
      >
        {/* Subtle Government Emblem / Globe Icon with pulse ring */}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#003399] to-[#002266] text-white shadow-md shrink-0">
          <Globe className={`w-4 h-4 transition-transform duration-500 ${isHovered ? 'rotate-45' : ''}`} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-300" />
        </div>

        {/* Compact Default Pill Content */}
        <div className="flex items-center pl-2 pr-1 gap-1.5">
          {/* Sinhala Option */}
          <button
            type="button"
            onClick={() => handleSwitch('si')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isSi
                ? 'bg-[#003399] text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="සිංහල භාෂාවට මාරු වන්න"
          >
            {isSi && <Check className="w-3 h-3 text-amber-300 shrink-0" />}
            <span className="font-semibold tracking-wide">සිංහල</span>
          </button>

          {/* Interactive Arrow Divider */}
          <button
            type="button"
            onClick={() => handleSwitch(targetLocale)}
            className="p-1 rounded-full text-neutral-400 hover:text-[#003399] hover:bg-blue-50 transition-colors cursor-pointer"
            title={isSi ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
            aria-label="Toggle language"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* English Option */}
          <button
            type="button"
            onClick={() => handleSwitch('en')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              !isSi
                ? 'bg-[#003399] text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Switch to English"
          >
            {!isSi && <Check className="w-3 h-3 text-amber-300 shrink-0" />}
            <span className="font-semibold tracking-wide font-sans">English</span>
          </button>
        </div>

        {/* Hover Expandable Tooltip / Helper Tag */}
        <div
          className={`absolute bottom-full left-0 mb-2 px-3 py-1.5 rounded-xl bg-neutral-900/95 text-white text-[11px] font-medium shadow-lg backdrop-blur-xs whitespace-nowrap transition-all duration-200 pointer-events-none ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          <span className="text-amber-400 font-bold">
            {isSi ? 'භාෂාව වෙනස් කරන්න' : 'Change Language'}
          </span>
          <span className="text-neutral-300 text-[10px] ml-1.5 font-sans">
            {isSi ? '(Switch to English)' : '(සිංහලට මාරු වන්න)'}
          </span>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-5 -mt-1 border-4 border-transparent border-t-neutral-900/95" />
        </div>
      </div>
    </div>
  );
}
