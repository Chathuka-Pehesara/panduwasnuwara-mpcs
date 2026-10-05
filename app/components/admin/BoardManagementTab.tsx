'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  MapPin,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import { BoardMemberDB } from '@/lib/models/board';

interface BoardManagementTabProps {
  onCountChange?: (count: number) => void;
}

export default function BoardManagementTab({ onCountChange }: BoardManagementTabProps) {
  const locale = useLocale();
  const isSi = locale === 'si';

  const [members, setMembers] = useState<BoardMemberDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'chairman' | 'vice_chairman' | 'director' | 'officer'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMemberDB | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form Fields
  const [nameSi, setNameSi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [positionSi, setPositionSi] = useState('');
  const [positionEn, setPositionEn] = useState('');
  const [qualification, setQualification] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [roleType, setRoleType] = useState<'chairman' | 'vice_chairman' | 'director' | 'officer'>('director');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Board Members
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/board');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
        if (onCountChange) {
          onCountChange(data.members.length);
        }
      } else {
        setActionError(data.error || 'Failed to fetch board members');
      }
    } catch {
      setActionError('Failed to fetch board members. Check connection.');
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Open Modal for Add
  const openAddModal = () => {
    setEditingMember(null);
    setNameSi('');
    setNameEn('');
    setPositionSi('');
    setPositionEn('');
    setQualification('');
    setPhone('');
    setEmail('');
    setAddress('');
    setRoleType('director');
    setDisplayOrder(members.length + 1);
    setPhotoFile(null);
    setPhotoPreview(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (member: BoardMemberDB) => {
    setEditingMember(member);
    setNameSi(member.name_si || '');
    setNameEn(member.name_en || '');
    setPositionSi(member.position_si || '');
    setPositionEn(member.position_en || '');
    setQualification(member.qualification || '');
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setAddress(member.address || '');
    setRoleType(member.role_type || 'director');
    setDisplayOrder(member.display_order || 0);
    setPhotoFile(null);
    setPhotoPreview(member.image_src || null);
    setActionError(null);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameSi.trim() || !nameEn.trim() || !positionSi.trim() || !positionEn.trim()) {
      setActionError(isSi ? 'නම් සහ තනතුරු සිංහලෙන් හා ඉංග්‍රීසියෙන් ඇතුළත් කරන්න.' : 'Names and positions in both languages are required.');
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      const formData = new FormData();
      if (editingMember) {
        formData.append('id', String(editingMember.id));
      }
      formData.append('name_si', nameSi.trim());
      formData.append('name_en', nameEn.trim());
      formData.append('position_si', positionSi.trim());
      formData.append('position_en', positionEn.trim());
      formData.append('qualification', qualification.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('address', address.trim());
      formData.append('role_type', roleType);
      formData.append('display_order', String(displayOrder));
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (editingMember?.image_src) {
        formData.append('image_src', editingMember.image_src);
      }

      const method = editingMember ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/board', {
        method,
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setActionSuccess(editingMember 
          ? (isSi ? 'අධ්‍යක්ෂ තොරතුරු සාර්ථකව යාවත්කාලීන විය!' : 'Board member updated successfully!') 
          : (isSi ? 'නව අධ්‍යක්ෂ සාර්ථකව ඇතුළත් විය!' : 'New board member added successfully!'));
        setTimeout(() => setActionSuccess(null), 3000);
        await fetchMembers();
      } else {
        setActionError(data.error || 'Failed to save board member');
      }
    } catch {
      setActionError('Error saving board member details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/board?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDeletingId(null);
        setActionSuccess(isSi ? 'අධ්‍යක්ෂ සාර්ථකව ඉවත් කරන ලදී.' : 'Board member deleted successfully.');
        setTimeout(() => setActionSuccess(null), 3000);
        await fetchMembers();
      } else {
        setActionError(data.error || 'Failed to delete member');
      }
    } catch {
      setActionError('Error deleting member.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name_si.toLowerCase().includes(q) ||
      m.name_en.toLowerCase().includes(q) ||
      m.position_si.toLowerCase().includes(q) ||
      m.position_en.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q));

    const matchesRole = roleFilter === 'all' || m.role_type === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'chairman':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Chairman</span>;
      case 'vice_chairman':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Vice Chairman</span>;
      case 'director':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Director</span>;
      case 'officer':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">Administrative Officer</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/80">
              <ShieldCheck className="w-5 h-5 text-[#003399]" />
            </div>
            <div>
              <h2 className="font-condensed text-lg sm:text-xl font-bold text-neutral-900 leading-tight">
                {isSi ? 'අධ්‍යක්ෂ මණ්ඩල කළමනාකරණය' : 'Board of Directors Management'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                {isSi
                  ? 'වෙබ් අඩවියේ ප්‍රදර්ශනය වන සභාපති, අධ්‍යක්ෂවරුන් සහ නිලධාරීන්ගේ තොරතුරු සංස්කරණය කරන්න.'
                  : 'Manage leadership profiles, qualifications, and designations displayed on the official website.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchMembers}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSi ? 'නව සාමාජිකයෙකු එක් කරන්න' : 'Add Board Member'}</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isSi ? 'නම, තනතුර හෝ විද්‍යුත් තැපෑල අනුව සොයන්න...' : 'Search by name, position, or email...'}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: isSi ? 'සියල්ල' : 'All' },
              { id: 'chairman', label: isSi ? 'සභාපති' : 'Chairman' },
              { id: 'vice_chairman', label: isSi ? 'උප සභාපති' : 'Vice Chairman' },
              { id: 'director', label: isSi ? 'අධ්‍යක්ෂවරුන්' : 'Directors' },
              { id: 'officer', label: isSi ? 'නිලධාරීන්' : 'Officers' }
            ].map(tier => (
              <button
                key={tier.id}
                onClick={() => setRoleFilter(tier.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  roleFilter === tier.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-neutral-600'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Board Members */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-neutral-400 space-y-2 border border-neutral-200/90">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#003399]" />
          <p className="text-xs">Loading board member details...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-neutral-400 space-y-3 border border-neutral-200/90">
          <Building2 className="w-8 h-8 mx-auto text-neutral-300" />
          <p className="text-xs font-medium text-neutral-600">No board members found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all group"
            >
              <div className="space-y-3">
                {/* Header with Photo and Badges */}
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {member.image_src ? (
                      <img src={member.image_src} alt={member.name_en} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      {getRoleBadge(member.role_type)}
                      <span className="text-[10px] font-mono text-neutral-400">Order: {member.display_order}</span>
                    </div>

                    <h3 className="font-bold text-sm text-neutral-900 leading-snug truncate" title={member.name_en}>
                      {isSi ? member.name_si : member.name_en}
                    </h3>
                    <p className="text-[11px] font-semibold text-[#003399] truncate">
                      {isSi ? member.position_si : member.position_en}
                    </p>
                  </div>
                </div>

                {/* Qualification */}
                {member.qualification && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.qualification}</span>
                  </div>
                )}

                {/* Contact metadata */}
                <div className="space-y-1 text-xs text-neutral-600 pt-1">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-[11px] truncate">
                      <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.address && (
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 truncate">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-neutral-400">
                  {isSi ? (member.name_en) : (member.name_si)}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-[#003399] hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Edit Member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(member.id)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5 text-[#003399]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-condensed text-lg font-bold text-neutral-900">
                  {editingMember 
                    ? (isSi ? 'අධ්‍යක්ෂ තොරතුරු සංස්කරණය' : 'Edit Board Member')
                    : (isSi ? 'නව අධ්‍යක්ෂවරයෙකු ඇතුළත් කිරීම' : 'Add Board Member')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Names row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Full Name (Sinhala) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameSi}
                    onChange={e => setNameSi(e.target.value)}
                    placeholder="උදා: H.H.D එමල් ප්‍රියන්ත හේරත්"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    placeholder="e.g. Emal Priyantha Herath"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Position row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Position (Sinhala) *
                  </label>
                  <input
                    type="text"
                    required
                    value={positionSi}
                    onChange={e => setPositionSi(e.target.value)}
                    placeholder="උදා: සභාපති / අධ්‍යක්ෂක"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Position (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={positionEn}
                    onChange={e => setPositionEn(e.target.value)}
                    placeholder="e.g. Chairman / Director"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Role Type & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Category / Role Tier
                  </label>
                  <select
                    value={roleType}
                    onChange={e => setRoleType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  >
                    <option value="chairman">Chairman (සභාපති)</option>
                    <option value="vice_chairman">Vice Chairman (උප සභාපති)</option>
                    <option value="director">Board Director (අධ්‍යක්ෂක)</option>
                    <option value="officer">Administrative Officer (නිලධාරී)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Display Order (Rank)
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={e => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Qualifications / Honors
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                  placeholder="e.g. B.Com. (Hons) — University of Kelaniya"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 071 229 1011"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. chairman@mpcs.lk"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. කුරුණෑගල පාර, හැට්ටිපොල, ශ්‍රී ලංකා"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-neutral-200 overflow-hidden shrink-0">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setPhotoFile(f);
                        setPhotoPreview(URL.createObjectURL(f));
                      }
                    }}
                    className="w-full text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-neutral-700 hover:file:bg-slate-200 cursor-pointer border border-neutral-200 rounded-xl p-1 bg-slate-50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-condensed text-base font-bold text-neutral-900">
                {isSi ? 'අධ්‍යක්ෂවරයා ඉවත් කරන්නද?' : 'Delete Board Member?'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isSi 
                  ? 'මෙම සාමාජිකයා අධ්‍යක්ෂ මණ්ඩලයෙන් ඉවත් කිරීමට ඔබට විශ්වාසද?'
                  : 'Are you sure you want to remove this member from the Board of Directors?'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
