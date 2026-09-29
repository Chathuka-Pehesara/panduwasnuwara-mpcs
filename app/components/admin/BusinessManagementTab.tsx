'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Building2,
  CheckCircle2,
  X,
  ExternalLink,
  Phone,
  MapPin,
  UserCheck,
  Sparkles,
  Layers,
  Search,
  RotateCw,
  Image as ImageIcon,
  Tag,
  Upload
} from 'lucide-react';
import { BusinessItem, BusinessServiceItem } from '@/lib/types';

const LOGO_PRESETS = [
  { label: 'Rural Bank', path: '/images/sections/rural-bank.png' },
  { label: 'Consumer Section', path: '/images/sections/consumer.png' },
  { label: 'Maliban Biscuits', path: '/images/sections/maliban-biscuits.png' },
  { label: 'Maliban Milk', path: '/images/sections/maliban-kiri.png' },
  { label: "Nature's Secrets", path: '/images/sections/nature-secrets.png' },
  { label: 'Hemas Agency', path: '/images/sections/hemas.png' },
  { label: 'Ristbury Tiara', path: '/images/sections/ristbury-tiara.png' },
  { label: 'Fuel Station', path: '/images/sections/fuel-station.png' },
  { label: 'Funeral Services', path: '/images/sections/funeral.png' },
  { label: 'Main Logo', path: '/logo-photo.jpg' }
];

const COVER_PRESETS = [
  { label: 'Annual Assembly', path: '/images/gallery/coop-annual-meeting.jpg' },
  { label: 'Excellence & Awards', path: '/images/gallery/coop-community-award.jpg' },
  { label: 'Logistics Fleet', path: '/images/news/driver-vacancy.jpg' },
  { label: 'Main Headquarters', path: '/logo-photo.jpg' }
];

