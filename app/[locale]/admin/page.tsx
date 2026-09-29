'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
  Users,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Search,
  LogOut,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Check,
  Phone,
  MessageCircle,
  User as UserIcon,
  Globe,
  Menu,
  ArrowRight,
  BarChart3,
  Upload,
  FileSpreadsheet,
  UserCheck,
  Building2,
  Calendar,
  Newspaper,
  Plus,
  Pin,
  Tag,
  Eye,
  EyeOff,
  Inbox,
  Briefcase,
  Mail,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  Fuel,
  Send,
  Copy,
  RotateCcw,
  Sparkles,
  FileCheck,
  LayoutDashboard
} from 'lucide-react';
import { User, GalleryPost, NewsAnnouncement, Inquiry, BusinessServiceItem, FuelPrice } from '@/lib/types';
import { businessesData } from '@/app/components/BusinessesSection';
import MembershipApplicationsTab from '@/app/components/admin/MembershipApplicationsTab';
import AdminDashboardOverview from '@/app/components/admin/AdminDashboardOverview';
import BusinessManagementTab from '@/app/components/admin/BusinessManagementTab';

const BUSINESS_CATEGORIES = [
  { key: 'rural-bank', titleEn: 'Rural Bank', titleSi: 'ග්‍රාමීය බැංකුව' },
  { key: 'consumer', titleEn: 'Consumer Section', titleSi: 'පාරිභෝගික අංශය' },
  { key: 'fuel-station', titleEn: 'Fuel Station', titleSi: 'ඉන්ධන පිරවුම්හල' },
  { key: 'maliban-biscuits', titleEn: 'Maliban Biscuits Agency', titleSi: 'මාලිබන් බිස්කට් නියෝජිතායතනය' },
  { key: 'maliban-kiri', titleEn: 'Maliban Milk Agency', titleSi: 'මාලිබන් කිරි නියෝජිතායතනය' },
  { key: 'nature-secrets', titleEn: "Nature's Secrets Agency", titleSi: 'නේචර්ස් සීක්‍රට්ස් නියෝජිතායතනය' },
  { key: 'hemas', titleEn: 'Hemas Agency', titleSi: 'හෙමාස් නියෝජිතායතනය' },
  { key: 'ristbury-tiara', titleEn: 'Ristbury Tiara Agency', titleSi: 'රිස්ට්බරි ටියාරා නියෝජිතායතනය' },
  { key: 'funeral', titleEn: 'Funeral Services Section', titleSi: 'අවමංගල්‍ය සේවා අංශය' }
];

