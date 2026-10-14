'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, MessageSquare, Trash2, X, Send, Camera, ShieldCheck, LogOut, User, Plus, Edit2, Upload, Check } from 'lucide-react';
import { getClientId } from '@/lib/clientId';

const getAspectRatioStyle = (ratio?: string): string => {
  switch (ratio) {
    case '16:9': return '16 / 9';
    case '1:1': return '1 / 1';
    case '3:2': return '3 / 2';
    case '4:3':
    default: return '4 / 3';
  }
};

export interface GalleryComment {
  id: string;
  post_id: string;
  author: string;
  text: string;
  created_at: string;
}

export interface GalleryPost {
  id: string;
  imageSrc: string;
  aspectRatio: string;
  likesCount: number;
  hasLiked: boolean;
  comments: GalleryComment[];
  description?: string | null;
}

export default function GallerySection() {
  const t = useTranslations('Gallery');
  const locale = useLocale();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<GalleryPost | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; isAdmin: boolean } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [animatingPostId, setAnimatingPostId] = useState<string | null>(null);

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Admin Gallery CRUD State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [photoImageFile, setPhotoImageFile] = useState<File | null>(null);
  const [photoImagePreview, setPhotoImagePreview] = useState<string | null>(null);
  const [photoImageUrlInput, setPhotoImageUrlInput] = useState('');
  const [photoAspectRatio, setPhotoAspectRatio] = useState('4:3');
  const [photoCustomId, setPhotoCustomId] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const openAddPhotoModal = () => {
    setEditingPost(null);
    setPhotoImageFile(null);
    setPhotoImagePreview(null);
    setPhotoImageUrlInput('');
    setPhotoAspectRatio('4:3');
    setPhotoCustomId('');
    setPhotoDescription('');
    setPhotoError('');
    setIsPhotoModalOpen(true);
  };

  const openEditPhotoModal = (post: GalleryPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    setPhotoImageFile(null);
    setPhotoImagePreview(post.imageSrc);
    setPhotoImageUrlInput(post.imageSrc);
    setPhotoAspectRatio(post.aspectRatio || '4:3');
    setPhotoCustomId(post.id);
    setPhotoDescription(post.description || '');
    setPhotoError('');
    setIsPhotoModalOpen(true);
  };

  const handlePhotoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoImagePreview(previewUrl);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPhoto(true);
    setPhotoError('');

    try {
      const formData = new FormData();
      if (editingPost) {
        formData.append('id', editingPost.id);
      } else if (photoCustomId.trim()) {
        formData.append('id', photoCustomId.trim());
      }
      formData.append('aspect_ratio', photoAspectRatio);
      formData.append('description', photoDescription.trim());

      if (photoImageFile) {
        formData.append('image', photoImageFile);
      } else if (photoImageUrlInput.trim()) {
        formData.append('image_src', photoImageUrlInput.trim());
      }

      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch('/api/gallery', {
        method,
        body: formData
      });

      const data = await res.json();
      if (data.success && data.post) {
        if (editingPost) {
          setPosts(prev =>
            prev.map(p => (p.id === editingPost.id ? { ...p, ...data.post } : p))
          );
        } else {
          setPosts(prev => [data.post, ...prev]);
        }
        setIsPhotoModalOpen(false);
      } else {
        setPhotoError(data.error || 'Failed to save photo');
      }
    } catch {
      setPhotoError('Network error saving photo');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleDeletePhoto = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(t('deletePhotoConfirm'))) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        if (activePost && activePost.id === postId) {
          setActivePost(null);
        }
      } else {
        alert(data.error || 'Failed to delete photo');
      }
    } catch {
      alert('Error deleting photo');
    }
  };

  const fetchGalleryData = async () => {
    try {
      const clientId = getClientId();
      const res = await fetch(`/api/gallery?clientId=${clientId}`);
      const data = await res.json();
      if (data.success && data.posts) {
        setPosts(data.posts);
      }
      if (data.currentUser) {
        setCurrentUser(data.currentUser);
        setIsAdmin(Boolean(data.currentUser.isAdmin));
      }
    } catch (err) {
      console.error('Failed to load gallery posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.isAuthenticated && data.user) {
        setCurrentUser({
          username: data.user.username,
          role: data.user.role,
          isAdmin: Boolean(data.isAdmin)
        });
        setIsAdmin(Boolean(data.isAdmin));
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    } catch {
      setCurrentUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
    checkAuthStatus();
  }, []);

  // Sync active modal item on data refresh
  useEffect(() => {
    if (activePost) {
      const updated = posts.find(p => p.id === activePost.id);
      if (updated) {
        setActivePost(updated);
      }
    }
  }, [posts, activePost]);

  const handleToggleLike = async (post: GalleryPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const clientId = getClientId();

    // Optimistic update
    setAnimatingPostId(post.id);
    setTimeout(() => setAnimatingPostId(null), 300);

    const willLike = !post.hasLiked;
    const newCount = willLike ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);

    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return { ...p, hasLiked: willLike, likesCount: newCount };
      }
      return p;
    }));

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'react', postId: post.id, clientId })
      });
      const data = await res.json();
      if (data.requireLogin) {
        setShowAuthModal(true);
        fetchGalleryData();
        return;
      }
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === post.id) {
            return { ...p, hasLiked: data.liked, likesCount: data.likesCount };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!activePost || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId: activePost.id,
          text: commentText
        })
      });

      const data = await res.json();
      if (data.requireLogin) {
        setShowAuthModal(true);
        return;
      }
      if (data.success && data.comment) {
        setPosts(prev => prev.map(p => {
          if (p.id === activePost.id) {
            return { ...p, comments: [...p.comments, data.comment] };
          }
          return p;
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    setDeletingCommentId(commentId);
    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      });

      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (activePost && p.id === activePost.id) {
            return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
          }
          return p;
        }));
      } else {
        alert(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    setIsAdmin(false);
    setCurrentUser(null);
    fetchGalleryData();
  };

  return (
    <section
      id="gallery"
      className="w-full bg-[#FAFAFA] pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 font-sans scroll-mt-20 border-t border-neutral-200/80"
    >
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Camera className="w-3.5 h-3.5 text-slate-700" />
            <span>{t('eyebrow')}</span>
          </div>

          <h2 className="font-condensed text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight pt-1">
            {t('heading')}
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed pt-1">
            {t('subtext')}
          </p>

          {isAdmin && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                <span className="text-xs font-semibold text-neutral-800 tracking-tight">
                  {t('adminBadge')}
                </span>
                <span className="w-px h-3.5 bg-neutral-200" />
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer group/exit"
                >
                  <span>{t('logout')}</span>
                  <LogOut className="w-3 h-3 text-neutral-400 group-hover/exit:text-neutral-700 transition-colors" />
                </button>
              </div>

              <button
                onClick={openAddPhotoModal}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addPhoto')}</span>
              </button>
            </div>
          )}

          {currentUser && !isAdmin && (
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 mt-2 rounded-full bg-white border border-neutral-200/90 shadow-2xs">
              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-neutral-800 tracking-tight">
                {t('userBadge')} <strong className="font-bold text-neutral-900">{currentUser.username}</strong>
              </span>
              <span className="w-px h-3.5 bg-neutral-200" />
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer group/exit"
              >
                <span>{t('logout')}</span>
                <LogOut className="w-3 h-3 text-neutral-400 group-hover/exit:text-neutral-700 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 p-4 space-y-3">
                <div className="w-full aspect-4/3 bg-slate-100 rounded-xl" />
                <div className="h-6 bg-slate-100 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div
                  onClick={() => setActivePost(post)}
                  className="relative w-full overflow-hidden bg-neutral-100 cursor-pointer"
                  style={{
                    aspectRatio: getAspectRatioStyle(post.aspectRatio)
                  }}
                >
                  <Image
                    src={post.imageSrc}
                    alt="Gallery item"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />

                  {/* Admin controls overlay */}
                  {isAdmin && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-xl border border-white/20 shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditPhotoModal(post, e)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-neutral-800 transition-colors cursor-pointer"
                        title={t('editPhoto')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePhoto(post.id, e)}
                        className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title={t('deletePhoto')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {post.description && (
                  <div className="px-4 sm:px-5 pt-3 pb-1">
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex items-center justify-between border-t border-neutral-100">
                  <button
                    onClick={(e) => handleToggleLike(post, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer group/like"
                    aria-label="React"
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform ${
                        post.hasLiked
                          ? 'fill-rose-500 text-rose-500 scale-110'
                          : 'text-neutral-500 group-hover/like:text-rose-500'
                      } ${animatingPostId === post.id ? 'scale-125' : ''}`}
                    />
                    <span
                      className={`text-xs font-mono font-semibold ${
                        post.hasLiked ? 'text-rose-600 font-bold' : 'text-neutral-600'
                      }`}
                    >
                      {post.likesCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActivePost(post)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs font-mono font-semibold text-neutral-600">
                      {post.comments.length}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-neutral-700" />
                <h3 className="font-condensed text-base sm:text-lg font-bold text-neutral-900">
                  {t('comments')} ({activePost.comments.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEditPhotoModal(activePost)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title={t('editPhoto')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(activePost.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t('deletePhoto')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActivePost(null)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activePost.description && (
              <div className="px-6 py-3.5 bg-slate-50/80 border-b border-neutral-100">
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {activePost.description}
                </p>
              </div>
            )}

            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {activePost.comments.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs sm:text-sm">
                  {t('noComments')}
                </div>
              ) : (
                activePost.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-neutral-200/80 flex items-start justify-between gap-3 group/item"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 shrink-0">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">
                            {comment.author}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(comment.created_at).toLocaleDateString(locale === 'si' ? 'si-LK' : 'en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed break-words">
                          {comment.text}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="opacity-80 hover:opacity-100 p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {currentUser ? (
              <form onSubmit={handlePostComment} className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{t('commentingAs')}</span>
                  <strong className="font-semibold text-neutral-900">{currentUser.username}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t('yourComment')}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-800 focus:outline-hidden focus:border-[#003399] focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                  >
                    <span>{t('postComment')}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 sm:p-5 border-t border-neutral-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <p className="text-xs font-bold text-neutral-800">{t('loginPromptTitle')}</p>
                  <p className="text-[11px] text-neutral-500">{t('loginPromptSubtitle')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/${locale}/login`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#003399] hover:bg-[#002266] text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    {t('signInBtn')}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                  >
                    {t('registerBtn')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth required modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-2xl max-w-sm w-full p-6 text-center space-y-5 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-slate-700">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-condensed text-lg font-bold text-neutral-900">
                {t('loginPromptTitle')}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {t('loginPromptSubtitle')}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href={`/${locale}/login`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
              >
                {t('signInBtn')}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-neutral-200 text-neutral-800 text-xs font-semibold flex items-center justify-center transition-colors"
              >
                {t('registerBtn')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Photo Add / Edit Modal for Admin */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#003399]" />
                <h3 className="font-condensed text-lg font-bold text-neutral-900">
                  {editingPost ? t('editPhoto') : t('addPhoto')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {photoError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {photoError}
              </div>
            )}

            <form onSubmit={handleSavePhoto} className="space-y-4">
              {/* Optional Custom Identifier */}
              {!editingPost && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t('photoId')}
                  </label>
                  <input
                    type="text"
                    value={photoCustomId}
                    onChange={e => setPhotoCustomId(e.target.value)}
                    placeholder="e.g. AGM 2026 or leave blank for auto-id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              )}

              {/* Aspect Ratio Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('aspectRatio')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['4:3', '16:9', '1:1', '3:2'].map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setPhotoAspectRatio(ratio)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                        photoAspectRatio === ratio
                          ? 'bg-[#003399] text-white border-[#003399] shadow-xs'
                          : 'bg-slate-50 text-neutral-700 border-neutral-200 hover:bg-slate-100'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('photoDescription')}
                </label>
                <textarea
                  value={photoDescription}
                  onChange={e => setPhotoDescription(e.target.value)}
                  placeholder={t('photoDescriptionPlaceholder')}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399] resize-none"
                />
              </div>

              {/* Image Preview & Upload */}
              <div className="space-y-2 pt-1 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('uploadPhoto')} {!editingPost && '*'}
                </label>

                {photoImagePreview && (
                  <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-neutral-200 flex flex-col items-center justify-center">
                    <div
                      className="relative w-full rounded-xl bg-slate-200 overflow-hidden border border-neutral-300 shadow-xs transition-all duration-300 mx-auto"
                      style={{
                        aspectRatio: getAspectRatioStyle(photoAspectRatio),
                        maxHeight: '260px',
                        maxWidth: photoAspectRatio === '1:1' ? '260px' : photoAspectRatio === '4:3' ? '340px' : photoAspectRatio === '3:2' ? '390px' : '100%'
                      }}
                    >
                      <Image
                        src={photoImagePreview}
                        alt="Photo Preview"
                        fill
                        sizes="(max-width: 640px) 100vw, 448px"
                        className="object-cover transition-all duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                        {photoAspectRatio}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoImageFile(null);
                          setPhotoImagePreview(null);
                          setPhotoImageUrlInput('');
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
                    <span>{t('chooseImage')}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoImageChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={photoImageUrlInput}
                    onChange={e => {
                      setPhotoImageUrlInput(e.target.value);
                      if (e.target.value.trim()) setPhotoImagePreview(e.target.value.trim());
                    }}
                    placeholder={t('imageUrlPlaceholder')}
                    className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-xs text-neutral-900 focus:outline-hidden focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingPhoto || (!editingPost && !photoImageFile && !photoImageUrlInput.trim())}
                  className="px-5 py-2.5 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingPhoto ? 'Saving...' : (editingPost ? t('savePhoto') : t('addPhoto'))}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
