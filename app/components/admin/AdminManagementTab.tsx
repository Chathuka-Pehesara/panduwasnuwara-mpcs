'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  User,
  Phone,
  Mail,
  KeyRound,
  X,
  Shield
} from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface AdminManagementTabProps {
  currentUsername?: string;
}

export default function AdminManagementTab({ currentUsername }: AdminManagementTabProps) {
  const locale = useLocale();
  const [admins, setAdmins] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAdmin, setEditingAdmin] = useState<UserType | null>(null);

  // Form Fields
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formNic, setFormNic] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'superadmin'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (data.success && Array.isArray(data.admins)) {
        setAdmins(data.admins);
      } else {
        setError(data.error || 'Failed to load administrator accounts');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingAdmin(null);
    setFormUsername('');
    setFormFullName('');
    setFormNic('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('admin');
    setShowPassword(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: UserType) => {
    setModalMode('edit');
    setEditingAdmin(admin);
    setFormUsername(admin.username);
    setFormFullName(admin.full_name || '');
    setFormNic(admin.nic || '');
    setFormPhone(admin.phone || '');
    setFormEmail(admin.email || '');
    setFormPassword('');
    setFormRole(admin.role === 'superadmin' ? 'superadmin' : 'admin');
    setShowPassword(false);
    setFormError('');
    setIsModalOpen(true);
  };



  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (modalMode === 'create') {
      if (!formUsername.trim() || !formFullName.trim() || !formPassword.trim()) {
        setFormError(locale === 'si' ? 'පරිශීලක නාමය, සම්පූර්ණ නම සහ මුරපදය අනිවාර්ය වේ.' : 'Username, Full Name, and Password are required.');
        return;
      }
      if (formPassword.trim().length < 5) {
        setFormError(locale === 'si' ? 'මුරපදය අවම වශයෙන් අක්ෂර 5ක් විය යුතුය.' : 'Password must be at least 5 characters.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formUsername,
            fullName: formFullName,
            nic: formNic,
            phone: formPhone,
            email: formEmail,
            password: formPassword,
            role: formRole
          })
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setAdmins(prev => [...prev, data.admin]);
          setIsModalOpen(false);
          setSuccessMsg(locale === 'si' ? 'නව පරිපාලක සාර්ථකව එක් කරන ලදී.' : 'New administrator created successfully.');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setFormError(data.error || 'Failed to create administrator');
        }
      } else if (editingAdmin) {
        const res = await fetch('/api/admin/admins', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAdmin.id,
            fullName: formFullName,
            nic: formNic,
            phone: formPhone,
            email: formEmail,
            role: formRole
          })
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? data.admin : a));
          setIsModalOpen(false);
          setSuccessMsg(locale === 'si' ? 'පරිපාලක තොරතුරු යාවත්කාලීන කරන ලදී.' : 'Administrator updated successfully.');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setFormError(data.error || 'Failed to update administrator');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: UserType) => {
    const confirmMsg = locale === 'si'
      ? `ඔබට "${admin.full_name || admin.username}" පරිපාලක ගිණුම ඉවත් කිරීමට අවශ්‍ය බව සහතිකද?`
      : `Are you sure you want to delete administrator "${admin.full_name || admin.username}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/admins?id=${admin.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAdmins(prev => prev.filter(a => a.id !== admin.id));
        setSuccessMsg(locale === 'si' ? 'පරිපාලක සාර්ථකව ඉවත් කරන ලදී.' : 'Administrator removed successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to delete administrator');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting administrator');
    }
  };

  const filteredAdmins = admins.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.username?.toLowerCase().includes(q) ||
      a.full_name?.toLowerCase().includes(q) ||
      a.nic?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner - Official Institutional Styling */}
      <div className="bg-white rounded-xl border border-neutral-200 border-l-4 border-l-[#003399] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[#003399] text-xs font-bold font-mono uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#003399]" />
              <span>Super Administrator Exclusive Privilege</span>
            </div>
            <h2 className="font-condensed text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {locale === 'si' ? 'පද්ධති පරිපාලක කළමනාකරණය' : 'Administrator Credentials & Access Control'}
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {locale === 'si'
                ? 'සියලුම පද්ධති පරිපාලකයින් පාලනය කරන්න, නව පරිපාලකයින් එක් කරන්න, මුරපද නැවත සකසන්න සහ වරප්‍රසාද කළමනාකරණය කරන්න.'
                : 'Manage system administrators, grant access rights, reset security credentials, and maintain administrative audit integrity.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAdmins}
              className="p-2.5 rounded-lg bg-white hover:bg-slate-50 text-neutral-700 hover:text-[#003399] transition-colors cursor-pointer border border-neutral-300 shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#003399] hover:bg-[#002266] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{locale === 'si' ? '+ නව පරිපාලකයෙකු එක් කරන්න' : '+ Add Administrator'}</span>
            </button>
          </div>
        </div>

        {/* Security & Password Privacy Guidance Note */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2.5 text-xs text-neutral-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
          <Lock className="w-4 h-4 text-[#003399] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold text-neutral-800">
              {locale === 'si' ? 'ආරක්ෂක සහ මුරපද රහස්‍යතා ප්‍රතිපත්තිය:' : 'Security & Password Privacy Policy:'}
            </span>
            <p className="text-[11px] text-neutral-500">
              {locale === 'si'
                ? 'පරිපාලකයින්ගේ පෞද්ගලිකත්වය සහ දත්ත ආරක්ෂාව තහවුරු කිරීම සඳහා, පරිපාලක මුරපද බැලීමට හෝ වෙනස් කිරීමට Super Admin හට ප්‍රවේශයක් නොමැත. සෑම පරිපාලකයෙකුටම තමන්ගේ "මගේ පැතිකඩ" (Profile) අංශය මඟින් තම මුරපදය ස්වාධීනව කළමනාකරණය කළ හැක.'
                : 'To safeguard administrative privacy and security ethics, Super Admins cannot view or modify other administrators\' passwords. Each administrator securely manages and updates their own credentials via their personal Profile section.'}
            </p>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={locale === 'si' ? 'නම, පරිශීලක නාමය හෝ හැඳුනුම්පත මඟින් සොයන්න...' : 'Search by username, name, or NIC...'}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-600">
          <span className="px-3 py-1 rounded-md bg-blue-50 text-[#003399] border border-blue-200">
            {admins.length} Total Admins
          </span>
          <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
            {admins.filter(a => a.role === 'superadmin').length} Super Admins
          </span>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#003399] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Loading Administrator Accounts...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm font-bold text-neutral-700">No Administrators Found</p>
            <p className="text-xs text-neutral-400">Try adjusting your search criteria or click "Add Administrator".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-slate-50 text-neutral-700 font-bold font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Access Role</th>
                  <th className="py-3.5 px-4">Username & NIC</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAdmins.map((admin) => {
                  const isSuper = admin.role === 'superadmin';
                  const isCurrent = admin.username.toLowerCase() === (currentUsername || '').toLowerCase();
                  const isRoot = admin.username.toLowerCase() === 'superadmin';

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isSuper 
                              ? 'bg-slate-900 text-amber-400 border-slate-800'
                              : 'bg-slate-100 text-[#003399] border-slate-200'
                          }`}>
                            {isSuper ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 text-sm">{admin.full_name || admin.username}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-[#003399] font-mono">
                                   YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block">ID: #{admin.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-900 border border-slate-300 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            SUPER ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#003399] border border-blue-200 font-mono">
                            <ShieldAlert className="w-3.5 h-3.5 text-[#003399]" />
                            ADMINISTRATOR
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-neutral-800 block text-xs">{admin.username}</span>
                        <span className="text-[11px] text-neutral-500 block">{admin.nic || '—'}</span>
                      </td>



                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {admin.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-mono">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{admin.phone}</span>
                            </div>
                          )}
                          {admin.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              <span className="truncate max-w-[150px]">{admin.email}</span>
                            </div>
                          )}
                          {!admin.phone && !admin.email && <span className="text-neutral-400 text-[11px]">—</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">


                          <button
                            onClick={() => openEditModal(admin)}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-[#003399] hover:bg-blue-50 transition-colors cursor-pointer"
                            title={locale === 'si' ? 'තොරතුරු සංස්කරණය' : 'Edit Credentials'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isRoot && !isCurrent && (
                            <button
                              onClick={() => handleDeleteAdmin(admin)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={locale === 'si' ? 'ඉවත් කරන්න' : 'Revoke Access'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed text-lg font-bold text-neutral-900">
                    {modalMode === 'create'
                      ? (locale === 'si' ? 'නව පරිපාලකයෙකු ලියාපදිංචි කිරීම' : 'Create Administrator Account')
                      : (locale === 'si' ? 'පරිපාලක තොරතුරු සංස්කරණය' : 'Edit Administrator Credentials')}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {locale === 'si' ? 'පද්ධති ප්‍රවේශය සහ ආරක්ෂක විස්තර' : 'System access role and security credentials'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Username / පරිශීලක නාමය <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'edit'}
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="e.g. admin_kasun"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden disabled:opacity-60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Full Name / සම්පූර්ණ නම <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                    placeholder="e.g. K. W. Jayasinghe"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    NIC / හැඳුනුම්පත් අංකය
                  </label>
                  <input
                    type="text"
                    value={formNic}
                    onChange={e => setFormNic(e.target.value)}
                    placeholder="e.g. 198512345678"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Phone / දුරකථන අංකය
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Email / විද්‍යුත් තැපෑල (Optional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. officer@panduwasnuwara.mpcs.lk"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>

                {modalMode === 'create' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Password / ආරම්භක මුරපදය <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formPassword}
                        onChange={e => setFormPassword(e.target.value)}
                        placeholder="Enter secure initial password (min 5 chars)"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {locale === 'si' ? 'නව පරිපාලක හට පද්ධතියට ප්‍රවේශ වීම සඳහා ආරම්භක මුරපදයක් සකසන්න.' : 'Set an initial login password for this new administrator.'}
                    </p>
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-neutral-200 flex items-start gap-2.5 text-[11px] text-neutral-600 leading-relaxed">
                    <Lock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-800 block mb-0.5">
                        {locale === 'si' ? 'මුරපද ආරක්ෂණ ප්‍රතිපත්තිය' : 'Password Privacy Policy'}
                      </span>
                      <span>
                        {locale === 'si'
                          ? 'පරිපාලකයින්ගේ පෞද්ගලිකත්වය සහ දත්ත ආරක්ෂාව තහවුරු කිරීම සඳහා, Super Admin හට පරිපාලක මුරපද වෙනස් කිරීමට අවසර නැත. සෑම පරිපාලකයෙකුටම තමන්ගේ "මගේ පැතිකඩ" (Profile) අංශය මඟින් තම මුරපදය ස්වාධීනව වෙනස් කරගත හැක.'
                          : 'To protect privacy and security ethics, Super Admins cannot view or modify other administrators\' passwords. Each administrator manages and updates their own password independently via their Profile section.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Administrative Role / පරිපාලක තනතුර <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'admin'
                        ? 'border-[#003399] bg-blue-50/60 ring-2 ring-[#003399]/20'
                        : 'border-neutral-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="adminRole"
                        value="admin"
                        checked={formRole === 'admin'}
                        onChange={() => setFormRole('admin')}
                        className="text-[#003399]"
                      />
                      <div>
                        <span className="font-bold text-xs text-neutral-900 block">Administrator</span>
                        <span className="text-[10px] text-neutral-500 block">Standard admin privileges</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'superadmin'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-neutral-200 bg-white hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="adminRole"
                        value="superadmin"
                        checked={formRole === 'superadmin'}
                        onChange={() => setFormRole('superadmin')}
                        className="text-amber-600"
                      />
                      <div>
                        <span className="font-bold text-xs text-neutral-900 block flex items-center gap-1">
                          Super Admin
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                        <span className="text-[10px] text-neutral-500 block">Manage other admins</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {locale === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting 
                    ? (locale === 'si' ? 'සුරකිමින්...' : 'Saving...')
                    : modalMode === 'create'
                      ? (locale === 'si' ? 'පරිපාලක එක් කරන්න' : 'Create Administrator')
                      : (locale === 'si' ? 'වෙනස්කම් සුරකින්න' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