const getAspectRatioStyle = (ratio?: string): string => {
  switch (ratio) {
    case '16:9': return '16 / 9';
    case '1:1': return '1 / 1';
    case '3:2': return '3 / 2';
    case '4:3':
    default: return '4 / 3';
  }
};

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'applications' | 'metrics' | 'news' | 'gallery' | 'messages' | 'services' | 'fuel' | 'settings'>('dashboard');
  const [appsTotalCount, setAppsTotalCount] = useState(0);
  const [appsPendingCount, setAppsPendingCount] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [galleryPosts, setGalleryPosts] = useState<GalleryPost[]>([]);
  const [newsList, setNewsList] = useState<NewsAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('all');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [yearsOfService, setYearsOfService] = useState('50');
  const [contactEmail1, setContactEmail1] = useState('');
  const [contactEmail2, setContactEmail2] = useState('');
  const [hasSmtpConfigured, setHasSmtpConfigured] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Fuel Price Management State
  const [adminFuelPrices, setAdminFuelPrices] = useState<Record<string, number>>({
    'kerosene': 235,
    'petrol-92': 311,
    'super-diesel': 328
  });
  const [fuelUpdatedAt, setFuelUpdatedAt] = useState<string>('');
  const [isSavingFuel, setIsSavingFuel] = useState(false);
  const [fuelSuccess, setFuelSuccess] = useState(false);

  const fetchAdminFuelPrices = async () => {
    try {
      const res = await fetch('/api/fuel-prices');
      const data = await res.json();
      if (data.success && Array.isArray(data.prices)) {
        const mapped: Record<string, number> = {};
        data.prices.forEach((p: any) => {
          mapped[p.id] = Number(p.price_per_liter) || 0;
        });
        setAdminFuelPrices(mapped);
        if (data.prices[0]?.updated_at) {
          setFuelUpdatedAt(data.prices[0].updated_at);
        }
      }
    } catch (err) {
      console.error('Error fetching admin fuel prices:', err);
    }
  };

  const handleSaveFuelPrices = async () => {
    setIsSavingFuel(true);
    setFuelSuccess(false);
    try {
      const res = await fetch('/api/fuel-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: adminFuelPrices })
      });
      const data = await res.json();
      if (data.success) {
        setFuelSuccess(true);
        setFuelUpdatedAt(new Date().toISOString());
        setTimeout(() => setFuelSuccess(false), 4000);
      } else {
        alert(data.error || 'Failed to update fuel prices');
      }
    } catch (err) {
      console.error('Error saving fuel prices:', err);
      alert('Error saving fuel prices');
    } finally {
      setIsSavingFuel(false);
    }
  };

  // News Modal & Form State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsAnnouncement | null>(null);
  const [newsTitleSi, setNewsTitleSi] = useState('');
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsDescSi, setNewsDescSi] = useState('');
  const [newsDescEn, setNewsDescEn] = useState('');
  const [newsCategory, setNewsCategory] = useState('vacancy');
  const [newsBadgeSi, setNewsBadgeSi] = useState('');
  const [newsBadgeEn, setNewsBadgeEn] = useState('');
  const [newsIsPinned, setNewsIsPinned] = useState(false);
  const [newsIsPublished, setNewsIsPublished] = useState(true);
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const [newsImageUrlInput, setNewsImageUrlInput] = useState('');
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [newsError, setNewsError] = useState('');

  // Gallery Management State
  const [gallerySearchQuery, setGallerySearchQuery] = useState('');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryPost, setEditingGalleryPost] = useState<GalleryPost | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);
  const [galleryImageUrlInput, setGalleryImageUrlInput] = useState('');
  const [galleryAspectRatio, setGalleryAspectRatio] = useState('4:3');
  const [galleryCustomId, setGalleryCustomId] = useState('');
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState('');

  // Live Statistics State
  const [liveStats, setLiveStats] = useState({
    membersCount: 0,
    votersCount: 0,
    businessesCount: 10,
    yearsOfService: 50
  });

  // Member CSV Upload State
  const [memberFile, setMemberFile] = useState<File | null>(null);
  const [memberMode, setMemberMode] = useState<'append' | 'replace'>('append');
  const [isImportingMembers, setIsImportingMembers] = useState(false);
  const [memberImportMsg, setMemberImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Voter Register Upload State
  const [voterFile, setVoterFile] = useState<File | null>(null);
  const [voterMode, setVoterMode] = useState<'append' | 'replace'>('append');
  const [isUploadingVoters, setIsUploadingVoters] = useState(false);
  const [voterUploadMsg, setVoterUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editNic, setEditNic] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editPassword, setEditPassword] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userError, setUserError] = useState('');

  // Messages / Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryCategoryCounts, setInquiryCategoryCounts] = useState<{ business_key: string; count: number; unread_count: number }[]>([]);
  const [selectedInquiryCategory, setSelectedInquiryCategory] = useState<string>('all');
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [replyTextInput, setReplyTextInput] = useState('');
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [notesSavedFeedback, setNotesSavedFeedback] = useState(false);
  const [replyFeedbackMessage, setReplyFeedbackMessage] = useState<string | null>(null);
  const [copiedPhoneFeedback, setCopiedPhoneFeedback] = useState(false);

  // Business Services State
  const [allServices, setAllServices] = useState<BusinessServiceItem[]>([]);
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

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, galleryRes, settingsRes, statsRes, newsRes, inquiriesRes, servicesRes, appsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/gallery'),
        fetch('/api/admin/settings'),
        fetch('/api/stats'),
        fetch('/api/admin/news'),
        fetch('/api/inquiries'),
        fetch('/api/admin/services'),
        fetch('/api/admin/membership-applications')
      ]);

      const usersData = await usersRes.json();
      const galleryData = await galleryRes.json();
      const settingsData = await settingsRes.json();
      const statsData = await statsRes.json();
      const newsData = await newsRes.json();
      const inquiriesData = await inquiriesRes.json();
      const servicesData = await servicesRes.json();
      const appsData = await appsRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (galleryData.success) setGalleryPosts(galleryData.posts);
      if (newsData.success && Array.isArray(newsData.news)) setNewsList(newsData.news);
      if (inquiriesData.success) {
        setInquiries(inquiriesData.inquiries || []);
        setInquiryCategoryCounts(inquiriesData.categoryCounts || []);
      }
      if (servicesData.success) {
        setAllServices(servicesData.services || []);
      }
      if (appsData.success && Array.isArray(appsData.applications)) {
        setAppsTotalCount(appsData.applications.length);
        setAppsPendingCount(appsData.applications.filter((a: any) => a.status === 'pending').length);
      }
      if (settingsData.success) {
        if (settingsData.settings?.recoveryWhatsAppNumber) {
          setWhatsappNumber(settingsData.settings.recoveryWhatsAppNumber);
        }
        if (settingsData.settings?.yearsOfService) {
          setYearsOfService(String(settingsData.settings.yearsOfService));
        }
        if (settingsData.settings?.contactEmail1) {
          setContactEmail1(settingsData.settings.contactEmail1);
        }
        if (settingsData.settings?.contactEmail2) {
          setContactEmail2(settingsData.settings.contactEmail2);
        }
        if (settingsData.settings?.hasSmtpConfigured !== undefined) {
          setHasSmtpConfigured(settingsData.settings.hasSmtpConfigured);
        }
      }
      if (statsData.success && statsData.stats) {
        setLiveStats(statsData.stats);
        if (statsData.stats.yearsOfService) {
          setYearsOfService(String(statsData.stats.yearsOfService));
        }
      }

      await fetchAdminFuelPrices();
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check admin session
  const verifyAdmin = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (!data.isAuthenticated || !data.isAdmin) {
        router.push(`/${locale}/login`);
        return;
      }
      loadAdminData();
    } catch {
      router.push(`/${locale}/login`);
    }
  }, [locale, router, loadAdminData]);

  useEffect(() => {
    verifyAdmin();
  }, [verifyAdmin]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    router.push(`/${locale}/login`);
    router.refresh();
  };

  // Open Edit User Modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.full_name || '');
    setEditNic(user.nic || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'user');
    setEditPassword('');
    setUserError('');
  };

  // Save User Edit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    setUserError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          fullName: editFullName,
          nic: editNic,
          phone: editPhone,
          role: editRole,
          password: editPassword || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUsers(prev => prev.map(u => (u.id === editingUser.id ? { ...u, ...data.user } : u)));
        setEditingUser(null);
      } else {
        setUserError(data.error || 'Failed to update user');
      }
    } catch {
      setUserError('Error updating user');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch {
      alert('Error deleting user');
    }
  };

  // Delete Comment from Gallery
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      });
      const data = await res.json();
      if (data.success) {
        setGalleryPosts(prev =>
          prev.map(p => ({
            ...p,
            comments: p.comments.filter(c => c.id !== commentId)
          }))
        );
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Open Add Gallery Modal
  const openAddGalleryModal = () => {
    setEditingGalleryPost(null);
    setGalleryImageFile(null);
    setGalleryImagePreview(null);
    setGalleryImageUrlInput('');
    setGalleryAspectRatio('4:3');
    setGalleryCustomId('');
    setGalleryError('');
    setIsGalleryModalOpen(true);
  };

  // Open Edit Gallery Modal
  const openEditGalleryModal = (post: GalleryPost) => {
    setEditingGalleryPost(post);
    setGalleryImageFile(null);
    setGalleryImagePreview(post.imageSrc);
    setGalleryImageUrlInput(post.imageSrc);
    setGalleryAspectRatio(post.aspectRatio || '4:3');
    setGalleryCustomId(post.id);
    setGalleryError('');
    setIsGalleryModalOpen(true);
  };

  // Handle Gallery Image Selection
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setGalleryImagePreview(previewUrl);
    }
  };

  // Save Gallery Item (Create or Edit)
  const handleSaveGalleryPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGallery(true);
    setGalleryError('');

    try {
      const formData = new FormData();
      if (editingGalleryPost) {
        formData.append('id', editingGalleryPost.id);
      } else if (galleryCustomId.trim()) {
        formData.append('id', galleryCustomId.trim());
      }
      formData.append('aspect_ratio', galleryAspectRatio);

      if (galleryImageFile) {
        formData.append('image', galleryImageFile);
      } else if (galleryImageUrlInput.trim()) {
        formData.append('image_src', galleryImageUrlInput.trim());
      }

      const method = editingGalleryPost ? 'PUT' : 'POST';
      const res = await fetch('/api/gallery', {
        method,
        body: formData
      });

      const data = await res.json();
      if (data.success && data.post) {
        if (editingGalleryPost) {
          setGalleryPosts(prev =>
            prev.map(p => (p.id === editingGalleryPost.id ? { ...p, ...data.post } : p))
          );
        } else {
          setGalleryPosts(prev => [data.post, ...prev]);
        }
        setIsGalleryModalOpen(false);
      } else {
        setGalleryError(data.error || 'Failed to save gallery item');
      }
    } catch {
      setGalleryError('Network error saving gallery item');
    } finally {
      setIsSavingGallery(false);
    }
  };

  // Delete Entire Gallery Item
  const handleDeleteGalleryPost = async (postId: string) => {
    if (!confirm(t('deleteGalleryConfirm'))) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      const data = await res.json();
      if (data.success) {
        setGalleryPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.error || 'Failed to delete gallery item');
      }
    } catch {
      alert('Error deleting gallery item');
    }
  };

  // Save Settings (WhatsApp & Years of Service)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const parsedYears = parseInt(yearsOfService, 10) || 50;
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recoveryWhatsAppNumber: whatsappNumber,
          yearsOfService: parsedYears,
          contactEmail1: contactEmail1.trim(),
          contactEmail2: contactEmail2.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess(true);
        setLiveStats(prev => ({ ...prev, yearsOfService: parsedYears }));
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Import Members from CSV
  const handleImportMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFile) return;

    setIsImportingMembers(true);
    setMemberImportMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', memberFile);
      formData.append('mode', memberMode);

      const res = await fetch('/api/admin/members/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setMemberImportMsg({ type: 'success', text: data.message || `Successfully imported ${data.importedCount} members!` });
        setLiveStats(prev => ({ ...prev, membersCount: data.totalCount }));
        setMemberFile(null);
      } else {
        setMemberImportMsg({ type: 'error', text: data.error || 'Failed to import member records.' });
      }
    } catch {
      setMemberImportMsg({ type: 'error', text: 'Error uploading file.' });
    } finally {
      setIsImportingMembers(false);
    }
  };

  // Upload Electoral Register (Eligible Voters)
  const handleUploadVoters = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterFile) return;

    setIsUploadingVoters(true);
    setVoterUploadMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', voterFile);
      formData.append('mode', voterMode);

      const res = await fetch('/api/admin/voters/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setVoterUploadMsg({ type: 'success', text: data.message || `Successfully processed ${data.uploadedCount} eligible voters!` });
        setLiveStats(prev => ({ ...prev, votersCount: data.totalCount }));
        setVoterFile(null);
      } else {
        setVoterUploadMsg({ type: 'error', text: data.error || 'Failed to upload electoral register.' });
      }
    } catch {
      setVoterUploadMsg({ type: 'error', text: 'Error uploading electoral register file.' });
    } finally {
      setIsUploadingVoters(false);
    }
  };

  // Filtered users for search
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.nic && u.nic.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q))
    );
  });

  // Filtered news for search and category
  const filteredNews = newsList.filter(item => {
    const q = newsSearchQuery.toLowerCase();
    const matchesSearch =
      (item.title_si && item.title_si.toLowerCase().includes(q)) ||
      (item.title_en && item.title_en.toLowerCase().includes(q)) ||
      (item.description_si && item.description_si.toLowerCase().includes(q)) ||
      (item.description_en && item.description_en.toLowerCase().includes(q));

    const matchesCategory =
      newsCategoryFilter === 'all' || item.category?.toLowerCase() === newsCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Open Add News Modal
  const openAddNewsModal = () => {
    setEditingNews(null);
    setNewsTitleSi('');
    setNewsTitleEn('');
    setNewsDescSi('');
    setNewsDescEn('');
    setNewsCategory('vacancy');
    setNewsBadgeSi('');
    setNewsBadgeEn('');
    setNewsIsPinned(false);
    setNewsIsPublished(true);
    setNewsImageFile(null);
    setNewsImagePreview(null);
    setNewsImageUrlInput('');
    setNewsError('');
    setIsNewsModalOpen(true);
  };

  // Open Edit News Modal
  const openEditNewsModal = (item: NewsAnnouncement) => {
    setEditingNews(item);
    setNewsTitleSi(item.title_si || '');
    setNewsTitleEn(item.title_en || '');
    setNewsDescSi(item.description_si || '');
    setNewsDescEn(item.description_en || '');
    setNewsCategory(item.category || 'general');
    setNewsBadgeSi(item.badge_text_si || '');
    setNewsBadgeEn(item.badge_text_en || '');
    setNewsIsPinned(Boolean(item.is_pinned));
    setNewsIsPublished(item.is_published !== false);
    setNewsImageFile(null);
    setNewsImagePreview(item.image_url || null);
    setNewsImageUrlInput(item.image_url || '');
    setNewsError('');
    setIsNewsModalOpen(true);
  };

  // Handle Image Selection
  const handleNewsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewsImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setNewsImagePreview(previewUrl);
    }
  };

  // Save News (Add or Edit)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNews(true);
    setNewsError('');

    try {
      const formData = new FormData();
      if (editingNews) {
        formData.append('id', String(editingNews.id));
      }
      formData.append('title_si', newsTitleSi);
      formData.append('title_en', newsTitleEn);
      formData.append('description_si', newsDescSi);
      formData.append('description_en', newsDescEn);
      formData.append('category', newsCategory);
      if (newsBadgeSi) formData.append('badge_text_si', newsBadgeSi);
      if (newsBadgeEn) formData.append('badge_text_en', newsBadgeEn);
      formData.append('is_pinned', String(newsIsPinned));
      formData.append('is_published', String(newsIsPublished));

      if (newsImageFile) {
        formData.append('image', newsImageFile);
      } else if (newsImageUrlInput) {
        formData.append('image_url', newsImageUrlInput);
      }

      const method = editingNews ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/news', {
        method,
        body: formData
      });

      const data = await res.json();
      if (data.success && data.announcement) {
        if (editingNews) {
          setNewsList(prev => prev.map(n => n.id === editingNews.id ? data.announcement : n));
        } else {
          setNewsList(prev => [data.announcement, ...prev]);
        }
        setIsNewsModalOpen(false);
      } else {
        setNewsError(data.error || 'Failed to save announcement');
      }
    } catch {
      setNewsError('Network error saving announcement');
    } finally {
      setIsSavingNews(false);
    }
  };

  // Delete News
  const handleDeleteNews = async (id: number) => {
    if (!confirm(t('deleteNewsConfirm'))) return;

    try {
      const res = await fetch('/api/admin/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setNewsList(prev => prev.filter(n => n.id !== id));
      } else {
        alert(data.error || 'Failed to delete announcement');
      }
    } catch {
      alert('Error deleting announcement');
    }
  };

  // Quick Toggle Publish Status
  const handleTogglePublish = async (item: NewsAnnouncement) => {
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          is_published: !item.is_published
        })
      });
      const data = await res.json();
      if (data.success && data.announcement) {
        setNewsList(prev => prev.map(n => n.id === item.id ? data.announcement : n));
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  // Quick Toggle Pin Status
  const handleTogglePin = async (item: NewsAnnouncement) => {
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          is_pinned: !item.is_pinned
        })
      });
      const data = await res.json();
      if (data.success && data.announcement) {
        setNewsList(prev => prev.map(n => n.id === item.id ? data.announcement : n));
      }
    } catch (err) {
      console.error('Error toggling pin status:', err);
    }
  };

  // Format Phone Number for Calling
  const formatCallNumber = (phone: string): string => {
    return phone.replace(/[^0-9+]/g, '');
  };

  // Format WhatsApp Number (removes symbols, converts 07... to 947...)
  const formatWhatsAppNumber = (phone: string): string => {
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
      digits = '94' + digits.slice(1);
    } else if (!digits.startsWith('94') && digits.length === 9) {
      digits = '94' + digits;
    }
    return digits;
  };

  // Quick Reply Templates
  const QUICK_REPLY_TEMPLATES = [
    {
      labelSi: 'විමසීම ලැබුණි',
      labelEn: 'Inquiry Received',
      textSi: 'ආයුබෝවන්! ඔබ විසින් පඬුවස්නුවර විවිධ සේවා සමුපකාර සමිතිය වෙත යොමු කරන ලද විමසීම අප වෙත ලැබී ඇති අතර අදාළ අංශයේ නිලධාරියෙකු කඩිනමින් ඔබව සම්බන්ධ කරගනු ඇත. ස්තූතියි.',
      textEn: 'Hello! Your inquiry submitted to Panduwasnuwara MPCS has been received. Our officer will contact you shortly. Thank you.'
    },
    {
      labelSi: 'තොරතුරු සැපයීම',
      labelEn: 'Info Provided',
      textSi: 'ආයුබෝවන්! ඔබ විසින් විමසන ලද තොරතුරු හා සේවාවන් පිළිබඳ විස්තර මෙසේය: ',
      textEn: 'Hello! Here is the information and details you requested regarding our services: '
    },
    {
      labelSi: 'ගැටලුව විසඳන ලදී',
      labelEn: 'Issue Resolved',
      textSi: 'ආයුබෝවන්! ඔබ විසින් යොමු කරන ලද විමසීම/ඉල්ලීම සාර්ථකව විසඳන ලදී. වැඩිදුර තොරතුරු අවශ්‍ය නම් ඕනෑම වේලාවක අපව අමතන්න.',
      textEn: 'Hello! Your inquiry/request has been successfully resolved. Please contact us anytime if you need further assistance.'
    }
  ];

  // Open Inquiry Details & Auto Mark Read
  const handleSelectInquiry = async (item: Inquiry) => {
    setSelectedInquiry(item);
    setAdminNotesInput(item.admin_notes || '');
    setReplyTextInput(item.reply_message || '');
    setNotesSavedFeedback(false);
    setReplyFeedbackMessage(null);
    setCopiedPhoneFeedback(false);

    if (item.status === 'unread') {
      try {
        const res = await fetch(`/api/inquiries/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'read' })
        });
        const data = await res.json();
        if (data.success && data.inquiry) {
          setInquiries(prev => prev.map(i => i.id === item.id ? data.inquiry : i));
          setSelectedInquiry(data.inquiry);
        }
      } catch (err) {
        console.error('Error auto-marking inquiry as read:', err);
      }
    }
  };

  // Update Inquiry Status (Unread, Read, Replied)
  const handleUpdateInquiryStatus = async (id: number, status: 'unread' | 'read' | 'replied') => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries(prev => prev.map(i => i.id === id ? data.inquiry : i));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(data.inquiry);
        }
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
    }
  };

  // Send WhatsApp Reply & Auto Mark Replied
  const handleSendWhatsAppReply = async () => {
    if (!selectedInquiry) return;
    const cleanNumber = formatWhatsAppNumber(selectedInquiry.phone);
    if (!cleanNumber) {
      alert('Valid phone number not available for WhatsApp');
      return;
    }

    const defaultGreeting = locale === 'si'
      ? `ආයුබෝවන් ${selectedInquiry.user_name},\nඔබ විසින් පඬුවස්නුවර සමුපකාරය වෙත යොමු කරන ලද (${selectedInquiry.subject}) විමසීම සම්බන්ධයෙනි:\n\n`
      : `Hello ${selectedInquiry.user_name},\nRegarding your inquiry (${selectedInquiry.subject}) to Panduwasnuwara MPCS:\n\n`;

    const messageBody = replyTextInput.trim() || (locale === 'si' ? 'අපගේ නිලධාරියෙකු ඔබව සම්බන්ධ කරගනු ඇත. ස්තූතියි.' : 'Our representative is contacting you regarding your inquiry.');
    const fullText = defaultGreeting + messageBody;
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(fullText)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Automatically update status to 'replied' and save reply message
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'replied',
          reply_message: messageBody,
          replied_at: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? data.inquiry : i));
        setSelectedInquiry(data.inquiry);
        setReplyFeedbackMessage(locale === 'si' ? 'WhatsApp විවෘත වූ අතර පිළිතුරු දුන් බව සටහන් විය!' : 'WhatsApp opened & marked as Replied!');
        setTimeout(() => setReplyFeedbackMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error auto-marking inquiry as replied on WhatsApp:', err);
    }
  };

  // Send Email Reply & Auto Mark Replied
  const handleSendEmailReply = async () => {
    if (!selectedInquiry || !selectedInquiry.email) return;

    const emailSubject = `Re: ${selectedInquiry.subject} - Panduwasnuwara MPCS`;
    const messageBody = replyTextInput.trim() || (locale === 'si' 
      ? `ආයුබෝවන් ${selectedInquiry.user_name},\n\nඔබගේ (${selectedInquiry.subject}) විමසීම සම්බන්ධව අපගේ අවධානය යොමු විය.\n\nස්තූතියි,\nපඬුවස්නුවර විවිධ සේවා සමුපකාර සමිතිය.`
      : `Dear ${selectedInquiry.user_name},\n\nThank you for reaching out to Panduwasnuwara MPCS regarding "${selectedInquiry.subject}".\n\nSincerely,\nPanduwasnuwara MPCS Team.`);

    const mailtoUrl = `mailto:${selectedInquiry.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(messageBody)}`;
    window.open(mailtoUrl, '_self');

    // Automatically update status to 'replied' and save reply message
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'replied',
          reply_message: messageBody,
          replied_at: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? data.inquiry : i));
        setSelectedInquiry(data.inquiry);
        setReplyFeedbackMessage(locale === 'si' ? 'ඊමේල් වැඩසටහන විවෘත වූ අතර පිළිතුරු දුන් බව සටහන් විය!' : 'Email composer opened & marked as Replied!');
        setTimeout(() => setReplyFeedbackMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error auto-marking inquiry as replied on Email:', err);
    }
  };

  // Save Direct Reply / Record Resolution
  const handleSaveDirectReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setIsSavingReply(true);
    setReplyFeedbackMessage(null);

    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'replied',
          reply_message: replyTextInput.trim(),
          replied_at: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? data.inquiry : i));
        setSelectedInquiry(data.inquiry);
        setReplyFeedbackMessage(locale === 'si' ? 'පිළිතුර සාර්ථකව සුරකින ලදී!' : 'Reply recorded successfully!');
        setTimeout(() => setReplyFeedbackMessage(null), 4000);
      } else {
        alert(data.error || 'Failed to save reply');
      }
    } catch (err) {
      console.error('Error saving inquiry reply:', err);
    } finally {
      setIsSavingReply(false);
    }
  };

  // Save Admin Notes on Inquiry
  const handleSaveAdminNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    setNotesSavedFeedback(false);

    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_notes: adminNotesInput
        })
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? data.inquiry : i));
        setSelectedInquiry(data.inquiry);
        setNotesSavedFeedback(true);
        setTimeout(() => setNotesSavedFeedback(false), 3500);
      }
    } catch (err) {
      console.error('Error saving admin notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Copy phone number to clipboard
  const handleCopyPhone = (phone: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopiedPhoneFeedback(true);
      setTimeout(() => setCopiedPhoneFeedback(false), 2500);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: number) => {
    if (!confirm(t('deleteInquiryConfirm') || 'Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => prev.filter(i => i.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } else {
        alert(data.error || 'Failed to delete inquiry');
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  // Open Add Service Modal
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

  // Open Edit Service Modal
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

  // Save Service (Create or Update)
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

  // Delete Service
  const handleDeleteService = async (id: number) => {
    if (!confirm(t('deleteServiceConfirm') || 'Are you sure you want to delete this service?')) return;
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#003399] border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-neutral-900">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 bg-white flex items-center justify-center shrink-0">
            <Image
              src="/logo-photo.jpg"
              alt="Logo"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xs font-bold font-condensed tracking-wide uppercase text-neutral-900">
              Panduwasnuwara MPCS
            </h1>
            <p className="text-[10px] text-neutral-500 font-normal">{t('adminConsole')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}`}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-[11px]">{t('viewWebsite')}</span>
          </Link>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white border-r border-neutral-200/90 flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:h-screen md:sticky md:top-0 shrink-0 shadow-xs ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 bg-white flex items-center justify-center shrink-0">
                <Image
                  src="/logo-photo.jpg"
                  alt="MPCS Logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-condensed text-sm font-bold text-neutral-900 tracking-wide uppercase leading-tight">
                  Panduwasnuwara
                </h2>
                <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                  {t('adminConsole')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              {t('navigation')}
            </p>

            {/* Dashboard Overview Tab */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-[#003399]" />
                <span>{locale === 'si' ? 'දළ විශ්ලේෂණය' : 'Dashboard'}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>{t('usersTab')}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'users' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {users.length}
              </span>
            </button>

            {/* Membership Applications Tab */}
            <button
              onClick={() => {
                setActiveTab('applications');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#003399]" />
                <span>{locale === 'si' ? 'සාමාජික අයදුම්පත්' : 'Membership Applications'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {appsPendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    activeTab === 'applications' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {appsTotalCount}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('metrics');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>{t('metricsTab')}</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('news');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4" />
                <span>{t('newsTab')}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'news' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {newsList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('gallery');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>{t('galleryTab')}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'gallery' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {galleryPosts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('messages');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4" />
                <span>{t('messagesTab') || 'Messages & Inquiries'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {inquiries.filter(i => i.status === 'unread').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    activeTab === 'messages' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {inquiries.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('services');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#003399]" />
                <span>{locale === 'si' ? 'ව්‍යාපාර සහ සේවාවන්' : 'Businesses & Services'}</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('fuel');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'fuel'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Fuel className="w-4 h-4 text-amber-500" />
              <span>{locale === 'si' ? 'ඉන්ධන මිල ගණන්' : 'Fuel Prices'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>{t('settingsTab')}</span>
            </button>
          </div>

          {/* Quick Website Toggle Section */}
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3">
              {locale === 'si' ? 'වෙබ් අඩවිය' : 'Live Website'}
            </p>
            <Link
              href={`/${locale}`}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-neutral-500" />
                <span>{t('switchToWebsite')}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>

        {/* Sidebar Bottom (User identity & Log out) */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 truncate">Administrator</p>
              <p className="text-[10px] text-neutral-400 font-mono">admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-neutral-600 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Main Content Sticky Header */}
        <header className="bg-white border-b border-neutral-200/90 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div>
            <h1 className="font-condensed text-xl font-bold text-neutral-900 leading-tight">
              {activeTab === 'dashboard' && (locale === 'si' ? 'පාලන පුවරුව සහ දළ විශ්ලේෂණය' : 'Dashboard Overview')}
              {activeTab === 'users' && t('usersTab')}
              {activeTab === 'applications' && (locale === 'si' ? 'සාමාජිකත්ව අයදුම්පත් කළමනාකරණය' : 'Membership Applications Management')}
              {activeTab === 'metrics' && t('metricsTab')}
              {activeTab === 'news' && t('newsTab')}
              {activeTab === 'gallery' && t('galleryTab')}
              {activeTab === 'messages' && (t('messagesTab') || 'Messages & Inquiries')}
              {activeTab === 'services' && (locale === 'si' ? 'ව්‍යාපාර සහ සේවා කළමනාකරණය' : 'Businesses & Services Management')}
              {activeTab === 'fuel' && (locale === 'si' ? 'ඉන්ධන සිල්ලර මිල කළමනාකරණය' : 'Fuel Price Management')}
              {activeTab === 'settings' && t('settingsTab')}
            </h1>
            <p className="text-xs text-neutral-500">
              {activeTab === 'dashboard'
                ? (locale === 'si' ? 'වෙබ් අඩවි ක්‍රියාකාරකම්, සාමාජිකයින්, අයදුම්පත් සහ පාරිභෝගික විමසීම් සජීවීව නිරීක්ෂණය කරන්න' : 'Real-time monitoring of website activity, members, applications, and customer inquiries')
                : activeTab === 'applications' 
                  ? (locale === 'si' ? 'අන්තර්ජාලය හරහා ඉදිරිපත් කළ සාමාජික අයදුම්පත් පරීක්ෂා කිරීම, අනුමත කිරීම, සංස්කරණය හා මකා දැමීම' : 'Review, approve, edit, and manage member registration submissions and certified forms')
                  : t('subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-neutral-200 text-neutral-700 hover:text-[#003399] text-xs font-bold transition-all shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#003399]" />
              <span className="hidden sm:inline">{t('viewWebsite')}</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
        {/* TAB 0: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <AdminDashboardOverview
            onNavigateTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}

        {/* TAB: MEMBERSHIP APPLICATIONS */}
        {activeTab === 'applications' && (
          <MembershipApplicationsTab
            onCountChange={(total, pending) => {
              setAppsTotalCount(total);
              setAppsPendingCount(pending);
            }}
          />
        )}

        {/* TAB 1: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-condensed text-lg font-bold text-neutral-900">
                {t('usersTab')}
              </h2>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchMembers')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-800 focus:outline-hidden focus:border-[#003399] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-slate-50 border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{t('thName')}</th>
                    <th className="px-4 py-3">{t('thNic')}</th>
                    <th className="px-4 py-3">{t('thPhone')}</th>
                    <th className="px-4 py-3">{t('thRole')}</th>
                    <th className="px-4 py-3">{t('thDate')}</th>
                    <th className="px-4 py-3 text-right">{t('thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                        {t('noMembersFound')}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-neutral-900">
                          {user.full_name || user.username}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-neutral-700">
                          {user.nic || '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-600">
                          {user.phone || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-neutral-900 text-white shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-neutral-300" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/80">
                              <UserIcon className="w-3 h-3 text-neutral-400" />
                              <span>Member</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-[11px]">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg text-neutral-600 hover:text-[#003399] hover:bg-slate-100 transition-colors cursor-pointer"
                              title={t('edit')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DATA & LIVE METRICS (CSV / EXCEL & ELECTORAL REGISTER IMPORTS) */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Top Info Banner */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-2 text-[#003399]">
                <BarChart3 className="w-5 h-5" />
                <h2 className="font-condensed text-lg font-bold text-neutral-900">
                  {t('metricsTab')}
                </h2>
              </div>
              <p className="text-xs text-neutral-500 max-w-3xl leading-relaxed">
                {locale === 'si'
                  ? 'මෙහිදී සාමාජික ලැයිස්තු (CSV/Excel) සහ මැතිවරණ නාමලේඛන (Electoral Register) උඩුගත කිරීම මගින් මුල් පිටුවේ සජීවී කවුන්ටරය ස්වයංක්‍රීයව යාවත්කාලීන කළ හැකිය.'
                  : 'Manage operational data registries. Uploading member spreadsheets (CSV/Excel) and official electoral register files automatically reflects on the real-time homepage live counter every 5 seconds.'}
              </p>
            </div>

            {/* Overview Stats Cards - 4 Live Counter Cards (Analytics Only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">{t('totalMembers')}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#003399]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-neutral-900 font-mono">
                  {(liveStats.membersCount || users.length).toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">{t('votersCountLabel')}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-neutral-900 font-mono">
                  {liveStats.votersCount.toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">{t('businessesCountLabel')}</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-neutral-900 font-mono">
                  {liveStats.businessesCount}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">{t('yearsSettingTitle')}</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-semibold tracking-tight text-neutral-900 font-mono">
                  {liveStats.yearsOfService}+ Yrs
                </p>
              </div>
            </div>

            {/* Grid of 2 Upload Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SECTION A: MEMBERS CSV/EXCEL IMPORT */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2 text-[#003399]">
                      <FileSpreadsheet className="w-5 h-5" />
                      <h3 className="font-condensed text-base font-bold text-neutral-900">
                        {t('membersImportTitle')}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#003399] font-bold border border-blue-200/60">
                      {liveStats.membersCount.toLocaleString()} {locale === 'si' ? 'සාමාජිකයින්' : 'Members'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {t('membersImportDesc')}
                  </p>

                  {memberImportMsg && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      memberImportMsg.type === 'success' 
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                      {memberImportMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : null}
                      <span>{memberImportMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleImportMembers} className="space-y-4 pt-1">
                    {/* File Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        {locale === 'si' ? 'සාමාජික ගොනුව තෝරන්න (CSV / TSV / Excel)' : 'Select Member File (CSV / TSV)'}
                      </label>
                      <input
                        type="file"
                        accept=".csv,.txt,.tsv"
                        required
                        onChange={e => setMemberFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-neutral-700 hover:file:bg-slate-200 cursor-pointer border border-neutral-200 rounded-xl p-2 bg-slate-50"
                      />
                    </div>

                    {/* Mode Radio */}
                    <div className="flex items-center gap-4 text-xs text-neutral-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="memberMode"
                          value="append"
                          checked={memberMode === 'append'}
                          onChange={() => setMemberMode('append')}
                          className="text-[#003399]"
                        />
                        <span>{t('modeAppend')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="memberMode"
                          value="replace"
                          checked={memberMode === 'replace'}
                          onChange={() => setMemberMode('replace')}
                          className="text-[#003399]"
                        />
                        <span>{t('modeReplace')}</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isImportingMembers || !memberFile}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className={`w-3.5 h-3.5 ${isImportingMembers ? 'animate-bounce' : ''}`} />
                      <span>{isImportingMembers ? 'Processing...' : t('uploadBtn')}</span>
                    </button>
                  </form>
                </div>

                {/* Helper Schema Snippet */}
                <div className="pt-3 border-t border-neutral-100 mt-4 text-[11px] text-neutral-400 font-mono space-y-1 bg-slate-50/70 p-3 rounded-xl border border-neutral-100">
                  <p className="font-bold text-neutral-600 font-sans">{locale === 'si' ? 'අනුමත තීරු පිළිවෙළ:' : 'Expected Columns Format:'}</p>
                  <p className="text-neutral-600">Member_Number, Full_Name, NIC, Phone</p>
                  <p className="text-neutral-400 text-[10px] font-sans">{locale === 'si' ? 'හෝ නම සහ හැඳුනුම්පත් අංකය සහිත ඕනෑම CSV ගොනුවක්.' : 'Header row is automatically detected.'}</p>
                </div>
              </div>

              {/* SECTION B: ELECTORAL REGISTER UPLOAD (ELIGIBLE VOTERS) */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <UserCheck className="w-5 h-5" />
                      <h3 className="font-condensed text-base font-bold text-neutral-900">
                        {t('votersUploadTitle')}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                      {liveStats.votersCount.toLocaleString()} {locale === 'si' ? 'ඡන්දදායකයින්' : 'Voters'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {t('votersUploadDesc')}
                  </p>

                  {voterUploadMsg && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      voterUploadMsg.type === 'success' 
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                      {voterUploadMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : null}
                      <span>{voterUploadMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUploadVoters} className="space-y-4 pt-1">
                    {/* File Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        {locale === 'si' ? 'ඡන්ද හිමි නාමලේඛන ගොනුව (CSV / Text)' : 'Select Electoral Register File (CSV / Text)'}
                      </label>
                      <input
                        type="file"
                        accept=".csv,.txt,.tsv"
                        required
                        onChange={e => setVoterFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-neutral-700 hover:file:bg-slate-200 cursor-pointer border border-neutral-200 rounded-xl p-2 bg-slate-50"
                      />
                    </div>

                    {/* Mode Radio */}
                    <div className="flex items-center gap-4 text-xs text-neutral-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="voterMode"
                          value="append"
                          checked={voterMode === 'append'}
                          onChange={() => setVoterMode('append')}
                          className="text-emerald-700"
                        />
                        <span>{t('modeAppend')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="voterMode"
                          value="replace"
                          checked={voterMode === 'replace'}
                          onChange={() => setVoterMode('replace')}
                          className="text-emerald-700"
                        />
                        <span>{t('modeReplace')}</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingVoters || !voterFile}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className={`w-3.5 h-3.5 ${isUploadingVoters ? 'animate-bounce' : ''}`} />
                      <span>{isUploadingVoters ? 'Processing...' : t('uploadBtn')}</span>
                    </button>
                  </form>
                </div>

                {/* Helper Schema Snippet */}
                <div className="pt-3 border-t border-neutral-100 mt-4 text-[11px] text-neutral-400 font-mono space-y-1 bg-slate-50/70 p-3 rounded-xl border border-neutral-100">
                  <p className="font-bold text-neutral-600 font-sans">{locale === 'si' ? 'අනුමත තීරු පිළිවෙළ:' : 'Expected Columns Format:'}</p>
                  <p className="text-neutral-600">Voter_Number, Full_Name, NIC, Polling_Division</p>
                  <p className="text-neutral-400 text-[10px] font-sans">{locale === 'si' ? 'හෝ නම සහ හැඳුනුම්පත් අංකය සහිත ලැයිස්තුව.' : 'Verified voters count automatically syncs.'}</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: NEWS & ANNOUNCEMENTS MANAGEMENT */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003399] flex items-center justify-center shrink-0 border border-blue-100">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-condensed text-lg sm:text-xl font-bold text-neutral-900 leading-tight">
                      {t('newsTab')}
                    </h2>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                      {locale === 'si' 
                        ? 'මුල් පිටුවේ ප්‍රදර්ශනය වන පුවත්, රැකියා ඇබෑර්තු සහ නිවේදන කළමනාකරණය.'
                        : 'Manage official notices, driver / job vacancies, and public announcements.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openAddNewsModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addNewsBtn')}</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="pt-3 border-t border-neutral-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newsSearchQuery}
                    onChange={e => setNewsSearchQuery(e.target.value)}
                    placeholder={locale === 'si' ? 'නිවේදන මාතෘකා හෝ අන්තර්ගතය සොයන්න...' : 'Search notices by headline or content...'}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                  {newsSearchQuery && (
                    <button
                      onClick={() => setNewsSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: locale === 'si' ? 'සියල්ල' : 'All' },
                    { id: 'vacancy', label: locale === 'si' ? 'රැකියා ඇබෑර්තු' : 'Vacancies' },
                    { id: 'notice', label: locale === 'si' ? 'විශේෂ නිවේදන' : 'Notices' },
                    { id: 'tender', label: locale === 'si' ? 'ටෙන්ඩර්' : 'Tenders' },
                    { id: 'general', label: locale === 'si' ? 'පොදු' : 'General' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewsCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        newsCategoryFilter === cat.id
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-neutral-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredNews.length === 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <Newspaper className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800">
                  {locale === 'si' ? 'කිසිදු නිවේදනයක් හමු නොවීය.' : 'No announcements found.'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {locale === 'si' ? 'නව නිවේදනයක් පළ කිරීමට ඉහත බොත්තම ක්ලික් කරන්න.' : 'Click "Add Announcement" above to publish your first notice.'}
                </p>
              </div>
            )}

            {/* News Cards Grid / List */}
            {filteredNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredNews.map(item => {
                  const displayTitle = locale === 'si' ? (item.title_si || item.title_en) : (item.title_en || item.title_si);
                  const displayDesc = locale === 'si' ? (item.description_si || item.description_en) : (item.description_en || item.description_si);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
                    >
                      <div className="space-y-3.5">
                        {/* Header with image, category, and pin */}
                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-neutral-200">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={displayTitle}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-slate-50">
                                <Newspaper className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200 uppercase">
                                {item.category}
                              </span>

                              {item.is_pinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                                  <Pin className="w-2.5 h-2.5 fill-current" />
                                  <span>Pinned</span>
                                </span>
                              )}

                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                item.is_published 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                              }`}>
                                {item.is_published ? t('publishStatusPublished') : t('publishStatusDraft')}
                              </span>
                            </div>

                            <p className="text-[11px] text-neutral-400 font-mono">
                              {new Date(item.published_at || item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Prominent Title */}
                        <h3 className="font-condensed text-base sm:text-lg font-bold text-neutral-900 leading-snug line-clamp-2">
                          {displayTitle}
                        </h3>

                        {/* Description excerpt */}
                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                          {displayDesc}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          {/* Pin Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePin(item)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              item.is_pinned
                                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                : 'bg-slate-50 text-neutral-400 border-neutral-200 hover:bg-slate-100'
                            }`}
                            title={item.is_pinned ? 'Unpin from top' : 'Pin to top of homepage'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          {/* Publish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              item.is_published
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                            }`}
                            title={item.is_published ? 'Unpublish (hide from website)' : 'Publish (show on website)'}
                          >
                            {item.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditNewsModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-neutral-700 font-semibold transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{t('edit')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 4: GALLERY MANAGEMENT & MODERATION */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Gallery Toolbar */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gallerySearchQuery}
                  onChange={e => setGallerySearchQuery(e.target.value)}
                  placeholder="Search gallery posts or comments..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <button
                onClick={openAddGalleryModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addGalleryBtn')}</span>
              </button>
            </div>

            {/* Gallery Posts Grid / List */}
            {galleryPosts.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-8 text-center space-y-2">
                <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-semibold text-neutral-700">No gallery items found</p>
                <p className="text-xs text-neutral-400">Click &quot;{t('addGalleryBtn')}&quot; to upload your first photo.</p>
              </div>
            ) : (
              galleryPosts
                .filter(post => {
                  if (!gallerySearchQuery.trim()) return true;
                  const q = gallerySearchQuery.toLowerCase();
                  return (
                    post.id.toLowerCase().includes(q) ||
                    post.comments.some(c => c.author.toLowerCase().includes(q) || c.text.toLowerCase().includes(q))
                  );
                })
                .map(post => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative h-14 rounded-xl overflow-hidden border border-neutral-200 bg-slate-100 shrink-0 shadow-2xs"
                          style={{
                            aspectRatio: getAspectRatioStyle(post.aspectRatio)
                          }}
                        >
                          <Image
                            src={post.imageSrc}
                            alt={post.id}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-condensed text-sm font-bold text-neutral-900">
                              {post.id}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-mono text-[10px] font-semibold border border-neutral-200">
                              {post.aspectRatio || '4:3'}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                            {post.likesCount} Likes • {post.comments.length} Comments
                          </p>
                        </div>
                      </div>

                      {/* Post Actions: Edit, Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => openEditGalleryModal(post)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{t('edit')}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGalleryPost(post.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('delete')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2 border-t border-neutral-100 pt-3">
                      <h4 className="text-xs font-bold text-neutral-700">Comments:</h4>
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic">No comments on this post.</p>
                      ) : (
                        post.comments.map(comment => (
                          <div
                            key={comment.id}
                            className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-neutral-200/80 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <strong className="text-neutral-900 font-bold">{comment.author}</strong>
                                <span className="text-[10px] text-neutral-400">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-neutral-700 leading-relaxed">{comment.text}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                              title="Delete Comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS (WHATSAPP CONFIGURATION) */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 max-w-2xl space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700">
                <MessageCircle className="w-5 h-5" />
                <h2 className="font-condensed text-lg font-bold text-neutral-900">
                  {t('whatsappSettingTitle')}
                </h2>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {t('whatsappSettingDesc')}
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {settingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('settingsUpdated')}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Support WhatsApp Number (International format with country code)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder={t('whatsappPlaceholder')}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Example for Sri Lanka: <strong>94771234567</strong> (without leading 0 or spaces).
                </p>
              </div>

              {/* Years of Service Field */}
              <div className="space-y-1.5 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Calendar className="w-4 h-4" />
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('yearsSettingTitle')}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="150"
                    required
                    value={yearsOfService}
                    onChange={e => setYearsOfService(e.target.value)}
                    placeholder={t('yearsPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t('yearsSettingDesc')}
                </p>
              </div>

              {/* Contact Form Destination Emails Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#003399]">
                    <Mail className="w-4 h-4" />
                    <label className="block text-xs font-bold text-neutral-900">
                      {locale === 'si' ? 'වෙබ් විමසීම් දැනුම්දීමේ ඊමේල් ලිපින' : 'Contact Form Submission Emails'}
                    </label>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasSmtpConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {hasSmtpConfigured ? 'SMTP Mailer Configured' : 'SMTP Inactive (Set in .env.local)'}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  {locale === 'si'
                    ? 'පාරිභෝගිකයින් විසින් වෙබ් අඩවියේ විමසීම් පෝරමය හරහා යොමු කරනු ලබන පණිවිඩ පහත සඳහන් ඊමේල් ලිපින වෙත සෘජුවම යොමු කෙරේ. මෙහි එක් ලිපිනයක් හෝ ලිපින දෙකම ඇතුළත් කළ හැක.'
                    : 'Inquiries submitted through the website contact form will be automatically delivered to the email addresses specified below. Works whether one or both emails are added.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-neutral-700">
                      {locale === 'si' ? 'ප්‍රධාන ඊමේල් ලිපිනය (Email 1)' : 'Primary Destination Email (Email 1)'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={contactEmail1}
                        onChange={e => setContactEmail1(e.target.value)}
                        placeholder="e.g. induwara@gmail.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-neutral-700">
                      {locale === 'si' ? 'ද්විතියික ඊමේල් ලිපිනය (Email 2 - අත්‍යවශ්‍ය නොවේ)' : 'Secondary Destination Email (Email 2 - Optional)'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={contactEmail2}
                        onChange={e => setContactEmail2(e.target.value)}
                        placeholder="e.g. manager@panduwasnuwara.lk"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Configuration Summary & Format Preview */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {locale === 'si' ? 'පණිවිඩ බෙදාහැරීමේ තත්ත්වය:' : 'Current Delivery Configuration:'}
                    </span>
                    <span className="font-mono text-neutral-900">
                      {contactEmail1 && contactEmail2
                        ? (locale === 'si' ? 'ලිපින 2 ටම යොමු කෙරේ (Delivering to both)' : 'Delivering to both addresses')
                        : contactEmail1 || contactEmail2
                        ? `${locale === 'si' ? 'එක් ලිපිනයකට යොමු කෙරේ:' : 'Delivering to single address:'} ${contactEmail1 || contactEmail2}`
                        : (locale === 'si' ? 'දැනුම්දීම් අක්‍රියයි (ලිපිනයක් සකසා නැත)' : 'No notification emails configured')}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-600 font-mono bg-white p-2.5 rounded-lg border border-neutral-200 leading-relaxed">
                    <div className="font-bold text-neutral-700 mb-1">Standard Message Format Delivered:</div>
                    Name: Induwara<br /><br />
                    Email: induwara@gmail.com<br /><br />
                    Phone Number: 019283839<br /><br />
                    Message: iwhwbenwsksish
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? 'Saving...' : t('saveSettings')}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: MESSAGES / INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Header / Search & Category Filters */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-condensed text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#003399]" />
                    <span>{t('inquiriesTitle') || 'Customer Inquiries & Messages'}</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {t('inquiriesSubtitle') || 'Incoming inquiries routed from business pages categorized by department'}
                  </p>
                </div>

                {/* Search box */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inquirySearchQuery}
                    onChange={(e) => setInquirySearchQuery(e.target.value)}
                    placeholder={t('searchInquiriesPlaceholder') || 'Search inquiries...'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Categorized Business Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button
                  onClick={() => setSelectedInquiryCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    selectedInquiryCategory === 'all'
                      ? 'bg-[#003399] text-white shadow-xs'
                      : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{t('allInquiries') || 'All Messages'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedInquiryCategory === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {inquiries.length}
                  </span>
                </button>

                {BUSINESS_CATEGORIES.map(cat => {
                  const catCount = inquiryCategoryCounts.find(c => c.business_key === cat.key);
                  const count = catCount?.count || inquiries.filter(i => i.business_key === cat.key).length;
                  const unread = catCount?.unread_count || inquiries.filter(i => i.business_key === cat.key && i.status === 'unread').length;

                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedInquiryCategory(cat.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        selectedInquiryCategory === cat.key
                          ? 'bg-[#003399] text-white shadow-xs'
                          : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{locale === 'si' ? cat.titleSi : cat.titleEn}</span>
                      {unread > 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                          {unread}
                        </span>
                      ) : (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedInquiryCategory === cat.key ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Filter Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 overflow-x-auto custom-scrollbar">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
                  {locale === 'si' ? 'තත්ත්වය:' : 'Status:'}
                </span>

                {(['all', 'unread', 'read', 'replied'] as const).map(st => {
                  const count = inquiries.filter(i => {
                    const matchCat = selectedInquiryCategory === 'all' || i.business_key === selectedInquiryCategory;
                    const matchSt = st === 'all' || i.status === st;
                    return matchCat && matchSt;
                  }).length;

                  return (
                    <button
                      key={st}
                      onClick={() => setInquiryStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        inquiryStatusFilter === st
                          ? st === 'unread'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : st === 'replied'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-800 text-white shadow-xs'
                          : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="capitalize">
                        {st === 'all'
                          ? (locale === 'si' ? 'සියල්ල' : 'All')
                          : st === 'unread'
                          ? (locale === 'si' ? 'නොකියවූ' : 'Unread')
                          : st === 'read'
                          ? (locale === 'si' ? 'කියවූ' : 'Read')
                          : (locale === 'si' ? 'පිළිතුරු දුන්' : 'Replied')}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        inquiryStatusFilter === st ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inquiries Table / List */}
            {inquiries.length === 0 || (
              inquiries
                .filter(i => selectedInquiryCategory === 'all' || i.business_key === selectedInquiryCategory)
                .filter(i => inquiryStatusFilter === 'all' || i.status === inquiryStatusFilter)
                .filter(i => {
                  if (!inquirySearchQuery.trim()) return true;
                  const q = inquirySearchQuery.toLowerCase();
                  return (
                    i.user_name.toLowerCase().includes(q) ||
                    i.subject.toLowerCase().includes(q) ||
                    i.phone.toLowerCase().includes(q) ||
                    i.business_name.toLowerCase().includes(q) ||
                    (i.message && i.message.toLowerCase().includes(q))
                  );
                }).length === 0
            ) ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-12 text-center space-y-2">
                <Inbox className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm font-semibold text-neutral-700">
                  {t('noInquiriesFound') || 'No inquiries found for this filter.'}
                </p>
                <p className="text-xs text-neutral-400">
                  Messages submitted by customers and members will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries
                  .filter(i => selectedInquiryCategory === 'all' || i.business_key === selectedInquiryCategory)
                  .filter(i => inquiryStatusFilter === 'all' || i.status === inquiryStatusFilter)
                  .filter(i => {
                    if (!inquirySearchQuery.trim()) return true;
                    const q = inquirySearchQuery.toLowerCase();
                    return (
                      i.user_name.toLowerCase().includes(q) ||
                      i.subject.toLowerCase().includes(q) ||
                      i.phone.toLowerCase().includes(q) ||
                      i.business_name.toLowerCase().includes(q) ||
                      (i.message && i.message.toLowerCase().includes(q))
                    );
                  })
                  .map(item => {
                    const isUnread = item.status === 'unread';
                    const isReplied = item.status === 'replied';

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectInquiry(item)}
                        className={`group bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:border-neutral-300 ${
                          isUnread ? 'border-blue-300 bg-blue-50/20 shadow-xs' : 'border-neutral-200/90 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Unread dot / Status icon */}
                          <div className="pt-0.5 shrink-0">
                            {isUnread ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block animate-pulse mt-1" />
                            ) : isReplied ? (
                              <CheckCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-neutral-300 block mt-1" />
                            )}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-neutral-900 text-sm">
                                {item.user_name}
                              </span>
                              {item.user_id && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {t('registeredUser') || 'Member'}
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {item.business_name}
                              </span>
                            </div>

                            <h4 className="font-semibold text-xs sm:text-sm text-neutral-800 truncate">
                              {item.subject}
                            </h4>

                            <p className="text-xs text-neutral-500 line-clamp-1">
                              {item.message}
                            </p>
                          </div>
                        </div>

                        {/* Right details & actions */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0 text-xs">
                          <div className="text-right hidden sm:block">
                            <span className="font-mono text-[11px] text-neutral-700 font-semibold block">
                              {item.phone}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            isUnread ? 'bg-blue-100 text-blue-800' : isReplied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInquiry(item.id);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: BUSINESSES & SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <BusinessManagementTab />
        )}

        {/* TAB: FUEL PRICE MANAGEMENT */}
        {activeTab === 'fuel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-amber-500" />
                    <h2 className="font-condensed text-lg sm:text-xl font-bold text-neutral-900">
                      {locale === 'si' ? 'ඉන්ධන සිල්ලර මිල කළමනාකරණය' : "Today's Fuel Price Management"}
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {locale === 'si' 
                      ? 'ඉන්ධන පිරවුම්හල් පිටුවේ ප්‍රදර්ශනය වන ලීටරයක සිල්ලර මිල ගණන් පහතින් යාවත්කාලීන කරන්න.'
                      : 'Update the official retail price per liter for the three designated fuel categories.'}
                  </p>
                </div>

                {fuelUpdatedAt && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Last updated: {new Date(fuelUpdatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {fuelSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {locale === 'si' 
                      ? 'ඉන්ධන මිල ගණන් සාර්ථකව සුරැකිණි. වෙබ් අඩවියේ නව මිල ගණන් සක්‍රීය විය.'
                      : 'Fuel prices updated successfully and are now live on the public fuel station page.'}
                  </span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSaveFuelPrices(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* 1. Kerosene */}
                  <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Fuel className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-condensed font-bold text-sm text-neutral-900">
                            {locale === 'si' ? 'භූමිතෙල්' : 'Kerosene'}
                          </h3>
                          <span className="text-[10px] text-neutral-500">Kerosene / භූමිතෙල්</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                        LKR / L
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-700 block">
                        {locale === 'si' ? 'ලීටරයක මිල (රුපියල්)' : 'Price Per Liter (Rs.)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">Rs.</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={adminFuelPrices['kerosene'] ?? 235}
                          onChange={(e) => setAdminFuelPrices(prev => ({ ...prev, 'kerosene': parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-mono font-bold text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Petrol 92 */}
                  <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                          <Fuel className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-condensed font-bold text-sm text-neutral-900">
                            {locale === 'si' ? 'පෙට්රල් 92' : 'Petrol 92'}
                          </h3>
                          <span className="text-[10px] text-neutral-500">Octane 92 / පෙට්රල් 92</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">
                        LKR / L
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-700 block">
                        {locale === 'si' ? 'ලීටරයක මිල (රුපියල්)' : 'Price Per Liter (Rs.)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">Rs.</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={adminFuelPrices['petrol-92'] ?? 311}
                          onChange={(e) => setAdminFuelPrices(prev => ({ ...prev, 'petrol-92': parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-mono font-bold text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Super Diesel */}
                  <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <Fuel className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-condensed font-bold text-sm text-neutral-900">
                            {locale === 'si' ? 'සුපර් ඩීසල්' : 'Super Diesel'}
                          </h3>
                          <span className="text-[10px] text-neutral-500">Super Diesel / සුපර් ඩීසල්</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                        LKR / L
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-700 block">
                        {locale === 'si' ? 'ලීටරයක මිල (රුපියල්)' : 'Price Per Liter (Rs.)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">Rs.</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={adminFuelPrices['super-diesel'] ?? 328}
                          onChange={(e) => setAdminFuelPrices(prev => ({ ...prev, 'super-diesel': parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-mono font-bold text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingFuel}
                    className="px-6 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingFuel ? (locale === 'si' ? 'සුරකිමින්...' : 'Saving...') : (locale === 'si' ? 'මිල ගණන් යාවත්කාලීන කරන්න' : 'Update Fuel Prices')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={fetchAdminFuelPrices}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {locale === 'si' ? 'නැවත පූරණය' : 'Reload Current'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-md w-full p-6 space-y-5 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label={t('cancel')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-condensed text-lg font-bold text-neutral-900">
                {t('editModalTitle')}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">ID #{editingUser.id}</p>
            </div>

            {userError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {userError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">{t('thName')}</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">{t('thNic')}</label>
                <input
                  type="text"
                  required
                  value={editNic}
                  onChange={e => setEditNic(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">{t('thPhone')}</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">{t('thRole')}</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                >
                  <option value="user">{t('roleUser')}</option>
                  <option value="admin">{t('roleAdmin')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('newPasswordPlaceholder')}
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-4 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingUser ? 'Saving...' : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT NEWS ANNOUNCEMENT MODAL */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#003399]">
                <Newspaper className="w-5 h-5" />
                <h3 className="font-condensed text-base sm:text-lg font-bold text-neutral-900">
                  {editingNews ? t('editNewsTitle') : t('addNewsTitle')}
                </h3>
              </div>
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNews} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {newsError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {newsError}
                </div>
              )}

              {/* Category & Badge Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('categoryLabel')} *
                  </label>
                  <select
                    value={newsCategory}
                    onChange={e => setNewsCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  >
                    <option value="vacancy">{t('categoryVacancy')}</option>
                    <option value="notice">{t('categoryNotice')}</option>
                    <option value="tender">{t('categoryTender')}</option>
                    <option value="general">{t('categoryGeneral')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={locale === 'si' ? newsBadgeSi : newsBadgeEn}
                    onChange={e => {
                      if (locale === 'si') setNewsBadgeSi(e.target.value);
                      else setNewsBadgeEn(e.target.value);
                    }}
                    placeholder={locale === 'si' ? 'උදා: රැකියා ඇබෑර්තු / විශේෂ' : 'e.g. Job Vacancy / Urgent'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Title Fields */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('newsTitleSi')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitleSi}
                    onChange={e => setNewsTitleSi(e.target.value)}
                    placeholder="උදා: බර වාහන රියදුරු පුරප්පාඩු සඳහා අයදුම්පත් කැඳවීම"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('newsTitleEn')}
                  </label>
                  <input
                    type="text"
                    value={newsTitleEn}
                    onChange={e => setNewsTitleEn(e.target.value)}
                    placeholder="e.g. Call for Applications: Heavy Vehicle Driver Vacancies"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('newsDescSi')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newsDescSi}
                    onChange={e => setNewsDescSi(e.target.value)}
                    placeholder="අවශ්‍ය සුදුසුකම්, වැටුප් විස්තර සහ අයදුම් කළ යුතු ආකාරය ඇතුළු සම්පූර්ණ විස්තරය මෙහි ලියන්න..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('newsDescEn')}
                  </label>
                  <textarea
                    rows={4}
                    value={newsDescEn}
                    onChange={e => setNewsDescEn(e.target.value)}
                    placeholder="Full notice requirements, benefits, and application guidelines in English..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('imageUploadLabel')}
                </label>
                
                {newsImagePreview && (
                  <div className="relative w-full h-36 rounded-xl bg-slate-100 overflow-hidden border border-neutral-200">
                    <Image
                      src={newsImagePreview}
                      alt="Notice preview"
                      fill
                      sizes="(max-width: 640px) 100vw, 448px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewsImageFile(null);
                        setNewsImagePreview(null);
                        setNewsImageUrlInput('');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold cursor-pointer border border-neutral-200 border-dashed transition-colors">
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Choose Image File (.jpg, .png, .webp)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleNewsImageChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={newsImageUrlInput}
                    onChange={e => {
                      setNewsImageUrlInput(e.target.value);
                      if (e.target.value.trim()) setNewsImagePreview(e.target.value.trim());
                    }}
                    placeholder="or enter image path / URL"
                    className="flex-1 w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Toggles: Pin and Publish */}
              <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={newsIsPinned}
                    onChange={e => setNewsIsPinned(e.target.checked)}
                    className="rounded text-[#003399] focus:ring-0 w-4 h-4"
                  />
                  <span>{t('isPinnedLabel')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={newsIsPublished}
                    onChange={e => setNewsIsPublished(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-0 w-4 h-4"
                  />
                  <span>{t('isPublishedLabel')}</span>
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingNews}
                  className="px-5 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingNews ? 'Saving...' : (editingNews ? t('saveChanges') : t('addNewsBtn'))}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* GALLERY ADD / EDIT MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#003399]" />
                <h3 className="font-condensed text-lg font-bold text-neutral-900">
                  {editingGalleryPost ? t('editGalleryTitle') : t('addGalleryTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {galleryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {galleryError}
              </div>
            )}

            <form onSubmit={handleSaveGalleryPost} className="space-y-4">
              {/* Optional Custom Identifier */}
              {!editingGalleryPost && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Photo Title / Identifier (Optional)
                  </label>
                  <input
                    type="text"
                    value={galleryCustomId}
                    onChange={e => setGalleryCustomId(e.target.value)}
                    placeholder="e.g. AGM 2026 or leave blank for auto-id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              )}

              {/* Aspect Ratio Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['4:3', '16:9', '1:1', '3:2'].map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setGalleryAspectRatio(ratio)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                        galleryAspectRatio === ratio
                          ? 'bg-[#003399] text-white border-[#003399] shadow-xs'
                          : 'bg-slate-50 text-neutral-700 border-neutral-200 hover:bg-slate-100'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Preview & Upload */}
              <div className="space-y-2 pt-1 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('galleryImageLabel')} {!editingGalleryPost && '*'}
                </label>

                {galleryImagePreview && (
                  <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-neutral-200 flex flex-col items-center justify-center">
                    <div
                      className="relative w-full rounded-xl bg-slate-200 overflow-hidden border border-neutral-300 shadow-xs transition-all duration-300 mx-auto"
                      style={{
                        aspectRatio: getAspectRatioStyle(galleryAspectRatio),
                        maxHeight: '260px',
                        maxWidth: galleryAspectRatio === '1:1' ? '260px' : galleryAspectRatio === '4:3' ? '340px' : galleryAspectRatio === '3:2' ? '390px' : '100%'
                      }}
                    >
                      <Image
                        src={galleryImagePreview}
                        alt="Gallery Preview"
                        fill
                        sizes="(max-width: 640px) 100vw, 448px"
                        className="object-cover transition-all duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                        {galleryAspectRatio}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryImageFile(null);
                          setGalleryImagePreview(null);
                          setGalleryImageUrlInput('');
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold cursor-pointer border border-neutral-200 border-dashed transition-colors">
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Choose File (.jpg, .png, .webp)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleGalleryImageChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={galleryImageUrlInput}
                    onChange={e => {
                      setGalleryImageUrlInput(e.target.value);
                      if (e.target.value.trim()) setGalleryImagePreview(e.target.value.trim());
                    }}
                    placeholder="or enter image path / URL"
                    className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingGallery || (!editingGalleryPost && !galleryImageFile && !galleryImageUrlInput.trim())}
                  className="px-5 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingGallery ? 'Saving...' : (editingGalleryPost ? t('saveChanges') : t('addGalleryBtn'))}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INQUIRY DETAIL MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003399] flex items-center justify-center shrink-0">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed text-lg font-bold text-neutral-900 leading-tight">
                    {t('inquiryDetailTitle') || 'Inquiry Details'}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    ID #{selectedInquiry.id} • {selectedInquiry.business_name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-xs text-neutral-700">
              {/* Sender Details Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {t('senderDetails') || 'Sender Information'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedInquiry.user_id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedInquiry.user_id ? (locale === 'si' ? 'ලියාපදිංචි සාමාජික' : 'Registered Member') : (locale === 'si' ? 'ආගන්තුක' : 'Guest')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">{locale === 'si' ? 'සම්පූර්ණ නම:' : 'Full Name:'}</span>
                    <strong className="text-neutral-900 font-bold text-sm">{selectedInquiry.user_name}</strong>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">{locale === 'si' ? 'දුරකථන / WhatsApp අංකය:' : 'Phone / WhatsApp:'}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`tel:${formatCallNumber(selectedInquiry.phone)}`}
                        className="font-mono font-bold text-[#003399] hover:underline text-sm inline-flex items-center gap-1"
                        title={locale === 'si' ? 'ඇමතුමක් ලබාගන්න' : 'Call Phone'}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedInquiry.phone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(selectedInquiry.phone)}
                        className="px-1.5 py-0.5 rounded bg-neutral-200/70 hover:bg-neutral-200 text-neutral-700 text-[10px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Copy Number"
                      >
                        {copiedPhoneFeedback ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-neutral-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">{locale === 'si' ? 'විද්‍යුත් තැපෑල:' : 'Email Address:'}</span>
                    {selectedInquiry.email ? (
                      <span className="font-medium text-neutral-800 font-mono text-[11px]">{selectedInquiry.email}</span>
                    ) : (
                      <span className="text-neutral-400 italic text-[11px]">{locale === 'si' ? 'ලබාදී නැත' : 'Not provided'}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">{locale === 'si' ? 'ලැබුණු දිනය:' : 'Received Date:'}</span>
                    <span className="font-mono text-neutral-600 text-[11px]">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject & Message Content */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  {t('subjectLabel') || 'Subject'}
                </span>
                <h4 className="font-bold text-sm sm:text-base text-neutral-900 bg-slate-50 p-3 rounded-xl border border-neutral-200">
                  {selectedInquiry.subject}
                </h4>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  {t('messageLabel') || 'Message Content'}
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-neutral-200 leading-relaxed whitespace-pre-wrap font-normal text-neutral-800 text-xs sm:text-sm">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Selector Bar */}
              <div className="p-3 rounded-xl bg-slate-50 border border-neutral-200/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[11px] text-neutral-700">{locale === 'si' ? 'පණිවිඩ තත්ත්වය:' : 'Status:'}</span>
                  <div className="inline-flex rounded-lg bg-neutral-200/60 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'unread')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedInquiry.status === 'unread'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {locale === 'si' ? 'නොකියවූ (Unread)' : 'Unread'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'read')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedInquiry.status === 'read'
                          ? 'bg-neutral-800 text-white shadow-xs font-bold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {locale === 'si' ? 'කියවූ (Read)' : 'Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, 'replied')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 ${
                        selectedInquiry.status === 'replied'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{locale === 'si' ? 'පිළිතුරු දුන් (Replied)' : 'Replied'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${formatCallNumber(selectedInquiry.phone)}`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title={locale === 'si' ? 'ඇමතුමක් ලබාගන්න' : 'Call Phone'}
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{locale === 'si' ? 'ඇමතුම් (Call)' : 'Call'}</span>
                  </a>
                </div>
              </div>

              {/* Already Replied Notification Banner */}
              {selectedInquiry.status === 'replied' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {locale === 'si' ? 'මෙම විමසීමට පිළිතුරු සපයා ඇත' : 'This inquiry has been marked as Replied'}
                    </span>
                    {selectedInquiry.replied_at && (
                      <span className="text-[10px] font-mono text-emerald-600 font-normal">
                        ({new Date(selectedInquiry.replied_at).toLocaleString()})
                      </span>
                    )}
                  </div>
                  {selectedInquiry.reply_message && (
                    <p className="text-xs text-emerald-800 bg-white/70 p-2 rounded-lg border border-emerald-100 mt-1 whitespace-pre-wrap">
                      <strong className="font-semibold text-emerald-900">{locale === 'si' ? 'යැවූ පිළිතුර:' : 'Recorded Reply:'}</strong> {selectedInquiry.reply_message}
                    </p>
                  )}
                </div>
              )}

              {/* Reply Feedback Toast */}
              {replyFeedbackMessage && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{replyFeedbackMessage}</span>
                </div>
              )}

              {/* CUSTOMER REPLY SECTION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#003399]" />
                    <span className="text-xs font-bold text-neutral-900">
                      {locale === 'si' ? 'පණිවිඩයට පිළිතුරු සපයන්න (Reply to Customer)' : 'Reply to Customer'}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {locale === 'si' ? 'WhatsApp හෝ ඊමේල් හරහා යැවිය හැක' : 'Dispatch via WhatsApp or Email'}
                  </span>
                </div>

                {/* Quick Reply Template Chips */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    {locale === 'si' ? 'කඩිනම් ආකෘති (Quick Templates):' : 'Quick Templates:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyTextInput(locale === 'si' ? tmpl.textSi : tmpl.textEn)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-[#003399] hover:bg-blue-50/50 text-neutral-700 hover:text-[#003399] text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {locale === 'si' ? tmpl.labelSi : tmpl.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Message Textarea */}
                <textarea
                  rows={3}
                  value={replyTextInput}
                  onChange={(e) => setReplyTextInput(e.target.value)}
                  placeholder={
                    locale === 'si'
                      ? 'පාරිභෝගිකයා වෙත යැවිය යුතු පිළිතුර මෙහි ලියන්න... (WhatsApp හෝ ඊමේල් මඟින් යැවිය හැක)'
                      : 'Type your reply message here to send via WhatsApp, Email, or save as official record...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs focus:outline-hidden focus:border-[#003399] leading-relaxed resize-y"
                />

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {/* Send WhatsApp Reply Button */}
                    <button
                      type="button"
                      onClick={handleSendWhatsAppReply}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title={locale === 'si' ? 'WhatsApp මඟින් පිළිතුර යවන්න' : 'Send reply via WhatsApp'}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{locale === 'si' ? 'WhatsApp පිළිතුර' : 'WhatsApp Reply'}</span>
                    </button>

                    {/* Send Email Reply Button */}
                    {selectedInquiry.email ? (
                      <button
                        type="button"
                        onClick={handleSendEmailReply}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        title={locale === 'si' ? 'ඊමේල් මඟින් පිළිතුර යවන්න' : 'Send reply via Email'}
                      >
                        <Mail className="w-4 h-4" />
                        <span>{locale === 'si' ? 'ඊමේල් පිළිතුර' : 'Email Reply'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 italic px-2">
                        {locale === 'si' ? '(ඊමේල් ලිපිනයක් සපයා නැත)' : '(No email provided)'}
                      </span>
                    )}
                  </div>

                  {/* Save Direct Reply Record */}
                  <button
                    type="button"
                    onClick={handleSaveDirectReply}
                    disabled={isSavingReply || !replyTextInput.trim()}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSavingReply ? 'Saving...' : (locale === 'si' ? 'පිළිතුර සුරකින්න (Record)' : 'Save Record')}</span>
                  </button>
                </div>
              </div>

              {/* Administrative Internal Notes Form */}
              <form onSubmit={handleSaveAdminNotes} className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('adminNotesLabel') || (locale === 'si' ? 'පරිපාලන අභ්‍යන්තර සටහන්' : 'Administrative Internal Notes')}
                  </label>
                  {notesSavedFeedback && (
                    <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1 animate-in fade-in duration-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>{locale === 'si' ? 'සාර්ථකව සුරැකිණි!' : 'Saved successfully!'}</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder={
                      locale === 'si'
                        ? 'අභ්‍යන්තර සටහනක් හෝ පැවරුණු නිලධාරියා ඇතුළත් කරන්න...'
                        : 'Add follow-up notes, assigned officer, or internal action...'
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399]"
                  />
                  <button
                    type="submit"
                    disabled={isSavingNotes}
                    className="px-4 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? 'Saving...' : (locale === 'si' ? 'සුරකින්න' : 'Save')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT BUSINESS SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-neutral-200 bg-slate-50 flex items-center justify-between shrink-0">
              <h3 className="font-condensed text-lg font-bold text-neutral-900">
                {editingService ? (t('editServiceTitle') || 'Edit Service') : (t('addServiceTitle') || 'Add New Service')}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {serviceError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {serviceError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('serviceTitleSi') || 'Service Title (Sinhala)'} *
                </label>
                <input
                  type="text"
                  required
                  value={serviceTitleSi}
                  onChange={(e) => setServiceTitleSi(e.target.value)}
                  placeholder="උදා: තැන්පතු ගිණුම්"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('serviceTitleEn') || 'Service Title (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={serviceTitleEn}
                  onChange={(e) => setServiceTitleEn(e.target.value)}
                  placeholder="e.g. Savings Accounts"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('serviceDescSi') || 'Service Description (Sinhala)'}
                </label>
                <textarea
                  rows={2}
                  value={serviceDescSi}
                  onChange={(e) => setServiceDescSi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('serviceDescEn') || 'Service Description (English)'}
                </label>
                <textarea
                  rows={2}
                  value={serviceDescEn}
                  onChange={(e) => setServiceDescEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('serviceFeaturesSi') || 'Key Features (Sinhala, comma separated)'}
                </label>
                <input
                  type="text"
                  value={serviceFeaturesSi}
                  onChange={(e) => setServiceFeaturesSi(e.target.value)}
                  placeholder="ඉහළ පොලියක්, ක්ෂණික ගිණුම් විවෘත කිරීම"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('serviceFeaturesEn') || 'Key Features (English, comma separated)'}
                </label>
                <input
                  type="text"
                  value={serviceFeaturesEn}
                  onChange={(e) => setServiceFeaturesEn(e.target.value)}
                  placeholder="High interest, Instant opening, Passbook facility"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#003399]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={serviceDisplayOrder}
                    onChange={(e) => setServiceDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">Status</label>
                  <button
                    type="button"
                    onClick={() => setServiceIsActive(!serviceIsActive)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      serviceIsActive ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-neutral-200 text-neutral-500'
                    }`}
                  >
                    {serviceIsActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="px-6 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
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
