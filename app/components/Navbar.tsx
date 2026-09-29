'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, LogIn, ShieldCheck, LogOut, ArrowRight, ChevronDown } from 'lucide-react';
import { businessesData } from '@/app/components/BusinessesSection';
import MembershipDropdown from '@/app/components/MembershipDropdown';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    fullName?: string;
    nic?: string;
    username?: string;
    role?: string;
  } | null;
}

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const isSi = locale === 'si';
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [isMobileBusinessesOpen, setIsMobileBusinessesOpen] = useState(false);
  const businessMenuRef = useRef<HTMLDivElement>(null);

  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null
  });
  const [navBusinesses, setNavBusinesses] = useState<any[]>(businessesData);

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.businesses) && data.businesses.length > 0) {
          const mapped = data.businesses.map((b: any) => ({
            key: b.key,
            titleSi: b.title_si,
            titleEn: b.title_en,
            taglineSi: b.tagline_si || '',
            taglineEn: b.tagline_en || '',
            imageSrc: b.image_src || '/logo-photo.jpg',
            isNew: Boolean(b.is_new)
          }));
          setNavBusinesses(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.isAuthenticated) {
        setAuth({
          isAuthenticated: true,
          isAdmin: Boolean(data.isAdmin),
          user: data.user
        });
      } else {
        setAuth({ isAuthenticated: false, isAdmin: false, user: null });
      }
    } catch {
      setAuth({ isAuthenticated: false, isAdmin: false, user: null });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (businessMenuRef.current && !businessMenuRef.current.contains(event.target as Node)) {
        setIsBusinessMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsBusinessMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    setAuth({ isAuthenticated: false, isAdmin: false, user: null });
    window.location.reload();
  };

  if (pathname?.includes('/admin')) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[#0f1115] text-white shadow-md font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-3 xl:gap-6">

          {/* Logo & Brand */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 sm:gap-3.5 group shrink min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
              <Image
                src="/logo-photo.jpg"
                alt="MPCS Logo"
                width={44}
                height={44}
                className="object-cover"
              />
            </div>
            <span className="font-semibold tracking-wide text-xs sm:text-sm lg:text-[13px] xl:text-sm hidden sm:block max-w-[190px] sm:max-w-[220px] lg:max-w-[210px] xl:max-w-[270px] 2xl:max-w-none leading-snug group-hover:text-neutral-200 transition-colors">
              {t('title')}
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-7 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0">
            <Link
              href={`/${locale}`}
              className="hover:text-gray-300 transition-colors duration-200 py-1"
            >
              {t('home')}
            </Link>

            {/* Businesses Dropdown Menu */}
            <div className="relative" ref={businessMenuRef}>
              <button
                type="button"
                onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
                className={`inline-flex items-center gap-1.5 py-1 text-xs xl:text-sm font-medium transition-colors cursor-pointer focus:outline-hidden ${
                  isBusinessMenuOpen ? 'text-amber-400' : 'text-white hover:text-gray-300'
                }`}
                aria-expanded={isBusinessMenuOpen}
              >
                <span>{t('businesses')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isBusinessMenuOpen ? 'rotate-180 text-amber-400' : 'text-neutral-400'}`} />
              </button>

              {/* Flyout Dropdown Menu */}
              {isBusinessMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[540px] xl:w-[600px] rounded-2xl bg-white border border-neutral-200/90 shadow-2xl p-4 z-50 text-neutral-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#003399] rounded-full" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                        {isSi ? 'අපගේ ව්‍යාපාර අංශ' : 'Our Business Divisions'}
                      </span>
                    </div>
                    <Link
                      href={`/${locale}#businesses`}
                      onClick={() => setIsBusinessMenuOpen(false)}
                      className="text-[11px] font-bold text-[#003399] hover:text-[#002673] transition-colors"
                    >
                      {isSi ? 'සියලු අංශ බලන්න →' : 'View All Overview →'}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                    {navBusinesses.map((b) => {
                      const href = b.key === 'rural-bank' ? `/${locale}/rural-bank` : `/${locale}/businesses/${b.key}`;
                      return (
                        <Link
                          key={b.key}
                          href={href}
                          onClick={() => setIsBusinessMenuOpen(false)}
                          className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-neutral-200/80"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 p-1 shrink-0 flex items-center justify-center border border-neutral-200 shadow-2xs group-hover:scale-105 group-hover:border-[#003399]/40 transition-transform">
                            <Image
                              src={b.imageSrc}
                              alt={b.titleEn}
                              width={36}
                              height={36}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#003399] transition-colors truncate">
                                {isSi ? b.titleSi : b.titleEn}
                              </h4>
                              {b.isNew && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm bg-amber-400 text-slate-950 shrink-0 font-mono shadow-2xs">
                                  {isSi ? 'නව' : 'NEW'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                              {isSi ? b.taglineSi : b.taglineEn}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <MembershipDropdown />

            <Link
              href={`/${locale}#gallery`}
              className="hover:text-gray-300 transition-colors duration-200 py-1"
            >
              {t('gallery')}
            </Link>

            <Link
              href={`/${locale}#news`}
              className="hover:text-gray-300 transition-colors duration-200 py-1"
            >
              {t('news')}
            </Link>

            <Link
              href={`/${locale}#contact`}
              className="hover:text-gray-300 transition-colors duration-200 py-1"
            >
              {t('contact')}
            </Link>
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                {auth.isAdmin ? (
                  <Link
                    href={`/${locale}/admin`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#003399] text-white text-xs font-medium shadow-xs transition-colors border border-neutral-700 whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
                    <span>{t('dashboard')}</span>
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-neutral-200 whitespace-nowrap">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-300" />
                    <span className="font-medium max-w-[110px] truncate">
                      {auth.user?.fullName || auth.user?.nic}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-bold transition-all shadow-xs whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#003399]" />
                  <span>{t('signIn')}</span>
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/15 whitespace-nowrap"
                >
                  <span>{t('register')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 focus:outline-none transition-colors p-2 cursor-pointer"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden w-full bg-[#1a1d24] border-t border-gray-800">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 pb-5 space-y-2 text-sm font-medium flex flex-col">
            <Link
              href={`/${locale}`}
              className="block py-2.5 hover:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('home')}
            </Link>

            <div>
              <button
                type="button"
                onClick={() => setIsMobileBusinessesOpen(!isMobileBusinessesOpen)}
                className="w-full flex items-center justify-between py-2.5 hover:text-gray-300 transition-colors text-left cursor-pointer"
              >
                <span>{t('businesses')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileBusinessesOpen ? 'rotate-180 text-amber-400' : 'text-neutral-400'}`} />
              </button>

              {isMobileBusinessesOpen && (
                <div className="pl-2 pr-1 py-1.5 space-y-1 bg-black/25 rounded-xl my-1 border border-white/5 max-h-60 overflow-y-auto">
                  {navBusinesses.map((b) => {
                    const href = b.key === 'rural-bank' ? `/${locale}/rural-bank` : `/${locale}/businesses/${b.key}`;
                    return (
                      <Link
                        key={b.key}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white p-0.5 shrink-0 flex items-center justify-center">
                          <Image src={b.imageSrc} alt={b.titleEn} width={24} height={24} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs text-white truncate flex-1">{isSi ? b.titleSi : b.titleEn}</span>
                        {b.isNew && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm bg-amber-400 text-slate-950 font-mono">
                            {isSi ? 'නව' : 'NEW'}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <MembershipDropdown isMobile onItemClick={() => setIsOpen(false)} />

            <Link
              href={`/${locale}#gallery`}
              className="block py-2.5 hover:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('gallery')}
            </Link>

            <Link
              href={`/${locale}#news`}
              className="block py-2.5 hover:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('news')}
            </Link>

            <Link
              href={`/${locale}#contact`}
              className="block py-2.5 hover:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('contact')}
            </Link>

            {/* Mobile Auth Actions */}
            <div className="pt-3 border-t border-gray-700/60 flex flex-col gap-2">
              {auth.isAuthenticated ? (
                <>
                  {auth.isAdmin ? (
                    <Link
                      href={`/${locale}/admin`}
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2.5 px-3.5 rounded-lg bg-neutral-800 hover:bg-[#003399] text-white text-xs font-semibold flex items-center justify-between border border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-neutral-300" />
                        <span>{t('dashboard')}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </Link>
                  ) : (
                    <div className="py-2 text-xs text-neutral-300 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                      <span>{auth.user?.fullName || auth.user?.nic}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-3 rounded-xl bg-white text-neutral-900 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#003399]" />
                    <span>{t('signIn')}</span>
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 text-white text-xs font-semibold text-center border border-white/20 flex items-center justify-center"
                  >
                    <span>{t('register')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick-Toggle to Admin Dashboard */}
      {auth.isAdmin && !pathname?.includes('/admin') && (
        <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-[#003399] text-white text-xs font-semibold shadow-lg border border-neutral-700 transition-colors cursor-pointer"
            title="Switch to Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4 text-neutral-300" />
            <span>{t('dashboard')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
        </div>
      )}
    </nav>
  );
}
