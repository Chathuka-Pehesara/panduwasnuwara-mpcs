'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Lock, ArrowLeft, ShieldCheck, LogOut, CheckCircle2, AlertCircle, MessageCircle, X } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();

  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [recoveryWhatsAppNumber, setRecoveryWhatsAppNumber] = useState('94771234567');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotName, setForgotName] = useState('');
  const [forgotNic, setForgotNic] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');

  const checkStatus = async () => {
    try {
      // If there is no active tab session, prevent using cached or stale session
      if (typeof window !== 'undefined' && !sessionStorage.getItem('mpcs_active_session')) {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' })
        }).catch(() => {});
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAdmin(false);
        return;
      }

      const res = await fetch('/api/auth', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setIsAdmin(Boolean(data.isAdmin));
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('mpcs_active_session');
          sessionStorage.removeItem('mpcs_active_user');
        }
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAdmin(false);
      }
      if (data.recoveryWhatsAppNumber) {
        setRecoveryWhatsAppNumber(data.recoveryWhatsAppNumber);
      }
    } catch {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Clear state initially so no cached input is shown
    setNic('');
    setPassword('');
    setErrorMsg('');
    checkStatus();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setJustRegistered(true);
      }

      // Prevent back-forward cache (bfcache) from restoring stale authenticated view
      const handlePageShow = (e: PageTransitionEvent) => {
        if (e.persisted) {
          checkStatus();
        }
      };
      window.addEventListener('pageshow', handlePageShow);
      return () => {
        window.removeEventListener('pageshow', handlePageShow);
      };
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', nic, password })
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          // Store tab-scoped active session flag
          sessionStorage.setItem('mpcs_active_session', 'true');
          sessionStorage.setItem('mpcs_active_user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth-change'));
          window.location.href = data.user?.isAdmin ? `/${locale}/admin` : `/${locale}`;
        }
      } else {
        setErrorMsg(t('errorInvalid'));
      }
    } catch {
      setErrorMsg(t('errorInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mpcs_active_session');
      sessionStorage.removeItem('mpcs_active_user');
      sessionStorage.clear();
      window.dispatchEvent(new Event('auth-change'));
      window.location.reload();
    }
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  // WhatsApp Forgot Password Dispatcher
  const handleSendWhatsAppReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotName.trim() || !forgotNic.trim() || !forgotPhone.trim()) return;

    // Exact format required:
    // name - induwara
    // nic - 200478922...
    // phone number - 07642..
    // forgot password
    const message = `name - ${forgotName.trim()}\n\nnic - ${forgotNic.trim()}\n\nphone number - ${forgotPhone.trim()}\n\nforgot password`;
    
    // Clean target WhatsApp number (digits only)
    const cleanNumber = recoveryWhatsAppNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    setShowForgotModal(false);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-xs p-6 sm:p-8 space-y-6">

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToHome')}</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-neutral-200 flex items-center justify-center mx-auto text-[#003399]">
            {isAuthenticated ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="font-condensed text-2xl font-bold text-neutral-900">
            {isAuthenticated ? (isAdmin ? `${t('loggedInAs')} Admin` : t('loggedInUser')) : t('loginTitle')}
          </h1>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            {t('loginSubtitle')}
          </p>
        </div>

        {justRegistered && !isAuthenticated && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('registerSuccess')}</span>
          </div>
        )}

        {isAuthenticated ? (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isAdmin
                  ? `${t('loggedInAs')} Administrator (${currentUser?.username || 'admin'})`
                  : `${t('loggedInUser')}: ${currentUser?.fullName || currentUser?.username || currentUser?.nic}`}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-semibold text-center transition-colors shadow-xs"
                >
                  Go to Admin Dashboard
                </Link>
              )}

              <Link
                href={`/${locale}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-neutral-200 text-neutral-800 text-xs font-semibold text-center transition-colors"
              >
                {t('backToHome')}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 hover:bg-slate-50 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {t('nic')}
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder={t('nicPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('password')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#003399] hover:underline cursor-pointer"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs mt-2"
            >
              {isLoading ? '...' : t('signIn')}
            </button>

            <div className="text-center pt-2 border-t border-neutral-100 text-xs text-neutral-500">
              <span>{t('noAccount')} </span>
              <Link
                href={`/${locale}/register`}
                className="text-[#003399] font-bold hover:underline"
              >
                {t('registerHere')}
              </Link>
            </div>
          </form>
        )}

      </div>

      {/* Forgot Password Modal via WhatsApp */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-sm w-full p-6 space-y-4 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-emerald-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-condensed text-base font-bold text-neutral-900 leading-tight">
                  {t('forgotPasswordTitle')}
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              {t('forgotPasswordSubtitle')}
            </p>

            <form onSubmit={handleSendWhatsAppReset} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={forgotName}
                  onChange={(e) => setForgotName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('nic')} *
                </label>
                <input
                  type="text"
                  required
                  value={forgotNic}
                  onChange={(e) => setForgotNic(e.target.value.toUpperCase())}
                  placeholder={t('nicPlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs mt-3 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('sendWhatsApp')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
