'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useMembership } from '@/app/context/MembershipContext';

export default function LanguageSwitcherBubble() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { activeModal } = useMembership();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  // If a modal is open, hide the floating switcher so it never blocks table content or pagination
  if (activeModal) return null;

  const isSi = currentLocale === 'si';

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
    setTimeout(() => setIsClicked(false), 300);

    const targetUrl = getTargetUrl(locale);
    router.push(targetUrl);
  };

  return (
    <div
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 select-none print:hidden transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Interactive Language Bubble */}
      <div
        className={`group relative flex items-center bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-md hover:shadow-lg rounded-full p-1 transition-all duration-200 ease-out hover:border-[#003399]/40 ${
          isClicked ? 'scale-95' : 'hover:scale-[1.02]'
        }`}
      >
        {/* Compact Globe Icon */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#003399] text-white shrink-0 shadow-2xs">
          <Globe className={`w-3.5 h-3.5 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
        </div>

        {/* Compact Language Options */}
        <div className="flex items-center pl-1.5 pr-0.5 gap-1 text-[11px]">
          {/* Sinhala Option */}
          <button
            type="button"
            onClick={() => handleSwitch('si')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all duration-150 cursor-pointer ${
              isSi
                ? 'bg-[#003399] text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="සිංහල භාෂාව"
          >
            <span className="tracking-tight">සිංහල</span>
          </button>

          <span className="w-px h-2.5 bg-neutral-200" />

          {/* English Option */}
          <button
            type="button"
            onClick={() => handleSwitch('en')}
            className={`px-2 py-0.5 rounded-full font-bold transition-all duration-150 cursor-pointer font-sans ${
              !isSi
                ? 'bg-[#003399] text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="English"
          >
            <span className="tracking-tight">English</span>
          </button>
        </div>
      </div>
    </div>
  );
}