export default function BusinessManagementTab() {
  const locale = useLocale();

  const [activeSubTab, setActiveSubTab] = useState<'businesses' | 'services'>('businesses');
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [allServices, setAllServices] = useState<BusinessServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Business Modal State
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessItem | null>(null);
  const [formKey, setFormKey] = useState('');
  const [formTitleSi, setFormTitleSi] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTaglineSi, setFormTaglineSi] = useState('');
  const [formTaglineEn, setFormTaglineEn] = useState('');
  const [formCategorySi, setFormCategorySi] = useState('');
  const [formCategoryEn, setFormCategoryEn] = useState('');
  const [formDescSi, setFormDescSi] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formHotline, setFormHotline] = useState('');
  const [formImageSrc, setFormImageSrc] = useState('/logo-photo.jpg');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [businessError, setBusinessError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');

  // Sub-services management state
  const [selectedBusinessForServices, setSelectedBusinessForServices] = useState<string>('rural-bank');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BusinessServiceItem | null>(null);
  const [serviceTitleSi, setServiceTitleSi] = useState('');
  const [serviceTitleEn, setServiceTitleEn] = useState('');
  const [serviceDescSi, setServiceDescSi] = useState('');
  const [serviceDescEn, setServiceDescEn] = useState('');
  const [serviceFeaturesSi, setServiceFeaturesSi] = useState('');
  const [serviceFeaturesEn, setServiceFeaturesEn] = useState('');
  const [serviceDisplayOrder, setServiceDisplayOrder] = useState('0');
  const [serviceIsActive, setServiceIsActive] = useState(true);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceError, setServiceError] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const [bizRes, svcRes] = await Promise.all([
        fetch('/api/admin/businesses'),
        fetch('/api/admin/services')
      ]);

      const bizData = await bizRes.json();
      const svcData = await svcRes.json();

      if (bizData.success && Array.isArray(bizData.businesses)) {
        setBusinesses(bizData.businesses);
        setSelectedBusinessForServices(prev => prev || bizData.businesses[0]?.key || 'rural-bank');
      }

      if (svcData.success && Array.isArray(svcData.services)) {
        setAllServices(svcData.services);
      }
    } catch (err) {
      console.error('Failed to load business data:', err);
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Add Business Modal
  const openAddBusinessModal = () => {
    setEditingBusiness(null);
    setFormKey('');
    setFormTitleSi('');
    setFormTitleEn('');
    setFormTaglineSi('');
    setFormTaglineEn('');
    setFormCategorySi('');
    setFormCategoryEn('');
    setFormDescSi('');
    setFormDescEn('');
    setFormManager('');
    setFormLocation('සමිති ගොඩනැගිල්ල, හැට්ටිපොල');
    setFormHotline('037 229 1012');
    setFormImageSrc('/logo-photo.jpg');
    setFormCoverImage('');
    setFormIsNew(false);
    setFormIsActive(true);
    setFormDisplayOrder(String(businesses.length + 1));
    setBusinessError('');
    setUploadError('');
    setCoverUploadError('');
    setIsBusinessModalOpen(true);
  };

  // Open Edit Business Modal
  const openEditBusinessModal = (b: BusinessItem) => {
    setEditingBusiness(b);
    setFormKey(b.key);
    setFormTitleSi(b.title_si || '');
    setFormTitleEn(b.title_en || '');
    setFormTaglineSi(b.tagline_si || '');
    setFormTaglineEn(b.tagline_en || '');
    setFormCategorySi(b.category_si || '');
    setFormCategoryEn(b.category_en || '');
    setFormDescSi(b.description_si || '');
    setFormDescEn(b.description_en || '');
    setFormManager(b.manager || '');
    setFormLocation(b.location || '');
    setFormHotline(b.hotline || '');
    setFormImageSrc(b.image_src || '/logo-photo.jpg');
    setFormCoverImage(b.cover_image || '');
    setFormIsNew(Boolean(b.is_new));
    setFormIsActive(b.is_active !== false);
    setFormDisplayOrder(String(b.display_order ?? 0));
    setBusinessError('');
    setUploadError('');
    setCoverUploadError('');
    setIsBusinessModalOpen(true);
  };

  // Upload Logo from Device
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormImageSrc(data.url);
      } else {
        setUploadError(data.error || 'Failed to upload logo');
      }
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Upload Cover Photo from Device
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setCoverUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cover');

      const res = await fetch('/api/admin/upload-cover', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormCoverImage(data.url);
      } else {
        setCoverUploadError(data.error || 'Failed to upload cover photo');
      }
    } catch (err: any) {
      console.error('Error uploading cover photo:', err);
      setCoverUploadError(err.message || 'Error uploading file');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Save Business
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleEn.trim() || !formTitleSi.trim()) {
      setBusinessError('Both English and Sinhala titles are required.');
      return;
    }

    setIsSavingBusiness(true);
    setBusinessError('');

    try {
      const payload: any = {
        title_si: formTitleSi.trim(),
        title_en: formTitleEn.trim(),
        tagline_si: formTaglineSi.trim() || null,
        tagline_en: formTaglineEn.trim() || null,
        category_si: formCategorySi.trim() || null,
        category_en: formCategoryEn.trim() || null,
        description_si: formDescSi.trim() || null,
        description_en: formDescEn.trim() || null,
        manager: formManager.trim() || null,
        location: formLocation.trim() || null,
        hotline: formHotline.trim() || null,
        image_src: formImageSrc.trim() || '/logo-photo.jpg',
        cover_image: formCoverImage.trim() || null,
        is_new: formIsNew,
        is_active: formIsActive,
        display_order: parseInt(formDisplayOrder, 10) || 0
      };

      if (editingBusiness) {
        payload.services = editingBusiness.services || [];
        payload.services_en = editingBusiness.services_en || [];
      }

      if (editingBusiness) {
        const res = await fetch('/api/admin/businesses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBusiness.id, ...payload })
        });
        const data = await res.json();
        if (data.success && data.business) {
          setBusinesses(prev => prev.map(b => b.id === editingBusiness.id ? data.business : b));
          setIsBusinessModalOpen(false);
        } else {
          setBusinessError(data.error || 'Failed to update business');
        }
      } else {
        const res = await fetch('/api/admin/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: formKey.trim() || undefined,
            ...payload
          })
        });
        const data = await res.json();
        if (data.success && data.business) {
          setBusinesses(prev => [...prev, data.business]);
          setIsBusinessModalOpen(false);
        } else {
          setBusinessError(data.error || 'Failed to create business');
        }
      }
    } catch (err: any) {
      setBusinessError(err.message || 'Error saving business');
    } finally {
      setIsSavingBusiness(false);
    }
  };

  // Delete Business
  const handleDeleteBusiness = async (b: BusinessItem) => {
    const confirmMsg = locale === 'si'
      ? `ඔබට "${b.title_si}" ව්‍යාපාර අංශය මකා දැමීමට අවශ්‍ය බව සහතිකද?`
      : `Are you sure you want to delete "${b.title_en}" division?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/businesses?id=${b.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses(prev => prev.filter(item => item.id !== b.id));
      } else {
        alert(data.error || 'Failed to delete business');
      }
    } catch (err) {
      console.error('Error deleting business:', err);
      alert('Error deleting business');
    }
  };

  // Filtered businesses
  const filteredBusinesses = businesses.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title_en?.toLowerCase().includes(q) ||
      b.title_si?.toLowerCase().includes(q) ||
      b.key?.toLowerCase().includes(q) ||
      b.category_en?.toLowerCase().includes(q) ||
      b.manager?.toLowerCase().includes(q)
    );
  });

  // Services Modal Helpers
  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceTitleSi('');
    setServiceTitleEn('');
    setServiceDescSi('');
    setServiceDescEn('');
    setServiceFeaturesSi('');
    setServiceFeaturesEn('');
    setServiceDisplayOrder(String(allServices.filter(s => s.business_key === selectedBusinessForServices).length + 1));
    setServiceIsActive(true);
    setServiceError('');
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service: BusinessServiceItem) => {
    setEditingService(service);
    setServiceTitleSi(service.title_si || '');
    setServiceTitleEn(service.title_en || '');
    setServiceDescSi(service.desc_si || '');
    setServiceDescEn(service.desc_en || '');
    setServiceFeaturesSi((service.features_si || []).join(', '));
    setServiceFeaturesEn((service.features_en || []).join(', '));
    setServiceDisplayOrder(String(service.display_order ?? 0));
    setServiceIsActive(service.is_active !== false);
    setServiceError('');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingService(true);
    setServiceError('');

    try {
      const featuresSiArr = serviceFeaturesSi.split(',').map(s => s.trim()).filter(Boolean);
      const featuresEnArr = serviceFeaturesEn.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        business_key: selectedBusinessForServices,
        title_si: serviceTitleSi.trim(),
        title_en: serviceTitleEn.trim(),
        desc_si: serviceDescSi.trim() || null,
        desc_en: serviceDescEn.trim() || null,
        features_si: featuresSiArr,
        features_en: featuresEnArr,
        display_order: parseInt(serviceDisplayOrder, 10) || 0,
        is_active: serviceIsActive
      };

      if (editingService) {
        const res = await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingService.id, ...payload })
        });
        const data = await res.json();
        if (data.success && data.service) {
          setAllServices(prev => prev.map(s => s.id === editingService.id ? data.service : s));
          setIsServiceModalOpen(false);
        } else {
          setServiceError(data.error || 'Failed to update service');
        }
      } else {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.service) {
          setAllServices(prev => [...prev, data.service]);
          setIsServiceModalOpen(false);
        } else {
          setServiceError(data.error || 'Failed to create service');
        }
      }
    } catch (err: any) {
      setServiceError(err.message || 'Error saving service');
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAllServices(prev => prev.filter(s => s.id !== id));
      } else {
        alert(data.error || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-12 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#003399] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500 font-medium">Loading Business Divisions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER & TOP SUB-TABS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#003399] border border-blue-200">
                <Building2 className="w-3.5 h-3.5" />
                {businesses.length} Divisions
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {locale === 'si' ? 'ව්‍යාපාර අංශ සහ සේවා' : 'Business Divisions & Services'}
              </span>
            </div>
            <h2 className="font-condensed text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
              {locale === 'si' ? 'ව්‍යාපාර අංශ සහ සේවා කළමනාකරණය' : 'Business Divisions Management'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {locale === 'si'
                ? 'මුල් පිටුවේ "අපගේ ව්‍යාපාර" කොටසේ ඇති සියලුම අංශයන්ගේ තොරතුරු සංස්කරණය, මකා දැමීම හෝ අලුතින් එක් කිරීම.'
                : 'Edit, customize, or delete business division cards, logos, descriptions, managers, and offered services.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-neutral-200 hover:bg-slate-50 text-neutral-600 hover:text-[#003399] transition-colors cursor-pointer"
              title="Refresh"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#003399]' : ''}`} />
            </button>
            <button
              onClick={openAddBusinessModal}
              className="px-4 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'si' ? 'නව ව්‍යාපාරයක් එක් කරන්න' : 'Add New Business'}</span>
            </button>
          </div>
        </div>

        {/* SUB NAVIGATION PILLS */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <button
            onClick={() => setActiveSubTab('businesses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'businesses'
                ? 'bg-[#003399] text-white shadow-xs'
                : 'bg-slate-50 text-neutral-700 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{locale === 'si' ? 'අපගේ ව්‍යාපාර කාඩ්පත්' : 'Business Divisions (Our Businesses)'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'businesses' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {businesses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'services'
                ? 'bg-[#003399] text-white shadow-xs'
                : 'bg-slate-50 text-neutral-700 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{locale === 'si' ? 'අදාළ අංශයේ සේවාවන්' : 'Division Offered Services'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'services' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {allServices.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: BUSINESS DIVISIONS (MATCHING HOMEPAGE CARDS) */}
      {activeSubTab === 'businesses' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={locale === 'si' ? 'ව්‍යාපාර අංශ සොයන්න...' : 'Search business divisions...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-800 focus:outline-hidden focus:border-[#003399] transition-colors shadow-2xs"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((b, idx) => (
              <div
                key={b.id}
                className={`group p-6 rounded-2xl sm:rounded-3xl border bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  b.is_active ? 'border-neutral-200/90' : 'border-neutral-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Top Bar: Category Pill & Index Number */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                        {locale === 'si' ? (b.category_si || b.category_en || 'ව්‍යාපාර අංශය') : (b.category_en || 'Business Division')}
                      </span>
                      {b.is_new && (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono">
                          NEW
                        </span>
                      )}
                      {!b.is_active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-400 select-none tracking-wider">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Logo & Title */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs relative overflow-hidden group-hover:scale-105 transition-transform">
                      <Image
                        src={b.image_src || '/logo-photo.jpg'}
                        alt={b.title_en}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo-photo.jpg';
                        }}
                      />
                    </div>
                    <div className="pt-0.5 min-w-0">
                      <h3 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-[#003399] transition-colors truncate">
                        {locale === 'si' ? b.title_si : b.title_en}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 font-medium">
                        {locale === 'si' ? (b.tagline_si || b.tagline_en) : (b.tagline_en || b.tagline_si)}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        Key: /{b.key}
                      </p>
                    </div>
                  </div>

                  {/* Description Paragraph */}
                  {(b.description_si || b.description_en) && (
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                      {locale === 'si' ? (b.description_si || b.description_en) : (b.description_en || b.description_si)}
                    </p>
                  )}

                  {/* Manager & Hotline Metadata */}
                  <div className="space-y-1.5 py-3 border-t border-neutral-100 text-[11px] text-neutral-600">
                    {b.location && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{b.location}</span>
                      </div>
                    )}
                    {b.manager && (
                      <div className="flex items-center gap-1.5 truncate">
                        <UserCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{b.manager}</span>
                      </div>
                    )}
                    {b.hotline && (
                      <div className="flex items-center gap-1.5 truncate font-mono">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{b.hotline}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditBusinessModal(b)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003399]/5 hover:bg-[#003399]/15 text-[#003399] text-xs font-bold border border-[#003399]/20 transition-colors cursor-pointer"
                      title="Edit Business Card & Page Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{locale === 'si' ? 'සංස්කරණය' : 'Edit Page & Card'}</span>
                    </button>

                    <a
                      href={b.key === 'rural-bank' ? `/${locale}/rural-bank` : `/${locale}/businesses/${b.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-neutral-600 hover:text-[#003399] text-xs font-medium border border-neutral-200 transition-colors"
                      title="Preview Live Business Page"
                    >
                      <span>{locale === 'si' ? 'පිටුව බලන්න' : 'Live Page'}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>

                    <button
                      onClick={() => handleDeleteBusiness(b)}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Business Division"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedBusinessForServices(b.key);
                        setActiveSubTab('services');
                      }}
                      className="text-[11px] font-bold text-[#003399] hover:underline flex items-center gap-1 cursor-pointer bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/60"
                      title="Manage specific offered services for this business"
                    >
                      <span>Services ({allServices.filter(s => s.business_key === b.key).length})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OFFERED SERVICES PER BUSINESS */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          {/* Business Unit Selector Tabs */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-3 shadow-2xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {businesses.map(b => (
              <button
                key={b.key}
                onClick={() => setSelectedBusinessForServices(b.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  selectedBusinessForServices === b.key
                    ? 'bg-[#003399] text-white shadow-xs'
                    : 'bg-slate-50 text-neutral-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{locale === 'si' ? b.title_si : b.title_en}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedBusinessForServices === b.key ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {allServices.filter(s => s.business_key === b.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-condensed text-base font-bold text-neutral-900">
              Services for: {businesses.find(b => b.key === selectedBusinessForServices)?.title_en || selectedBusinessForServices}
            </h3>
            <button
              onClick={openAddServiceModal}
              className="px-3.5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          {/* Services List for Selected Business */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allServices.filter(s => s.business_key === selectedBusinessForServices).length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-2">
                <Briefcase className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-semibold text-neutral-700">No services added yet for this business.</p>
                <button
                  onClick={openAddServiceModal}
                  className="text-xs text-[#003399] font-bold hover:underline cursor-pointer"
                >
                  Click to add the first service
                </button>
              </div>
            ) : (
              allServices
                .filter(s => s.business_key === selectedBusinessForServices)
                .sort((a, b) => a.display_order - b.display_order)
                .map((svc, sIdx) => (
                  <div
                    key={svc.id}
                    className="group bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#003399] font-mono text-xs font-bold flex items-center justify-center border border-blue-100">
                          {String(sIdx + 1).padStart(2, '0')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          svc.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {svc.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-condensed text-base font-bold text-neutral-900 group-hover:text-[#003399] transition-colors">
                          {locale === 'si' ? svc.title_si : svc.title_en}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-medium">
                          {locale === 'si' ? svc.title_en : svc.title_si}
                        </p>
                        {(svc.desc_si || svc.desc_en) && (
                          <p className="text-xs text-neutral-600 line-clamp-2 mt-1.5 leading-relaxed">
                            {locale === 'si' ? svc.desc_si || svc.desc_en : svc.desc_en || svc.desc_si}
                          </p>
                        )}
                      </div>

                      {/* Features Preview */}
                      {((locale === 'si' ? svc.features_si : svc.features_en) || []).length > 0 && (
                        <div className="pt-2 border-t border-neutral-100 space-y-1">
                          {((locale === 'si' ? svc.features_si : svc.features_en) || []).map((f, fi) => (
                            <div key={fi} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Action Buttons */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400">
                        Order: {svc.display_order}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditServiceModal(svc)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-[#003399] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* EDIT / CREATE BUSINESS MODAL */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn my-6">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#003399] flex items-center justify-center border border-blue-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed text-lg font-bold text-neutral-900">
                    {editingBusiness ? (locale === 'si' ? 'ව්‍යාපාර අංශය සංස්කරණය' : 'Edit Business Division') : (locale === 'si' ? 'නව ව්‍යාපාර අංශයක් එක් කරන්න' : 'Add New Business Division')}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {locale === 'si' ? 'සියලුම විස්තර හා කාඩ්පත් තොරතුරු ඇතුළත් කරන්න' : 'Update titles, taglines, category, descriptions, and logo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBusinessModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBusiness} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {businessError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {businessError}
                </div>
              )}

              {/* Title Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleEn}
                    onChange={e => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Rural Bank"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Title (Sinhala) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleSi}
                    onChange={e => setFormTitleSi(e.target.value)}
                    placeholder="e.g. ග්‍රාමීය බැංකුව"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Category Tag (English)
                  </label>
                  <input
                    type="text"
                    value={formCategoryEn}
                    onChange={e => setFormCategoryEn(e.target.value)}
                    placeholder="e.g. Banking & Finance"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Category Tag (Sinhala)
                  </label>
                  <input
                    type="text"
                    value={formCategorySi}
                    onChange={e => setFormCategorySi(e.target.value)}
                    placeholder="e.g. ග්‍රාමීය බැංකු සේවා"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Tagline / Subtitle (English)
                  </label>
                  <input
                    type="text"
                    value={formTaglineEn}
                    onChange={e => setFormTaglineEn(e.target.value)}
                    placeholder="e.g. Trusted savings & fast loans for our community"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Tagline / Subtitle (Sinhala)
                  </label>
                  <input
                    type="text"
                    value={formTaglineSi}
                    onChange={e => setFormTaglineSi(e.target.value)}
                    placeholder="e.g. විශ්වාසදායක ඉතුරුම් සහ ඉක්මන් ණය සේවා"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Full Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formDescEn}
                    onChange={e => setFormDescEn(e.target.value)}
                    placeholder="Paragraph description for cards and overview..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Full Description (Sinhala)
                  </label>
                  <textarea
                    rows={3}
                    value={formDescSi}
                    onChange={e => setFormDescSi(e.target.value)}
                    placeholder="කාඩ්පත් සඳහා විස්තරය..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Manager, Location, Hotline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Manager Name & Designation
                  </label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={e => setFormManager(e.target.value)}
                    placeholder="e.g. කේ ඩබ් ජදසිංහ (Manager)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Location / Office Address
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="e.g. සමිති ගොඩනැගිල්ල, හැට්ටිපොල"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Hotline / Phone
                  </label>
                  <input
                    type="text"
                    value={formHotline}
                    onChange={e => setFormHotline(e.target.value)}
                    placeholder="e.g. 037 229 1012"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#003399] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Logo Selection & Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800">
                    {locale === 'si' ? 'ව්‍යාපාර ලාංඡනය / රූපය' : 'Business Logo / Image'}
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    {locale === 'si' ? 'උපාංගයෙන් උඩුගත කරන්න හෝ පෙරනිමි තෝරන්න' : 'Upload from device, pick preset, or enter URL'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative">
                    <Image
                      src={formImageSrc || '/logo-photo.jpg'}
                      alt="Logo Preview"
                      width={56}
                      height={56}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo-photo.jpg';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formImageSrc}
                        onChange={e => setFormImageSrc(e.target.value)}
                        placeholder="/images/sections/your-logo.png"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 focus:border-[#003399] focus:outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#003399] border border-[#003399]/30 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
                        title="Upload logo image from this device"
                      >
                        {isUploadingLogo ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingLogo ? 'Uploading...' : (locale === 'si' ? 'උපාංගයෙන් උඩුගත කරන්න' : 'Upload from Device')}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>

                    {uploadError && (
                      <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
                    )}
                  </div>
                </div>

                {/* Preset badges */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    {locale === 'si' ? 'පෙරනිමි ලාංඡන:' : 'Or Quick Pick Existing Preset:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {LOGO_PRESETS.map((lp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormImageSrc(lp.path)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                          formImageSrc === lp.path
                            ? 'bg-[#003399] text-white shadow-2xs'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-slate-100'
                        }`}
                      >
                        {lp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Page Cover Photo Selection & Upload */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#003399]" />
                    <label className="text-xs font-bold text-neutral-800">
                      {locale === 'si' ? 'ව්‍යාපාරික පිටුවේ කවර ඡායාරූපය (Cover Photo)' : 'Business Page Hero Cover Photo'}
                    </label>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {locale === 'si' ? 'ව්‍යාපාරික වෙබ් පිටුවේ ඉහළින්ම දිස්වන කවර ඡායාරූපය' : 'Prominent hero backdrop for this business web page'}
                  </span>
                </div>

                {/* Cover Banner Preview */}
                <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden border border-neutral-200 bg-slate-900 shadow-inner group">
                  {formCoverImage ? (
                    <>
                      <Image
                        src={formCoverImage}
                        alt="Cover Preview"
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/gallery/coop-annual-meeting.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent flex flex-col justify-end p-3.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                          {locale === 'si' ? 'සජීවී කවර පෙරදසුන' : 'Live Cover Photo Backdrop'}
                        </span>
                        <h4 className="text-sm font-extrabold text-white truncate drop-shadow-sm">
                          {formTitleEn || formTitleSi || 'Business Division Name'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormCoverImage('')}
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 px-2 z-10"
                        title="Remove cover photo"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-r from-slate-900 via-[#002244] to-slate-900 text-slate-300">
                      <ImageIcon className="w-6 h-6 text-slate-400 mb-1 opacity-60" />
                      <p className="text-xs font-semibold text-white">
                        {locale === 'si' ? 'කවර ඡායාරූපයක් සකසා නැත' : 'No custom cover photo selected'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {locale === 'si' ? 'උපාංගයෙන් උඩුගත කරන්න හෝ පෙරනිමි ඡායාරූපයක් තෝරන්න.' : 'Upload an image from your device or pick a preset below.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Input & Upload Button */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formCoverImage}
                      onChange={e => setFormCoverImage(e.target.value)}
                      placeholder="/images/gallery/coop-annual-meeting.jpg or https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 focus:border-[#003399] focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="px-3.5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      title="Upload cover photo from this device"
                    >
                      {isUploadingCover ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingCover ? 'Uploading...' : (locale === 'si' ? 'කවරය උඩුගත කරන්න' : 'Upload Cover Photo')}</span>
                    </button>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </div>

                  {coverUploadError && (
                    <p className="text-[11px] text-rose-600 font-medium">{coverUploadError}</p>
                  )}
                </div>

                {/* Preset covers */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    {locale === 'si' ? 'පෙරනිමි කවර ඡායාරූප:' : 'Or Quick Pick Existing Preset Cover:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COVER_PRESETS.map((cp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormCoverImage(cp.path)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                          formCoverImage === cp.path
                            ? 'bg-[#003399] text-white shadow-2xs'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-slate-100'
                        }`}
                      >
                        {cp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Page URL Preview Info */}
                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-600 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-500">Public Page URL:</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-neutral-200 font-mono text-[#003399]">
                      /businesses/{editingBusiness ? editingBusiness.key : (formKey || formTitleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-division')}
                    </code>
                  </div>
                  {editingBusiness && (
                    <a
                      href={`/${locale}/businesses/${editingBusiness.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003399] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Preview Live Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Callout Notice to Manage Services in Division Offered Services Tab */}
              {editingBusiness && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-[#003399] flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">
                        {locale === 'si' ? 'අංශයේ පිරිනමන සේවාවන්' : 'Division Offered Services'}
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        {locale === 'si' 
                          ? `මෙම ව්‍යාපාරයට අදාළ සේවාවන් ${allServices.filter(s => s.business_key === editingBusiness.key).length} ක් ඇත. ඒවා සංස්කරණය කිරීමට සේවා ටැබ් එකට යන්න.` 
                          : `This division currently has ${allServices.filter(s => s.business_key === editingBusiness.key).length} service(s) configured. Manage full details, titles, descriptions & features in the services view.`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBusinessForServices(editingBusiness.key);
                      setIsBusinessModalOpen(false);
                      setActiveSubTab('services');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{locale === 'si' ? 'සේවා කළමනාකරණයට යන්න' : 'Open Services Tab'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Toggles & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bizIsActive"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003399] focus:ring-[#003399]"
                  />
                  <label htmlFor="bizIsActive" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Active (Show on Website)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bizIsNew"
                    checked={formIsNew}
                    onChange={e => setFormIsNew(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="bizIsNew" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Display &quot;NEW&quot; Badge
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-0.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={e => setFormDisplayOrder(e.target.value)}
                    className="w-24 px-3 py-1 rounded-lg bg-slate-50 border border-neutral-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBusiness}
                  className="px-5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingBusiness ? 'Saving...' : editingBusiness ? 'Save Changes' : 'Create Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-xl w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="font-condensed text-lg font-bold text-neutral-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 pt-4">
              {serviceError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {serviceError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Service Title (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceTitleEn}
                  onChange={e => setServiceTitleEn(e.target.value)}
                  placeholder="e.g. Fixed Deposit Scheme"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs focus:bg-white focus:border-[#003399] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Service Title (Sinhala) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceTitleSi}
                  onChange={e => setServiceTitleSi(e.target.value)}
                  placeholder="e.g. ස්ථාවර තැන්පතු ක්‍රමය"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs focus:bg-white focus:border-[#003399] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Features / Bullet Points (English, comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceFeaturesEn}
                  onChange={e => setServiceFeaturesEn(e.target.value)}
                  placeholder="e.g. High interest, Minimum deposit Rs. 1000, Flexible tenures"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs focus:bg-white focus:border-[#003399] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Features / Bullet Points (Sinhala, comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceFeaturesSi}
                  onChange={e => setServiceFeaturesSi(e.target.value)}
                  placeholder="e.g. ඉහළ පොලියක්, නම්‍යශීලී කාල සීමා, ක්ෂණික ණය පහසුකම්"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs focus:bg-white focus:border-[#003399] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="svcActive"
                    checked={serviceIsActive}
                    onChange={e => setServiceIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003399]"
                  />
                  <label htmlFor="svcActive" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Active
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-700">Display Order:</label>
                  <input
                    type="number"
                    value={serviceDisplayOrder}
                    onChange={e => setServiceDisplayOrder(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-neutral-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="px-5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingService ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
