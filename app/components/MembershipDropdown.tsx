'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  ChevronDown, 
  Users, 
  Vote, 
  FileText, 
  UserPlus, 
  LogIn, 
  User as UserIcon, 
  LogOut,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useMembership } from '@/app/context/MembershipContext';

interface MembershipDropdownProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function MembershipDropdown({ isMobile = false, onItemClick }: MembershipDropdownProps) {
  const locale = useLocale();
  const isSi = locale === 'si';
  const { openModal, auth, refreshAuth } = useMembership();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
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
    await refreshAuth();
    setIsOpen(false);
    if (onItemClick) onItemClick();
    window.location.reload();
  };

  const handleSelectOption = (action: 'members' | 'voters' | 'apply') => {
    setIsOpen(false);
    if (onItemClick) onItemClick();
    openModal(action);
  };

  // MOBILE ACCORDION / EXPANDABLE VIEW
  if (isMobile) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2.5 hover:text-gray-300 transition-colors text-left cursor-pointer"
        >
          <span className="font-medium">{isSi ? 'සාමාජිකත්වය' : 'Membership'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : 'text-neutral-400'}`} />
        </button>

        {isOpen && (
          <div className="pl-2 pr-1 py-2 space-y-1.5 bg-black/25 rounded-xl my-1 border border-white/5 animate-in fade-in">
            {/* 1. Member Details (ALL) */}
            <button
              type="button"
              onClick={() => handleSelectOption('members')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10 group-hover:border-amber-400/40 group-hover:text-amber-400 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                  {isSi ? 'සාමාජික විස්තර (සියල්ල)' : 'Member Details (ALL)'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {isSi ? 'සම්පූර්ණ සාමාජික නාමාවලිය' : 'Complete member registry'}
                </p>
              </div>
            </button>

            {/* 2. Eligible Voters */}
            <button
              type="button"
              onClick={() => handleSelectOption('voters')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10 group-hover:border-amber-400/40 group-hover:text-amber-400 transition-colors">
                <Vote className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                  {isSi ? 'ඡන්ද හිමි සාමාජිකයන්' : 'Eligible Voters'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {isSi ? 'ඡන්ද හිමි නාමලේඛනය' : 'Cooperative electoral register'}
                </p>
              </div>
            </button>

            {/* 3. Apply for Membership (ALWAYS VISIBLE) */}
            <button
              type="button"
              onClick={() => handleSelectOption('apply')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10 group-hover:border-amber-400/40 group-hover:text-amber-400 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                    {isSi ? 'සාමාජිකත්වය සඳහා අයදුම් කරන්න' : 'Apply for Membership'}
                  </p>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm bg-amber-400 text-slate-950 shrink-0 font-mono">
                    {isSi ? 'අයදුම්' : 'APPLY'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {isSi ? 'නව සාමාජික අයදුම්පත සහ මුද්‍රිත ලේඛනය' : 'Online form & rubber stamp upload'}
                </p>
              </div>
            </button>

            {/* 4 & 5. AUTH / PROFILE CONDITIONAL DISPLAY */}
            {auth.isAuthenticated ? (
              /* ALREADY SIGNED IN / REGISTERED -> SHOW PROFILE CARD */
              <div className="mt-2 pt-2 border-t border-white/10 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#003399]" />
                    <span>{isSi ? 'ඔබගේ ගිණුම' : 'Your Profile'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{isSi ? 'ඉවත් වන්න' : 'Sign Out'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-slate-200 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {auth.user?.fullName || auth.user?.username}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">
                      NIC: {auth.user?.nic || '—'} {auth.user?.phone ? `• ${auth.user.phone}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* NOT SIGNED IN -> SHOW REGISTER AND SIGN IN */
              <div className="pt-2 border-t border-white/10 space-y-1">
                <Link
                  href={`/${locale}/register`}
                  onClick={() => {
                    setIsOpen(false);
                    if (onItemClick) onItemClick();
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">{isSi ? 'ලියාපදිංචි වන්න' : 'Register'}</span>
                </Link>

                <Link
                  href={`/${locale}/login`}
                  onClick={() => {
                    setIsOpen(false);
                    if (onItemClick) onItemClick();
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                    <LogIn className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">{isSi ? 'ඇතුල් වන්න' : 'Sign in'}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // DESKTOP DROPDOWN VIEW
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 py-1 text-xs xl:text-sm font-medium transition-colors cursor-pointer focus:outline-hidden ${
          isOpen ? 'text-amber-400' : 'text-white hover:text-gray-300'
        }`}
        aria-expanded={isOpen}
      >
        <span>{isSi ? 'සාමාජිකත්වය' : 'Membership'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : 'text-neutral-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-neutral-200/90 shadow-2xl p-3 z-50 text-neutral-900 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Bar matching Businesses dropdown */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-neutral-100 px-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#003399] rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                {isSi ? 'සාමාජික සේවා' : 'Membership Portal'}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">
              MPCS Panduwasnuwara
            </span>
          </div>

          <div className="space-y-1">
            {/* 1. Member Details (ALL) */}
            <button
              type="button"
              onClick={() => handleSelectOption('members')}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all cursor-pointer group border border-transparent hover:border-neutral-200/80"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-neutral-200 text-neutral-700 group-hover:border-[#003399]/40 group-hover:text-[#003399] group-hover:bg-blue-50/50 transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#003399] transition-colors truncate">
                  {isSi ? 'සාමාජික විස්තර (සියල්ල)' : 'Member Details (ALL)'}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {isSi ? 'සම්පූර්ණ සාමාජික නාමාවලිය සොයන්න' : 'Search full registered member registry'}
                </p>
              </div>
            </button>

            {/* 2. Eligible Voters */}
            <button
              type="button"
              onClick={() => handleSelectOption('voters')}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all cursor-pointer group border border-transparent hover:border-neutral-200/80"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-neutral-200 text-neutral-700 group-hover:border-[#003399]/40 group-hover:text-[#003399] group-hover:bg-blue-50/50 transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <Vote className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#003399] transition-colors truncate">
                  {isSi ? 'ඡන්ද හිමි සාමාජිකයන්' : 'Eligible Voters'}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {isSi ? 'මැතිවරණ ඡන්ද හිමි නාමලේඛනය' : 'Cooperative electoral register'}
                </p>
              </div>
            </button>

            {/* 3. Apply for Membership (ALWAYS VISIBLE) */}
            <button
              type="button"
              onClick={() => handleSelectOption('apply')}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all cursor-pointer group border border-transparent hover:border-neutral-200/80"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-neutral-200 text-neutral-700 group-hover:border-[#003399]/40 group-hover:text-[#003399] group-hover:bg-blue-50/50 transition-all flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#003399] transition-colors truncate">
                    {isSi ? 'සාමාජිකත්වය සඳහා අයදුම් කරන්න' : 'Apply for Membership'}
                  </p>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm bg-amber-400 text-slate-950 shrink-0 font-mono shadow-2xs">
                    {isSi ? 'අයදුම්' : 'APPLY'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">
                  {isSi ? 'අයදුම්පත සහ නිල මුද්‍රා තැබූ ලේඛනය' : 'Online application & certified rubber stamp'}
                </p>
              </div>
            </button>
          </div>

          {/* 4 & 5. CONDITIONAL BOTTOM SECTION */}
          {auth.isAuthenticated ? (
            /* IF ALREADY SIGNED IN / REGISTERED -> HIDE Register & Sign in, SHOW Profile card */
            <div className="mt-2.5 pt-2.5 border-t border-neutral-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003399]" />
                    <span>{isSi ? 'ඔබගේ ගිණුම' : 'Your Profile'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[11px] text-neutral-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{isSi ? 'ඉවත් වන්න' : 'Sign Out'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#003399] flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {auth.user?.fullName || auth.user?.username}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate font-mono">
                      {auth.user?.nic && <span>NIC: {auth.user.nic}</span>}
                      {auth.user?.phone && <span className="ml-2">• {auth.user.phone}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* IF NOT SIGNED IN -> SHOW Register AND Sign in */
            <div className="mt-2 pt-2 border-t border-neutral-100 space-y-1">
              {/* Register */}
              <Link
                href={`/${locale}/register`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-neutral-700 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-[#003399] transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-800 group-hover:text-[#003399] transition-colors">
                    {isSi ? 'ලියාපදිංචි වන්න' : 'Register'}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {isSi ? 'නව සාමාජික ගිණුමක් සකසන්න' : 'Create a new cooperative account'}
                  </p>
                </div>
              </Link>

              {/* Sign In */}
              <Link
                href={`/${locale}/login`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003399] flex items-center justify-center shrink-0 border border-blue-200 group-hover:bg-[#003399] group-hover:text-white transition-colors">
                  <LogIn className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-800 group-hover:text-[#003399] transition-colors">
                    {isSi ? 'ඇතුල් වන්න' : 'Sign in'}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {isSi ? 'ඔබගේ ගිණුමට පිවිසෙන්න' : 'Access your existing profile'}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
