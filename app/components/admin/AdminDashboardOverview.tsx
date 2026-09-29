'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  Users,
  Radio,
  FileSpreadsheet,
  Vote,
  Clock,
  FileCheck,
  Mail,
  MessageSquare,
  ArrowRight,
  RotateCw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface MetricData {
  activeGuests: number;
  registeredUsers: number;
  membersCount: number;
  votersCount: number;
  pendingApplications: number;
  totalApplications: number;
  unreadMessages: number;
}

interface LatestApplication {
  id: number;
  full_name_si: string;
  full_name_en: string;
  nic: string;
  phone: string;
  email?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface LatestMessage {
  id: number;
  business_key: string;
  business_name: string;
  user_name: string;
  phone: string;
  email?: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: 'users' | 'applications' | 'metrics' | 'news' | 'gallery' | 'messages' | 'services' | 'fuel' | 'settings', detailId?: any) => void;
}

export default function AdminDashboardOverview({ onNavigateTab }: AdminDashboardOverviewProps) {
  const locale = useLocale();

  const [metrics, setMetrics] = useState<MetricData>({
    activeGuests: 0,
    registeredUsers: 0,
    membersCount: 0,
    votersCount: 0,
    pendingApplications: 0,
    totalApplications: 0,
    unreadMessages: 0
  });

  const [latestApplications, setLatestApplications] = useState<LatestApplication[]>([]);
  const [latestMessages, setLatestMessages] = useState<LatestMessage[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.latestApplications)) setLatestApplications(data.latestApplications);
        if (Array.isArray(data.latestMessages)) setLatestMessages(data.latestMessages);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error('Failed to load dashboard overview data:', err);
    } finally {
      setIsLoading(false);
      if (showRefreshingSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh real-time numbers every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getRelativeTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return locale === 'si' ? 'මීට සුළු මොහොතකට පෙර' : 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return locale === 'si' ? `විනාඩි ${diffMin} කට පෙර` : `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return locale === 'si' ? `පැය ${diffHours} කට පෙර` : `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return locale === 'si' ? `දින ${diffDays} කට පෙර` : `${diffDays}d ago`;
    } catch {
      return formatDate(isoString);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white rounded-2xl border border-neutral-200/90 animate-pulse p-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-neutral-200/90 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* EXECUTIVE WELCOME & REFRESH BAR */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {locale === 'si' ? 'පද්ධතිය සක්‍රියයි' : 'Live Dashboard'}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {lastRefreshedAt ? `${locale === 'si' ? 'යාවත්කාලීන කිරීම' : 'Updated'}: ${lastRefreshedAt.toLocaleTimeString()}` : ''}
            </span>
          </div>
          <h2 className="font-condensed text-xl sm:text-2xl font-bold text-neutral-900 mt-1.5">
            {locale === 'si' ? 'පඬුවස්නුවර සමුපකාර පාලන පුවරුව' : 'Panduwasnuwara MPCS Executive Overview'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {locale === 'si'
              ? 'වෙබ් අඩවි ක්‍රියාකාරකම්, ලියාපදිංචි සාමාජිකයින්, අයදුම්පත් සහ පාරිභෝගික විමසීම් පිළිබඳ සජීවී දළ විශ්ලේෂණය.'
              : 'Real-time overview of active visitors, member registry, submitted applications, and customer inquiries.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-[#003399] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh metrics"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#003399]' : ''}`} />
            <span>{locale === 'si' ? 'යාවත්කාලීන කරන්න' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 7 KEY METRICS & COUNTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-condensed text-sm font-bold uppercase tracking-wider text-neutral-500">
            {locale === 'si' ? 'ප්‍රධාන සංඛ්‍යාලේඛන සහ ප්‍රමිතික' : 'Core Metrics & Live Counts'}
          </h3>
          <span className="text-[11px] text-neutral-400 font-mono">7 Metrics Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. USERS ONLINE NOW (GUESTS) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-800 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                LIVE
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {metrics.activeGuests}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1">
                {locale === 'si' ? 'සක්‍රිය අමුත්තන් (Guests)' : 'Users Online Now (Guests)'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                {locale === 'si'
                  ? 'ගිණුමකට ඇතුළු නොවී වෙබ් අඩවිය නරඹන අමුත්තන්'
                  : 'Real-time visitors active on website (not signed in)'}
              </p>
            </div>
          </div>

          {/* 2. REGISTERED WEBSITE USERS */}
          <div
            onClick={() => onNavigateTab('users')}
            className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-[#003399]/40 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {locale === 'si' ? 'පරිශීලකයින්' : 'Accounts'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#003399] flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {metrics.registeredUsers}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1 flex items-center justify-between">
                <span>{locale === 'si' ? 'ලියාපදිංචි වෙබ් පරිශීලකයින්' : 'Registered Website Users'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#003399] transition-all" />
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locale === 'si' ? 'වෙබ් අඩවියේ සාදන ලද සමස්ත ගිණුම්' : 'Total registered accounts on website'}
              </p>
            </div>
          </div>

          {/* 3. MEMBERS (EXCEL / CSV) */}
          <div
            onClick={() => onNavigateTab('metrics')}
            className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                CSV / EXCEL
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {metrics.membersCount.toLocaleString()}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1 flex items-center justify-between">
                <span>{locale === 'si' ? 'සමුපකාර සාමාජිකයින් (Excel)' : 'Members (Excel / CSV)'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locale === 'si' ? 'දත්ත ගොනුවෙන් ඇතුළත් කළ සාමාජිකයින්' : 'Total cooperative members loaded from dataset'}
              </p>
            </div>
          </div>

          {/* 4. ELIGIBLE VOTERS */}
          <div
            onClick={() => onNavigateTab('metrics')}
            className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-teal-300 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                ELECTORAL
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <Vote className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {metrics.votersCount.toLocaleString()}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1 flex items-center justify-between">
                <span>{locale === 'si' ? 'ඡන්ද හිමි සාමාජිකයින්' : 'Eligible Voters'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-teal-700 transition-all" />
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locale === 'si' ? 'ඡන්ද හිමිකම් ඇති සාමාජික සංඛ්‍යාව' : 'Members with verified voting eligibility'}
              </p>
            </div>
          </div>

          {/* 5. PENDING APPLICATIONS */}
          <div
            onClick={() => onNavigateTab('applications')}
            className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              {metrics.pendingApplications > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  REQUIRES REVIEW
                </span>
              ) : (
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  PENDING
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight flex items-baseline gap-2">
                <span>{metrics.pendingApplications}</span>
                {metrics.pendingApplications > 0 && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Pending
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1 flex items-center justify-between">
                <span>{locale === 'si' ? 'අනුමත නොකළ අයදුම්පත්' : 'Pending Applications'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-amber-700 transition-all" />
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locale === 'si' ? 'අනුමත කිරීමට හෝ ප්‍රතික්ෂේප කිරීමට ඇති අයදුම්පත්' : 'Applications not yet approved or declined'}
              </p>
            </div>
          </div>

          {/* 6. TOTAL APPLICATIONS */}
          <div
            onClick={() => onNavigateTab('applications')}
            className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-[#003399]/40 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                REGISTRY
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#003399] flex items-center justify-center border border-blue-100">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {metrics.totalApplications}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1 flex items-center justify-between">
                <span>{locale === 'si' ? 'මුළු අයදුම්පත් සංඛ්‍යාව' : 'Total Applications'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#003399] transition-all" />
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locale === 'si' ? 'ඉදිරිපත් කර ඇති සමස්ත සාමාජික අයදුම්පත්' : 'Overall count of all submitted applications'}
              </p>
            </div>
          </div>

          {/* 7. UNREAD MESSAGES */}
          <div
            onClick={() => onNavigateTab('messages')}
            className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-2xs hover:shadow-sm hover:border-rose-300 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              {metrics.unreadMessages > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  NEW MESSAGES
                </span>
              ) : (
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  INQUIRIES
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight flex items-baseline gap-2">
                <span>{metrics.unreadMessages}</span>
                {metrics.unreadMessages > 0 && (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    Unread
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-neutral-800 mt-1 flex items-center justify-between">
                <span>{locale === 'si' ? 'නොකියවූ පණිවිඩ' : 'Unread Messages'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-rose-700 transition-all" />
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {locale === 'si' ? 'ව්‍යාපාරික අංශ හා සම්බන්ධතා විමසීම්' : 'Inquiries received via business contact forms'}
              </p>
            </div>
          </div>

          {/* CHAT THREADS (HOOK / COMING SOON PLACEHOLDER) */}
          <div className="bg-slate-50/80 rounded-2xl border border-dashed border-neutral-300 p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded-full">
                  COMING SOON
                </span>
                <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold font-mono text-neutral-400">
                  —
                </div>
                <h4 className="text-xs font-bold text-neutral-700 mt-1">
                  {locale === 'si' ? 'සජීවී කතාබස් (Chat Threads)' : 'Chat Threads'}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                  {locale === 'si'
                    ? 'කතාබස් නූල් සහ සජීවී සන්නිවේදනය ඉදිරියේදී සම්බන්ධ කෙරේ'
                    : 'Real-time customer chat threads integration hook'}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Will be configured upon request</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: LATEST APPLICATIONS & LATEST MESSAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* LEFT COLUMN: LATEST APPLICATIONS */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003399] flex items-center justify-center border border-blue-100">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-condensed text-base font-bold text-neutral-900 leading-tight">
                    {locale === 'si' ? 'නවතම සාමාජික අයදුම්පත්' : 'Latest Applications'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {locale === 'si' ? 'මෑතකදී යාවත්කාලීන වූ සාමාජික අයදුම්පත්' : 'Most recently submitted or updated application records'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('applications')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-[#003399]/5 text-neutral-700 hover:text-[#003399] text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer"
              >
                <span>{locale === 'si' ? 'සියල්ල' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-neutral-100">
              {latestApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-neutral-400 mx-auto flex items-center justify-center mb-2">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">
                    {locale === 'si' ? 'තවමත් අයදුම්පත් නොමැත' : 'No applications submitted yet'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {locale === 'si' ? 'නව අයදුම්පත් ඉදිරිපත් වූ පසු මෙහි දිස්වනු ඇත' : 'New membership applications will show up here'}
                  </p>
                </div>
              ) : (
                latestApplications.map(app => {
                  const displayName = (locale === 'si' && app.full_name_si) ? app.full_name_si : app.full_name_en;
                  return (
                    <div
                      key={app.id}
                      onClick={() => onNavigateTab('applications')}
                      className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            #{app.id}
                          </span>
                          <span className="text-xs font-semibold text-neutral-900 truncate">
                            {displayName}
                          </span>
                          {/* Status Badge */}
                          {app.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending
                            </span>
                          )}
                          {app.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          )}
                          {app.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Declined
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1 flex-wrap font-mono">
                          <span>NIC: {app.nic}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {app.phone}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          {getRelativeTime(app.updated_at || app.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003399] group-hover:translate-x-0.5 transition-transform mt-1">
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-neutral-100 text-center">
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs font-semibold text-[#003399] hover:underline cursor-pointer"
            >
              {locale === 'si' ? 'අයදුම්පත් කළමනාකරණය වෙත යන්න →' : 'Go to Membership Applications Registry →'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LATEST MESSAGES */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-condensed text-base font-bold text-neutral-900 leading-tight">
                    {locale === 'si' ? 'නවතම පණිවිඩ සහ විමසීම්' : 'Latest Messages'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {locale === 'si' ? 'පාරිභෝගිකයින්ගෙන් ලැබුණු නවතම විමසීම්' : 'Most recently submitted inquiries across all business divisions'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('messages')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-rose-50 text-neutral-700 hover:text-rose-700 text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer"
              >
                <span>{locale === 'si' ? 'සියල්ල' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-neutral-100">
              {latestMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-neutral-400 mx-auto flex items-center justify-center mb-2">
                    <Mail className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">
                    {locale === 'si' ? 'තවමත් පණිවිඩ නොමැත' : 'No messages received yet'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {locale === 'si' ? 'සම්බන්ධතා පෝරම වලින් ලැබෙන පණිවිඩ මෙහි දිස්වනු ඇත' : 'Inquiries submitted through the website will appear here'}
                  </p>
                </div>
              ) : (
                latestMessages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => onNavigateTab('messages')}
                    className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {msg.user_name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {msg.business_name}
                        </span>
                        {/* Status Badge */}
                        {msg.status === 'unread' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Unread
                          </span>
                        )}
                        {msg.status === 'replied' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Replied
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-700 font-medium mt-1 truncate">
                        {msg.subject}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {msg.message}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        {getRelativeTime(msg.updated_at || msg.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003399] group-hover:translate-x-0.5 transition-transform mt-1">
                        <span>Reply</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-neutral-100 text-center">
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-semibold text-[#003399] hover:underline cursor-pointer"
            >
              {locale === 'si' ? 'පණිවිඩ සහ විමසීම් අංශය වෙත යන්න →' : 'Go to Customer Inquiries & Messages →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
