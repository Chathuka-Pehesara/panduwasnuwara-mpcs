'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  Search, 
  Users, 
  Vote, 
  FileText, 
  Lock, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  UserCheck, 
  LogIn, 
  FileCheck,
  Loader2,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { useMembership } from '@/app/context/MembershipContext';

export default function MembershipModals() {
  const { activeModal, closeModal, auth } = useMembership();

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={closeModal} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-4xl bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-neutral-900 flex flex-col max-h-[90vh]">
        {activeModal === 'members' && <MemberDetailsModal onClose={closeModal} />}
        {activeModal === 'voters' && <EligibleVotersModal onClose={closeModal} />}
        {activeModal === 'apply' && <ApplyMembershipModal onClose={closeModal} auth={auth} />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. MEMBER DETAILS (ALL) MODAL
// -------------------------------------------------------------
function MemberDetailsModal({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const isSi = locale === 'si';
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async (search = '', pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/membership/members?q=${encodeURIComponent(search)}&page=${pageNum}&limit=25`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(searchTerm, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchMembers(searchTerm, newPage);
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Modal Header */}
      <div className="px-6 py-5 border-b border-neutral-200/90 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#003399]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2 font-condensed">
              <span>{isSi ? 'සාමාජික විස්තර (සියල්ල)' : 'Member Details (ALL)'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003399] font-mono font-bold border border-blue-200">
                {total.toLocaleString()} {isSi ? 'සාමාජිකයන්' : 'Members'}
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              {isSi 
                ? 'පඬුවස්නුවර විවිධ සේවා සමුපකාර සමිතියේ ලියාපදිංචි සාමාජික නාමාවලිය' 
                : 'Official registered member directory of Panduwasnuwara MPCS'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:p-6 border-b border-neutral-200/80 bg-slate-50/50 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isSi ? 'නම, ජාතික හැඳුනුම්පත හෝ සාමාජික අංකය මගින් සොයන්න...' : 'Search by Name, NIC, or Member Number...'}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content / Table */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#003399]" />
            <p className="text-sm font-medium">{isSi ? 'සාමාජික දත්ත පූරණය වෙමින් පවතී...' : 'Loading member records...'}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 space-y-2">
            <Users className="w-12 h-12 mx-auto text-neutral-300" />
            <p className="text-base font-semibold text-neutral-800">
              {isSi ? 'සාමාජිකයන් කිසිවක් හමු නොවීය' : 'No members found'}
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchTerm 
                ? (isSi ? 'සෙවුම් පදය වෙනස් කර නැවත උත්සාහ කරන්න.' : 'Try changing your search terms.') 
                : (isSi ? 'දැනට සාමාජික දත්ත පද්ධතියට ඇතුළත් කර නොමැත.' : 'No member records have been imported yet.')}
            </p>
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-neutral-600 uppercase text-[11px] font-bold tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">{isSi ? 'සාමාජික අංකය' : 'Member No'}</th>
                    <th className="py-3 px-4">{isSi ? 'සම්පූර්ණ නම' : 'Full Name'}</th>
                    <th className="py-3 px-4">{isSi ? 'ජාතික හැඳුනුම්පත' : 'NIC Number'}</th>
                    <th className="py-3 px-4">{isSi ? 'දුරකථන අංකය' : 'Phone'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-normal text-neutral-800">
                  {members.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#003399]">
                        {m.member_number || m.memberNumber || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {m.full_name || m.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">
                        {m.nic || '—'}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {m.phone || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-200/90 bg-slate-50/80 flex items-center justify-between text-xs text-neutral-600 shrink-0">
          <div>
            {isSi ? 'පිටුව' : 'Page'} <span className="font-bold text-neutral-900">{page}</span> / <span className="font-bold text-neutral-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{isSi ? 'පෙර' : 'Prev'}</span>
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <span>{isSi ? 'මීළඟ' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. ELIGIBLE VOTERS MODAL
// -------------------------------------------------------------
function EligibleVotersModal({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const isSi = locale === 'si';
  const [searchTerm, setSearchTerm] = useState('');
  const [voters, setVoters] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVoters = async (search = '', pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/membership/voters?q=${encodeURIComponent(search)}&page=${pageNum}&limit=25`);
      const data = await res.json();
      if (data.success) {
        setVoters(data.voters || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVoters(searchTerm, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchVoters(searchTerm, newPage);
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Modal Header */}
      <div className="px-6 py-5 border-b border-neutral-200/90 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#003399]">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2 font-condensed">
              <span>{isSi ? 'ඡන්ද හිමි සාමාජිකයන්' : 'Eligible Voters'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003399] font-mono font-bold border border-blue-200">
                {total.toLocaleString()} {isSi ? 'ඡන්දදායකයන්' : 'Voters'}
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              {isSi 
                ? 'නිල මැතිවරණ සඳහා සුදුසුකම් ලත් ඡන්ද හිමි සාමාජික නාමලේඛනය' 
                : 'Cooperative electoral register of eligible voters'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:p-6 border-b border-neutral-200/80 bg-slate-50/50 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isSi ? 'නම, ජාතික හැඳුනුම්පත, ඡන්ද අංකය හෝ කොට්ඨාසය මගින් සොයන්න...' : 'Search by Name, NIC, Voter No, or Division...'}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content / Table */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#003399]" />
            <p className="text-sm font-medium">{isSi ? 'ඡන්ද හිමි නාමලේඛනය පූරණය වෙමින් පවතී...' : 'Loading voter register...'}</p>
          </div>
        ) : voters.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 space-y-2">
            <Vote className="w-12 h-12 mx-auto text-neutral-300" />
            <p className="text-base font-semibold text-neutral-800">
              {isSi ? 'ඡන්ද හිමියන් කිසිවක් හමු නොවීය' : 'No eligible voters found'}
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchTerm 
                ? (isSi ? 'සෙවුම් පදය වෙනස් කර නැවත උත්සාහ කරන්න.' : 'Try changing your search terms.') 
                : (isSi ? 'දැනට ඡන්ද හිමි නාමලේඛනය උඩුගත කර නොමැත.' : 'No voter register data has been uploaded yet.')}
            </p>
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-neutral-600 uppercase text-[11px] font-bold tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">{isSi ? 'ඡන්ද අංකය' : 'Voter No'}</th>
                    <th className="py-3 px-4">{isSi ? 'සම්පූර්ණ නම' : 'Full Name'}</th>
                    <th className="py-3 px-4">{isSi ? 'ජාතික හැඳුනුම්පත' : 'NIC Number'}</th>
                    <th className="py-3 px-4">{isSi ? 'කොට්ඨාසය / ශාඛාව' : 'Division'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-normal text-neutral-800">
                  {voters.map((v, idx) => (
                    <tr key={v.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#003399]">
                        {v.voter_number || v.voterNumber || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {v.full_name || v.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">
                        {v.nic || '—'}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 border border-neutral-200 text-neutral-700 text-xs font-medium">
                          {v.division || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-200/90 bg-slate-50/80 flex items-center justify-between text-xs text-neutral-600 shrink-0">
          <div>
            {isSi ? 'පිටුව' : 'Page'} <span className="font-bold text-neutral-900">{page}</span> / <span className="font-bold text-neutral-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{isSi ? 'පෙර' : 'Prev'}</span>
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <span>{isSi ? 'මීළඟ' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 3. APPLY FOR MEMBERSHIP MODAL FLOW
// -------------------------------------------------------------
function ApplyMembershipModal({ onClose, auth }: { onClose: () => void; auth: any }) {
  const locale = useLocale();
  const isSi = locale === 'si';

  // Toggle for non-logged in users who click "Later / Apply Now"
  const [dismissPrompt, setDismissPrompt] = useState(false);

  // Form Fields
  const [fullNameSi, setFullNameSi] = useState('');
  const [fullNameEn, setFullNameEn] = useState(auth.isAuthenticated && auth.user?.fullName ? auth.user.fullName : '');
  const [address, setAddress] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [nic, setNic] = useState(auth.isAuthenticated && auth.user?.nic ? auth.user.nic : '');
  const [phone, setPhone] = useState(auth.isAuthenticated && auth.user?.phone ? auth.user.phone : '');
  const [email, setEmail] = useState(auth.isAuthenticated && auth.user?.email ? auth.user.email : '');

  // File Upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Populate locked fields if auth state changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      if (auth.user.fullName) setFullNameEn(auth.user.fullName);
      if (auth.user.nic) setNic(auth.user.nic);
      if (auth.user.phone) setPhone(auth.user.phone);
      if (auth.user.email) setEmail(auth.user.email);
    }
  }, [auth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(isSi ? 'ගොනුවේ ප්‍රමාණය 10MB ට වඩා අඩු විය යුතුය.' : 'File size must be less than 10MB.');
      return;
    }

    setPhotoFile(file);
    setErrorMsg(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullNameSi.trim()) {
      setErrorMsg(isSi ? 'කරුණාකර සිංහලෙන් සම්පූර්ණ නම ඇතුළත් කරන්න.' : 'Please enter your Full Name in Sinhala.');
      return;
    }
    if (!fullNameEn.trim()) {
      setErrorMsg(isSi ? 'කරුණාකර ඉංග්‍රීසියෙන් සම්පූර්ණ නම ඇතුළත් කරන්න.' : 'Please enter your Full Name in English.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg(isSi ? 'කරුණාකර ඔබගේ ස්ථිර ලිපිනය ඇතුළත් කරන්න.' : 'Please enter your permanent address.');
      return;
    }
    if (!postalAddress.trim()) {
      setErrorMsg(isSi ? 'කරුණාකර ඔබගේ තැපැල් ලිපිනය ඇතුළත් කරන්න.' : 'Please enter your postal address.');
      return;
    }
    if (!nic.trim()) {
      setErrorMsg(isSi ? 'කරුණාකර ජාතික හැඳුනුම්පත් අංකය ඇතුළත් කරන්න.' : 'Please enter your NIC number.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(isSi ? 'කරුණාකර දුරකථන අංකය ඇතුළත් කරන්න.' : 'Please enter your phone number.');
      return;
    }
    if (!photoFile) {
      setErrorMsg(isSi ? 'නිල මුද්‍රාව තැබූ සහතික කළ අයදුම්පත්‍රයේ ඡායාරූපය උඩුගත කිරීම අනිවාර්ය වේ.' : 'A photo of the certified application form with the rubber stamp is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name_si', fullNameSi.trim());
      formData.append('full_name_en', fullNameEn.trim());
      formData.append('address', address.trim());
      formData.append('postal_address', postalAddress.trim());
      formData.append('nic', nic.trim().toUpperCase());
      formData.append('phone', phone.trim());
      if (email?.trim()) formData.append('email', email.trim());
      formData.append('certified_form_photo', photoFile);

      const res = await fetch('/api/membership/apply', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedApp(data.application);
    } catch (err: any) {
      setErrorMsg(err.message || (isSi ? 'අයදුම්පත්‍රය ඉදිරිපත් කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න.' : 'Failed to submit application. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedApp) {
    return (
      <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 bg-white">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 font-condensed tracking-tight">
            {isSi ? 'අයදුම්පත සාර්ථකව භාරගන්නා ලදී!' : 'Application Successfully Submitted!'}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {isSi 
              ? 'ඔබගේ සාමාජිකත්ව අයදුම්පත සහ නිල මුද්‍රා තැබූ ලේඛනය අප වෙත ලැබුණි. අධ්‍යක්ෂ මණ්ඩලයේ අනුමැතියෙන් පසු ඔබට දැනුම් දෙනු ලැබේ.' 
              : 'Your membership application and certified document have been received. You will be notified once reviewed by the board.'}
          </p>
        </div>

        <div className="w-full max-w-md p-4 rounded-xl bg-slate-50 border border-neutral-200 text-left text-xs sm:text-sm space-y-2 font-mono">
          <div className="flex justify-between py-1 border-b border-neutral-200/80">
            <span className="text-neutral-500">{isSi ? 'අයදුම්පත් අංකය:' : 'Application ID:'}</span>
            <span className="font-bold text-[#003399]">#APP-{String(submittedApp.id).padStart(5, '0')}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-200/80">
            <span className="text-neutral-500">{isSi ? 'නම:' : 'Applicant Name:'}</span>
            <span className="text-neutral-900 font-semibold truncate max-w-[200px]">{submittedApp.full_name_en}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-200/80">
            <span className="text-neutral-500">{isSi ? 'ජා.හැ. අංකය:' : 'NIC Number:'}</span>
            <span className="text-neutral-900 font-semibold">{submittedApp.nic}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">{isSi ? 'තත්වය:' : 'Status:'}</span>
            <span className="text-amber-700 font-bold uppercase">{submittedApp.status}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002673] text-white font-bold text-sm transition-all shadow-xs cursor-pointer"
        >
          {isSi ? 'අවසන් කරන්න' : 'Done & Close'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-200/90 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#003399]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-condensed tracking-tight">
              {isSi ? 'සාමාජිකත්වය සඳහා අයදුම් කිරීම' : 'Apply for MPCS Membership'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isSi 
                ? 'පඬුවස්නුවර විවිධ සේවා සමුපකාර සමිතියේ සාමාජිකයෙකු වීමට අයදුම්පත්‍රය' 
                : 'Application form to become a member of Panduwasnuwara MPCS'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:px-8 space-y-6 bg-white">

        {/* -------------------------------------------------------------
            AUTHENTICATION STATUS / PROMPT BANNER
            ------------------------------------------------------------- */}
        {auth.isAuthenticated ? (
          /* Case 1: USER IS ALREADY SIGNED IN */
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 text-[#003399] flex items-center justify-center shrink-0 shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#003399]">
                    {isSi ? 'ගිණුමට ඇතුල් වී ඇත' : 'Signed In'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-900 font-bold border border-blue-200">
                    {isSi ? 'ස්වයංක්‍රීයව පිරවිණි' : 'Auto-filled'}
                  </span>
                </div>
                <p className="text-sm font-bold text-neutral-900">
                  {auth.user?.fullName || auth.user?.username}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-600 mt-0.5 flex-wrap">
                  {auth.user?.nic && <span>NIC: <span className="font-mono font-medium text-neutral-800">{auth.user.nic}</span></span>}
                  {auth.user?.phone && <span>Phone: <span className="text-neutral-800">{auth.user.phone}</span></span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shrink-0 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-[#003399]" />
              <span className="font-medium">{isSi ? 'ලියාපදිංචි විස්තර අගුළුලා ඇත' : 'Verified details locked'}</span>
            </div>
          </div>
        ) : !dismissPrompt ? (
          /* Case 2: USER IS NOT SIGNED IN */
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs space-y-3.5 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <LogIn className="w-5 h-5 text-[#003399]" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                  {isSi ? 'ගිණුම මගින් ස්වයංක්‍රීයව පිරවීම' : 'Auto-fill with your Account'}
                </h4>
                <p className="text-xs sm:text-[13px] text-neutral-700 mt-1 leading-relaxed">
                  {isSi 
                    ? 'ඇතුල් වීමෙන් ඔබගේ නම, ලිපිනය, ජා.හැ. අංකය සහ දුරකථන අංකය ස්වයංක්‍රීයව පිරවෙනු ඇත, නමුත් අයදුම් කිරීමට ඇතුල් වීම අනිවාර්ය නොවේ.' 
                    : 'Sign in and your name, address, NIC and phone will be filled in automatically, but signing in is not required to apply.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 pl-0 sm:pl-12">
              <Link
                href={`/${locale}/login`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003399] hover:bg-[#002673] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSi ? 'ඇතුල් වන්න / ලියාපදිංචි වන්න' : 'Sign In / Register'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>

              <button
                type="button"
                onClick={() => setDismissPrompt(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs border border-neutral-300 shadow-2xs transition-colors cursor-pointer"
              >
                <span>{isSi ? 'පසුව / දැන් අයදුම් කරන්න' : 'Later / Apply Now'}</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* -------------------------------------------------------------
            DEDICATED INSTRUCTIONS SPACE (Before Form Fields)
            ------------------------------------------------------------- */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-neutral-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
            <Info className="w-4 h-4 text-[#003399]" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
              {isSi ? 'සාමාජිකත්වය අයදුම් කිරීමේ උපදෙස්' : 'Application Instructions'}
            </h4>
          </div>

          {/* Reserved Copy Space */}
          <div className="text-xs sm:text-[13px] text-neutral-700 space-y-2 leading-relaxed">
            <p className="font-semibold text-neutral-900">
              {isSi 
                ? 'කරුණාකර පහත පියවර අනුගමනය කර නිවැරදි තොරතුරු ඉදිරිපත් කරන්න:' 
                : 'Please review the following instructions carefully before completing your submission:'}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-700 pl-1">
              <li>
                {isSi 
                  ? 'ඔබේ ළඟම පිහිටි ග්‍රාමීය සමුපකාර ශාඛාවෙන් භෞතික සාමාජික අයදුම්පත ලබාගන්න.' 
                  : 'Obtain the physical membership application form from your nearest village cooperative branch.'}
              </li>
              <li>
                {isSi 
                  ? 'අයදුම්පත සම්පූර්ණ කර නියමිත සාමාජික කොටස් ගාස්තුව සමඟ ශාඛා කළමනාකරු වෙත භාරදෙන්න.' 
                  : 'Complete the form and submit it alongside the mandatory membership share fee to the branch.'}
              </li>
              <li>
                <span className="font-bold text-neutral-900">
                  {isSi ? 'නිල මුද්‍රාව සහ අත්සන:' : 'Official Branch Rubber Stamp:'}
                </span>{' '}
                {isSi 
                  ? 'ශාඛා නිලධාරියා විසින් සමුපකාරයේ නිල රබර් මුද්‍රාව සහ අත්සන තැබූ ලේඛනය ලබාගෙන එහි පැහැදිලි ඡායාරූපයක් පහතින් උඩුගත කරන්න.' 
                  : 'Ensure the branch stamps your document with their official rubber seal and signature. You must upload a clear photo of this certified document below.'}
              </li>
              <li>
                {isSi 
                  ? 'සියලුම තොරතුරු සත්‍ය හා නිවැරදි බවට තහවුරු කර අයදුම්පත ඉදිරිපත් කරන්න.' 
                  : 'Ensure all details provided match your legal identification documents for quick board approval.'}
              </li>
            </ul>
          </div>
        </div>

        {/* -------------------------------------------------------------
            APPLICATION FORM FIELDS
            ------------------------------------------------------------- */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Full Name (Sinhala) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 block">
                {isSi ? 'සම්පූර්ණ නම (සිංහලෙන්)' : 'Full Name (Sinhala)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullNameSi}
                onChange={(e) => setFullNameSi(e.target.value)}
                placeholder="උදා: කේ. ඒ. නිමල් පෙරේරා"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399] transition-all shadow-2xs"
              />
            </div>

            {/* 2. Full Name (English) - Locked if signed in */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isSi ? 'සම්පූර්ණ නම (ඉංග්‍රීසියෙන්)' : 'Full Name (English)'} <span className="text-rose-500">*</span>
                </label>
                {auth.isAuthenticated && auth.user?.fullName && (
                  <span className="text-[10px] font-semibold text-[#003399] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{isSi ? 'අගුළුලා ඇත' : 'Locked'}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={Boolean(auth.isAuthenticated && auth.user?.fullName)}
                  value={fullNameEn}
                  onChange={(e) => setFullNameEn(e.target.value)}
                  placeholder="e.g. K. A. Nimal Perera"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                    auth.isAuthenticated && auth.user?.fullName
                      ? 'bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-not-allowed pr-8 font-medium'
                      : 'bg-slate-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399]'
                  }`}
                />
                {auth.isAuthenticated && auth.user?.fullName && (
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* 3. Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-700 block">
                {isSi ? 'ස්ථිර ලිපිනය' : 'Address'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isSi ? 'ඔබගේ ස්ථිර පදිංචි ලිපිනය...' : 'Your permanent residential address...'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399] transition-all resize-none shadow-2xs"
              />
            </div>

            {/* 4. Postal Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-700 block">
                {isSi ? 'තැපැල් ලිපිනය' : 'Postal Address'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={postalAddress}
                onChange={(e) => setPostalAddress(e.target.value)}
                placeholder={isSi ? 'ලියුම් ලැබිය යුතු තැපැල් ලිපිනය...' : 'Mailing address for official correspondence...'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399] transition-all resize-none shadow-2xs"
              />
            </div>

            {/* 5. NIC Number - Locked if signed in */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isSi ? 'ජාතික හැඳුනුම්පත් අංකය (NIC)' : 'NIC Number'} <span className="text-rose-500">*</span>
                </label>
                {auth.isAuthenticated && auth.user?.nic && (
                  <span className="text-[10px] font-semibold text-[#003399] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{isSi ? 'අගුළුලා ඇත' : 'Locked'}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={Boolean(auth.isAuthenticated && auth.user?.nic)}
                  value={nic}
                  onChange={(e) => setNic(e.target.value.toUpperCase())}
                  placeholder="e.g. 199012345678 or 901234567V"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                    auth.isAuthenticated && auth.user?.nic
                      ? 'bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-not-allowed pr-8 font-semibold'
                      : 'bg-slate-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399]'
                  }`}
                />
                {auth.isAuthenticated && auth.user?.nic && (
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* 6. Phone Number - Locked if signed in */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isSi ? 'දුරකථන අංකය' : 'Phone Number'} <span className="text-rose-500">*</span>
                </label>
                {auth.isAuthenticated && auth.user?.phone && (
                  <span className="text-[10px] font-semibold text-[#003399] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{isSi ? 'අගුළුලා ඇත' : 'Locked'}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  readOnly={Boolean(auth.isAuthenticated && auth.user?.phone)}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07X XXXXXXX"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                    auth.isAuthenticated && auth.user?.phone
                      ? 'bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-not-allowed pr-8 font-medium'
                      : 'bg-slate-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399]'
                  }`}
                />
                {auth.isAuthenticated && auth.user?.phone && (
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* 7. Email (Optional) */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isSi ? 'විද්‍යුත් තැපෑල (විකල්ප)' : 'Email (Optional)'}
                </label>
                {auth.isAuthenticated && auth.user?.email && (
                  <span className="text-[10px] font-semibold text-[#003399] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{isSi ? 'අගුළුලා ඇත' : 'Locked'}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="email"
                  readOnly={Boolean(auth.isAuthenticated && auth.user?.email)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                    auth.isAuthenticated && auth.user?.email
                      ? 'bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-not-allowed pr-8 font-medium'
                      : 'bg-slate-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#003399] focus:bg-white focus:ring-1 focus:ring-[#003399]'
                  }`}
                />
                {auth.isAuthenticated && auth.user?.email && (
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
          </div>

          {/* 8. Photo of the Certified Application Form (File upload option) */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <span>{isSi ? 'සහතික කළ අයදුම්පත්‍රයේ ඡායාරූපය' : 'Photo of Certified Application Form'}</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#003399] font-bold">
                {isSi ? 'නිල රබර් මුද්‍රාව සහිත ලේඛනය' : 'Must show official branch rubber seal'}
              </span>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              {isSi
                ? 'සාමාජිකත්වය සඳහා අයදුම් කිරීමේදී ප්‍රාදේශීය ග්‍රාමීය සමුපකාර ශාඛාව වෙත මුදල් ගෙවා භාරදුන් පසු ඔවුන් නිල රබර් මුද්‍රාව සහ අත්සන තබා සහතික කළ ලේඛනයේ පැහැදිලි ඡායාරූපයක් හෝ ස්කෑන් පිටපතක් මෙහි උඩුගත කරන්න.'
                : 'When applying for membership, there is a small physical form. After filling it out and submitting it with payment to your local village cooperative branch, they stamp it with an official rubber seal. The applicant must be able to upload a photo of this rubber-stamped document.'}
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              className="hidden"
            />

            {!photoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-[#003399] rounded-2xl p-6 sm:p-8 text-center bg-slate-50/60 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#003399] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-[#003399] transition-colors">
                  {isSi ? 'මුද්‍රා තැබූ අයදුම්පත්‍රයේ ඡායාරූපය තෝරන්න හෝ මෙතැනට අදින්න' : 'Click to select or drag photo of the rubber-stamped form'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  JPG, PNG, WEBP හෝ PDF (උපරිම 10MB)
                </p>
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {photoPreview ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-200 shrink-0 relative bg-neutral-100 shadow-2xs">
                      <Image
                        src={photoPreview}
                        alt="Certified Form Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#003399] flex items-center justify-center shrink-0">
                      <FileCheck className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate max-w-[220px] sm:max-w-xs">
                      {photoFile.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {(photoFile.size / 1024 / 1024).toFixed(2)} MB • {isSi ? 'සහතික කළ ලේඛනය' : 'Certified Document'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    {isSi ? 'වෙනස් කරන්න' : 'Change'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
            >
              {isSi ? 'අවලංගු කරන්න' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002673] text-white font-bold text-xs sm:text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isSi ? 'ඉදිරිපත් වෙමින්...' : 'Submitting Application...'}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{isSi ? 'අයදුම්පත ඉදිරිපත් කරන්න' : 'Submit Application'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
