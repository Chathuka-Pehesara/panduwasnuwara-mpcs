'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  Mail,
  CreditCard,
  Lock,
  Copy,
  Clock,
  Shield
} from 'lucide-react';

interface AdminProfileTabProps {
  currentUser?: {
    id?: number;
    username?: string;
    fullName?: string;
    nic?: string;
    phone?: string;
    email?: string;
    role?: string;
  };
  isSuperAdmin?: boolean;
  onProfileUpdated?: (updated: any) => void;
}

export default function AdminProfileTab({
  currentUser,
  isSuperAdmin = false,
  onProfileUpdated
}: AdminProfileTabProps) {
  const locale = useLocale();
  const isSi = locale === 'si';

  // Details State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [nic, setNic] = useState(currentUser?.nic || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [detailsError, setDetailsError] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [copiedGenerated, setCopiedGenerated] = useState(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setFullName(currentUser.fullName);
      if (currentUser.nic) setNic(currentUser.nic);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Load latest profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile');
        const data = await res.json();
        if (data.success && data.profile) {
          setFullName(data.profile.fullName || '');
          setNic(data.profile.nic || '');
          setPhone(data.profile.phone || '');
          setEmail(data.profile.email || '');
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Generate strong random password helper
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let generated = 'Mpcs@';
    for (let i = 0; i < 7; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
    navigator.clipboard?.writeText(generated);
    setCopiedGenerated(true);
    setTimeout(() => setCopiedGenerated(false), 3000);
  };

  // Handle personal details save
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsError('');
    setDetailsSuccess('');

    if (!fullName.trim()) {
      setDetailsError(isSi ? 'සම්පූර්ණ නම ඇතුළත් කිරීම අනිවාර්ය වේ.' : 'Full name is required.');
      return;
    }

    setIsSavingDetails(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          nic: nic.trim(),
          phone: phone.trim(),
          email: email.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setDetailsSuccess(isSi ? 'පැතිකඩ තොරතුරු සාර්ථකව යාවත්කාලීන කරන ලදී.' : 'Profile details updated successfully.');
        setTimeout(() => setDetailsSuccess(''), 4000);
        if (onProfileUpdated && data.profile) {
          onProfileUpdated(data.profile);
        }
      } else {
        setDetailsError(data.error || 'Failed to update details');
      }
    } catch (err: any) {
      setDetailsError(err.message || 'Connection error');
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Handle password change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword.trim()) {
      setPasswordError(isSi ? 'වත්මන් මුරපදය ඇතුළත් කරන්න.' : 'Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError(isSi ? 'නව මුරපදය ඇතුළත් කරන්න.' : 'Please enter a new password.');
      return;
    }
    if (newPassword.trim().length < 5) {
      setPasswordError(isSi ? 'නව මුරපදය අවම වශයෙන් අක්ෂර 5ක් විය යුතුය.' : 'New password must be at least 5 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isSi ? 'තහවුරු කළ මුරපදය නොගැලපේ.' : 'Passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess(isSi ? 'මුරපදය සාර්ථකව වෙනස් කරන ලදී!' : 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 5000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Connection error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Institutional Profile Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 border-l-4 border-l-[#003399] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border shadow-xs ${
              isSuperAdmin 
                ? 'bg-slate-900 text-amber-400 border-slate-800' 
                : 'bg-blue-50 text-[#003399] border-blue-200'
            }`}>
              {isSuperAdmin ? <ShieldCheck className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-condensed text-2xl font-bold text-neutral-900 leading-tight">
                  {fullName || currentUser?.fullName || currentUser?.username || 'Administrator'}
                </h2>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${
                  isSuperAdmin 
                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                    : 'bg-blue-50 text-[#003399] border-blue-200'
                }`}>
                  {isSuperAdmin ? 'SUPER ADMIN' : 'ADMINISTRATOR'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                <span>@{currentUser?.username || 'admin'}</span>
                <span>•</span>
                <span>{isSi ? 'පරිපාලක පිවිසුම් ගිණුම' : 'Authenticated Official Account'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-neutral-600 bg-slate-50 border border-neutral-200 px-3.5 py-2 rounded-xl shrink-0">
            <Shield className="w-4 h-4 text-[#003399]" />
            <span>{isSi ? 'සක්‍රීය සැසිය' : 'Active Authenticated Session'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Details on Left, Security / Password on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 text-[#003399] flex items-center justify-center">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-condensed text-base font-bold text-neutral-900">
                  {isSi ? 'පුද්ගලික සහ සම්බන්ධතා තොරතුරු' : 'Personal & Contact Information'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {isSi ? 'පරිපාලක පැතිකඩ විස්තර යාවත්කාලීන කරන්න' : 'Update your administrator profile attributes'}
                </p>
              </div>
            </div>
          </div>

          {detailsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{detailsSuccess}</span>
            </div>
          )}

          {detailsError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{detailsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveDetails} className="space-y-4">
            {/* Username (Read Only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'පරිශීලක නාමය (Username)' : 'Username (System Identifier)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentUser?.username || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-600 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-neutral-400 font-mono">
                  LOCKED
                </span>
              </div>
              <p className="text-[10.5px] text-neutral-400">
                {isSi ? 'පරිශීලක නාමය ස්ථිර වන අතර වෙනස් කළ නොහැක.' : 'Username is a permanent system identifier and cannot be modified.'}
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'සම්පූර්ණ නම' : 'Full Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. W. M. Sunimal Perera"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#003399] transition-all"
              />
            </div>

            {/* NIC Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'ජාතික හැඳුනුම්පත් අංකය (NIC)' : 'National Identity Card (NIC)'}
              </label>
              <div className="relative">
                <CreditCard className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nic}
                  onChange={e => setNic(e.target.value.toUpperCase())}
                  placeholder="e.g. 198512345678"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#003399] transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'දුරකථන අංකය' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#003399] transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'විද්‍යුත් තැපෑල (Email)' : 'Official Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@panduwasnuwara-mpcs.lk"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#003399] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingDetails}
              className="w-full py-2.5 px-4 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingDetails ? (isSi ? 'සුරකිමින්...' : 'Saving Changes...') : (isSi ? 'තොරතුරු සුරකින්න' : 'Save Profile Changes')}</span>
            </button>
          </form>
        </div>

        {/* SECTION 2: PASSWORD CHANGE & SECURITY */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-condensed text-base font-bold text-neutral-900">
                  {isSi ? 'ආරක්ෂක මුරපදය මාරු කිරීම' : 'Security & Password Management'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {isSi ? 'ඔබගේ පිවිසුම් මුරපදය යාවත්කාලීන කරන්න' : 'Update your administrator login password'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGeneratePassword}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition-colors cursor-pointer"
              title="Generate a random secure password"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>{isSi ? 'නව මුරපදයක් ජනනය කරන්න' : 'Generate'}</span>
            </button>
          </div>

          {copiedGenerated && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-semibold flex items-center justify-between">
              <span>{isSi ? 'නව මුරපදය ජනනය කර Clipboard එකට පිටපත් කරන ලදී!' : 'Generated strong password copied to clipboard!'}</span>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'වත්මන් මුරපදය (Current Password)' : 'Current Password'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#003399] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'නව මුරපදය (New Password)' : 'New Password'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={isSi ? 'අවම වශයෙන් අක්ෂර 5ක්' : 'Minimum 5 characters'}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#003399] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                {isSi ? 'නව මුරපදය තහවුරු කරන්න (Confirm)' : 'Confirm New Password'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-xl text-xs font-mono text-neutral-900 focus:outline-none transition-all ${
                    confirmPassword && newPassword && confirmPassword !== newPassword
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-neutral-200 focus:border-[#003399]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword && confirmPassword === newPassword && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-0.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSi ? 'මුරපද ගැලපේ' : 'Passwords match'}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? (isSi ? 'යාවත්කාලීන වෙමින්...' : 'Updating Password...') : (isSi ? 'මුරපදය යාවත්කාලීන කරන්න' : 'Update Password')}</span>
            </button>
          </form>

          {/* Security Best Practice Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-neutral-200 text-neutral-600 text-[11px] space-y-1">
            <p className="font-bold text-neutral-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#003399]" />
              <span>{isSi ? 'ආරක්ෂක මාර්ගෝපදේශ:' : 'Security Guidelines:'}</span>
            </p>
            <p className="leading-relaxed">
              {isSi 
                ? 'මුරපදය අවම වශයෙන් අක්ෂර 8ක්, සංකේත සහ අංක මිශ්‍රණයකින් සමන්විත වන ලෙස තබා ගැනීම පද්ධති ආරක්ෂාවට වඩාත් සුදුසුය.'
                : 'For optimal institutional security, use at least 8 characters with a mix of uppercase letters, numbers, and symbols.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
