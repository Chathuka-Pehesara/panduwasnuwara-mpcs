'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  FileCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lock,
  MessageSquare
} from 'lucide-react';
import { MembershipApplication } from '@/lib/types';

interface MembershipApplicationsTabProps {
  onCountChange?: (total: number, pending: number) => void;
}

export default function MembershipApplicationsTab({ onCountChange }: MembershipApplicationsTabProps) {
  const locale = useLocale();
  const isSi = locale === 'si';

  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modal States
  const [viewingApp, setViewingApp] = useState<MembershipApplication | null>(null);
  const [editingApp, setEditingApp] = useState<MembershipApplication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit Form Fields
  const [editFullNameSi, setEditFullNameSi] = useState('');
  const [editFullNameEn, setEditFullNameEn] = useState('');
  const [editNic, setEditNic] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPostalAddress, setEditPostalAddress] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editAdminNotes, setEditAdminNotes] = useState('');

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/membership-applications?status=all');
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
        const total = data.applications.length;
        const pending = data.applications.filter((a: MembershipApplication) => a.status === 'pending').length;
        if (onCountChange) {
          onCountChange(total, pending);
        }
      } else {
        setActionError(data.error || 'Failed to load membership applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setActionError('Network error loading applications');
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle Quick Status Change (Approve / Reject / Pending)
  const handleQuickStatus = async (id: number, newStatus: 'pending' | 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch('/api/admin/membership-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, admin_notes: notes })
      });
      const data = await res.json();
      if (data.success && data.application) {
        setApplications(prev =>
          prev.map(app => (app.id === id ? { ...app, ...data.application } : app))
        );
        if (viewingApp?.id === id) {
          setViewingApp(prev => (prev ? { ...prev, ...data.application } : null));
        }
      } else {
        alert(data.error || 'Failed to update application status');
      }
    } catch {
      alert('Error updating application status');
    }
  };

  // Open Edit Modal
  const openEditModal = (app: MembershipApplication) => {
    setEditingApp(app);
    setEditFullNameSi(app.full_name_si);
    setEditFullNameEn(app.full_name_en);
    setEditNic(app.nic);
    setEditPhone(app.phone);
    setEditEmail(app.email || '');
    setEditAddress(app.address);
    setEditPostalAddress(app.postal_address);
    setEditStatus(app.status);
    setEditAdminNotes(app.admin_notes || '');
  };

  // Save Edit Application
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/membership-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingApp.id,
          full_name_si: editFullNameSi,
          full_name_en: editFullNameEn,
          nic: editNic,
          phone: editPhone,
          email: editEmail,
          address: editAddress,
          postal_address: editPostalAddress,
          status: editStatus,
          admin_notes: editAdminNotes
        })
      });
      const data = await res.json();
      if (data.success && data.application) {
        setApplications(prev =>
          prev.map(app => (app.id === editingApp.id ? { ...app, ...data.application } : app))
        );
        if (viewingApp?.id === editingApp.id) {
          setViewingApp(data.application);
        }
        setEditingApp(null);
      } else {
        alert(data.error || 'Failed to edit application');
      }
    } catch {
      alert('Error saving edited application');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Application
  const handleDeleteApplication = async (id: number) => {
    if (!confirm(isSi ? 'මෙම සාමාජික අයදුම්පත ස්ථිරවම මකා දැමීමට ඔබට විශ්වාසද?' : 'Are you sure you want to permanently delete this application?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/membership-applications?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(app => app.id !== id));
        if (viewingApp?.id === id) setViewingApp(null);
        if (editingApp?.id === id) setEditingApp(null);
      } else {
        alert(data.error || 'Failed to delete application');
      }
    } catch {
      alert('Error deleting application');
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const idStr = `app-${String(app.id).padStart(5, '0')}`.toLowerCase();
    return (
      app.full_name_si?.toLowerCase().includes(q) ||
      app.full_name_en?.toLowerCase().includes(q) ||
      app.nic?.toLowerCase().includes(q) ||
      app.phone?.toLowerCase().includes(q) ||
      (app.email && app.email.toLowerCase().includes(q)) ||
      idStr.includes(q)
    );
  });

  // Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          TOP SUMMARY METRIC CARDS
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Applications */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isSi ? 'මුළු අයදුම්පත්' : 'Total Applications'}
            </span>
            <FileText className="w-4 h-4 text-[#003399]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900">
            {totalCount}
          </p>
          <p className="text-[11px] text-neutral-400">
            {isSi ? 'ලැබී ඇති සියලු අයදුම්' : 'All incoming applications'}
          </p>
        </div>

        {/* Pending Review */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isSi ? 'පරීක්ෂා කිරීමට ඇති' : 'Pending Review'}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-900">
            {pendingCount}
          </p>
          <p className="text-[11px] text-amber-700/80">
            {isSi ? 'තහවුරු කිරීම අපේක්ෂාවෙන්' : 'Awaiting admin decision'}
          </p>
        </div>

        {/* Approved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isSi ? 'අනුමත කළ අයදුම්' : 'Approved'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900">
            {approvedCount}
          </p>
          <p className="text-[11px] text-emerald-700/80">
            {isSi ? 'සාමාජිකත්වය අනුමතයි' : 'Officially sanctioned'}
          </p>
        </div>

        {/* Rejected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isSi ? 'ප්‍රතික්ෂේප කළ' : 'Rejected'}
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-900">
            {rejectedCount}
          </p>
          <p className="text-[11px] text-rose-700/80">
            {isSi ? 'ප්‍රතික්ෂේප කළ අයදුම්' : 'Declined / Incomplete'}
          </p>
        </div>
      </div>

      {/* -------------------------------------------------------------
          FILTER & SEARCH TOOLBAR
          ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isSi ? 'නම, ජා.හැ., දුරකථන හෝ ID මගින් සොයන්න...' : 'Search by Name, NIC, Phone, or #APP ID...'}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-slate-100 text-neutral-600 hover:bg-slate-200 hover:text-neutral-900'
              }`}
            >
              {isSi ? 'සියල්ල' : 'All'} ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {isSi ? 'පරීක්ෂා කිරීමට ඇති' : 'Pending'} ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isSi ? 'අනුමත කළ' : 'Approved'} ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              {isSi ? 'ප්‍රතික්ෂේප කළ' : 'Rejected'} ({rejectedCount})
            </button>

            <button
              onClick={fetchApplications}
              className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-slate-50 text-neutral-600 hover:text-neutral-900 transition-colors ml-auto cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          APPLICATIONS TABLE / LIST VIEW
          ------------------------------------------------------------- */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#003399]" />
            <p className="text-sm font-medium">{isSi ? 'අයදුම්පත් පූරණය වෙමින් පවතී...' : 'Loading applications...'}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 space-y-2">
            <FileText className="w-12 h-12 mx-auto text-neutral-300" />
            <p className="text-base font-semibold text-neutral-800">
              {isSi ? 'අයදුම්පත් කිසිවක් හමු නොවීය' : 'No applications found'}
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? (isSi ? 'සෙවුම් පරාමිතීන් වෙනස් කර නැවත බලන්න.' : 'Try changing your search or filter criteria.')
                : (isSi ? 'දැනට නව සාමාජික අයදුම්පත් ලැබී නොමැත.' : 'No member applications submitted yet.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-neutral-600 uppercase text-[11px] font-bold tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">{isSi ? 'අයදුම් අංකය' : 'App ID'}</th>
                  <th className="py-3.5 px-4">{isSi ? 'අයදුම්කරුගේ නම' : 'Applicant'}</th>
                  <th className="py-3.5 px-4">{isSi ? 'ජා.හැ. හා දුරකථනය' : 'NIC & Contact'}</th>
                  <th className="py-3.5 px-4">{isSi ? 'ලිපිනය' : 'Address'}</th>
                  <th className="py-3.5 px-4">{isSi ? 'මුද්‍රා තැබූ ලේඛනය' : 'Certified Document'}</th>
                  <th className="py-3.5 px-4">{isSi ? 'තත්වය' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isSi ? 'ක්‍රියා' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal text-neutral-800">
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* App ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#003399] whitespace-nowrap">
                      #APP-{String(app.id).padStart(5, '0')}
                    </td>

                    {/* Applicant */}
                    <td className="py-3.5 px-4 min-w-[180px]">
                      <p className="font-bold text-neutral-900">{app.full_name_en}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{app.full_name_si}</p>
                    </td>

                    {/* NIC & Phone */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-neutral-800">NIC: {app.nic}</div>
                      <div className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{app.phone}</span>
                      </div>
                      {app.email && (
                        <div className="text-[11px] text-neutral-400 truncate max-w-[160px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          <span>{app.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 min-w-[200px] text-xs text-neutral-600">
                      <p className="line-clamp-1 text-neutral-800 font-medium">{app.address}</p>
                      {app.postal_address && app.postal_address !== app.address && (
                        <p className="line-clamp-1 text-neutral-400 mt-0.5 text-[11px]">
                          Post: {app.postal_address}
                        </p>
                      )}
                    </td>

                    {/* Certified Document Thumbnail */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {app.certified_form_photo ? (
                        <div
                          onClick={() => setViewingApp(app)}
                          className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 hover:border-[#003399] transition-all cursor-pointer group shadow-2xs"
                          title="Click to review certified rubber-stamped document"
                        >
                          <Image
                            src={app.certified_form_photo}
                            alt="Certified Form"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No document</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isSi ? 'අනුමත කළ' : 'Approved'}</span>
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>{isSi ? 'ප්‍රතික්ෂේප කළ' : 'Rejected'}</span>
                        </span>
                      )}
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{isSi ? 'පරීක්ෂා කිරීමට ඇති' : 'Pending'}</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick View Button */}
                        <button
                          onClick={() => setViewingApp(app)}
                          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-[#003399] transition-colors cursor-pointer"
                          title={isSi ? 'විස්තර සහ ලේඛනය බලන්න' : 'View Document & Review'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick Approve Button */}
                        {app.status !== 'approved' && (
                          <button
                            onClick={() => handleQuickStatus(app.id, 'approved')}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title={isSi ? 'අනුමත කරන්න' : 'Approve Application'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Quick Reject Button */}
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => handleQuickStatus(app.id, 'rejected')}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                            title={isSi ? 'ප්‍රතික්ෂේප කරන්න' : 'Reject Application'}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-[#003399] transition-colors cursor-pointer"
                          title={isSi ? 'සංස්කරණය කරන්න' : 'Edit Application'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title={isSi ? 'මකා දමන්න' : 'Delete Application'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          DOCUMENT & REVIEW MODAL
          ------------------------------------------------------------- */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setViewingApp(null)} />
          <div className="relative w-full max-w-3xl bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-neutral-900 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200/90 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#003399] flex items-center justify-center font-bold font-mono">
                  #APP
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-condensed">
                    {viewingApp.full_name_en} ({viewingApp.full_name_si})
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    ID: #APP-{String(viewingApp.id).padStart(5, '0')} • Submitted {new Date(viewingApp.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Applicant Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {isSi ? 'ජාතික හැඳුනුම්පත් අංකය' : 'NIC Number'}
                  </span>
                  <span className="font-mono font-bold text-neutral-900">{viewingApp.nic}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {isSi ? 'දුරකථන අංකය' : 'Phone Number'}
                  </span>
                  <span className="font-mono text-neutral-900">{viewingApp.phone}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {isSi ? 'විද්‍යුත් තැපෑල' : 'Email Address'}
                  </span>
                  <span className="text-neutral-900">{viewingApp.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {isSi ? 'අයදුම්පත් තත්වය' : 'Application Status'}
                  </span>
                  <span className="font-bold uppercase tracking-wider text-xs">
                    {viewingApp.status}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {isSi ? 'ස්ථිර ලිපිනය' : 'Residential Address'}
                  </span>
                  <span className="text-neutral-800">{viewingApp.address}</span>
                </div>
                {viewingApp.postal_address && (
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      {isSi ? 'තැපැල් ලිපිනය' : 'Postal Address'}
                    </span>
                    <span className="text-neutral-800">{viewingApp.postal_address}</span>
                  </div>
                )}
                {viewingApp.admin_notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-neutral-200">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      {isSi ? 'පරිපාලන සටහන්' : 'Admin Notes'}
                    </span>
                    <span className="text-neutral-800 italic">{viewingApp.admin_notes}</span>
                  </div>
                )}
              </div>

              {/* Certified Document Photo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#003399]" />
                    <span>{isSi ? 'නිල රබර් මුද්‍රා තැබූ අයදුම්පත්‍රය' : 'Certified Form (With Branch Rubber Seal)'}</span>
                  </span>
                  {viewingApp.certified_form_photo && (
                    <a
                      href={viewingApp.certified_form_photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#003399] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isSi ? 'මුල් ප්‍රමාණයෙන් බලන්න' : 'Open Full Size'}</span>
                    </a>
                  )}
                </div>

                {viewingApp.certified_form_photo ? (
                  <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-inner">
                    <Image
                      src={viewingApp.certified_form_photo}
                      alt="Certified Application Form"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-neutral-200 rounded-2xl text-neutral-400">
                    No document photo uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-neutral-200/90 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  const toEdit = viewingApp;
                  setViewingApp(null);
                  openEditModal(toEdit);
                }}
                className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isSi ? 'සංස්කරණය' : 'Edit Details'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickStatus(viewingApp.id, 'rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isSi ? 'ප්‍රතික්ෂේප කරන්න' : 'Reject'}</span>
                </button>
                <button
                  onClick={() => handleQuickStatus(viewingApp.id, 'approved')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSi ? 'අනුමත කරන්න' : 'Approve'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          EDIT APPLICATION MODAL
          ------------------------------------------------------------- */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setEditingApp(null)} />
          <div className="relative w-full max-w-2xl bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-neutral-900 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200/90 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#003399] flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-condensed">
                    {isSi ? 'අයදුම්පත සංස්කරණය කිරීම' : 'Edit Membership Application'}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    #APP-{String(editingApp.id).padStart(5, '0')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name Sinhala */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'සම්පූර්ණ නම (සිංහලෙන්)' : 'Full Name (Sinhala)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullNameSi}
                    onChange={e => setEditFullNameSi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white"
                  />
                </div>

                {/* Full Name English */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'සම්පූර්ණ නම (ඉංග්‍රීසියෙන්)' : 'Full Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullNameEn}
                    onChange={e => setEditFullNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white"
                  />
                </div>

                {/* NIC */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'ජාතික හැඳුනුම්පත් අංකය' : 'NIC Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editNic}
                    onChange={e => setEditNic(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 font-mono focus:outline-none focus:border-[#003399] focus:bg-white"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'දුරකථන අංකය' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 font-mono focus:outline-none focus:border-[#003399] focus:bg-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'විද්‍යුත් තැපෑල (විකල්ප)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'ස්ථිර ලිපිනය' : 'Address'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white resize-none"
                  />
                </div>

                {/* Postal Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'තැපැල් ලිපිනය' : 'Postal Address'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editPostalAddress}
                    onChange={e => setEditPostalAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white resize-none"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'අයදුම්පත් තත්වය' : 'Status'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white"
                  >
                    <option value="pending">{isSi ? 'පරීක්ෂා කිරීමට ඇති (Pending)' : 'Pending'}</option>
                    <option value="approved">{isSi ? 'අනුමත කළ (Approved)' : 'Approved'}</option>
                    <option value="rejected">{isSi ? 'ප්‍රතික්ෂේප කළ (Rejected)' : 'Rejected'}</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block">
                    {isSi ? 'පරිපාලන සටහන්' : 'Admin Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={editAdminNotes}
                    onChange={e => setEditAdminNotes(e.target.value)}
                    placeholder="Enter internal review notes or approval remarks..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#003399] focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {isSi ? 'අවලංගු කරන්න' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002673] text-white font-bold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (isSi ? 'සුරකිමින්...' : 'Saving...') : (isSi ? 'වෙනස්කම් සුරකින්න' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
