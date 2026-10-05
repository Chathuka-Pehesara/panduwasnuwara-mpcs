import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { 
  getNewsAnnouncements, 
  createNewsAnnouncement, 
  updateNewsAnnouncement, 
  deleteNewsAnnouncement,
  getNewsById
} from '@/lib/models/news';
import { initDatabaseSchema } from '@/lib/db/schema';
import { supabase } from '@/lib/supabase';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return false;
  try {
    const parts = token.split('_');
    return parts.length >= 3 && (parts[2] === 'admin' || parts[2] === 'superadmin');
  } catch {
    return false;
  }
}

// GET all news announcements (published and drafts)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const news = await getNewsAnnouncements(false);
    return NextResponse.json({ success: true, news });
  } catch (err) {
    console.error('Failed to get news for admin:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST create news announcement with optional image upload
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const contentType = req.headers.get('content-type') || '';

    let titleSi = '';
    let titleEn = '';
    let descriptionSi = '';
    let descriptionEn = '';
    let category = 'general';
    let badgeTextSi: string | null = null;
    let badgeTextEn: string | null = null;
    let isPinned = false;
    let isPublished = true;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      titleSi = (formData.get('title_si') as string) || '';
      titleEn = (formData.get('title_en') as string) || '';
      descriptionSi = (formData.get('description_si') as string) || '';
      descriptionEn = (formData.get('description_en') as string) || '';
      category = (formData.get('category') as string) || 'general';
      badgeTextSi = (formData.get('badge_text_si') as string) || null;
      badgeTextEn = (formData.get('badge_text_en') as string) || null;
      isPinned = formData.get('is_pinned') === 'true' || formData.get('is_pinned') === '1';
      isPublished = formData.get('is_published') !== 'false' && formData.get('is_published') !== '0';
      
      const directImageUrl = formData.get('image_url') as string;
      if (directImageUrl && directImageUrl.trim()) {
        imageUrl = directImageUrl.trim();
      }

      const file = formData.get('image') as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize file extension
        let ext = path.extname(file.name || '').toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
          ext = '.jpg';
        }

        const safeFilename = `news-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const storagePath = `news/${safeFilename}`;
        
        // 1. Try Supabase Storage
        try {
          const mimeType = file.type || 'image/jpeg';
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('uploads')
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage
              .from('uploads')
              .getPublicUrl(storagePath);
            if (pubData?.publicUrl) {
              imageUrl = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase news storage error:', storageErr);
        }

        // 2. Fallback to local or data URL
        if (!imageUrl) {
          try {
            const uploadDir = path.join(process.cwd(), 'public', 'images', 'news');
            await fs.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, safeFilename);
            await fs.writeFile(filePath, buffer);
            imageUrl = `/images/news/${safeFilename}`;
          } catch (fsErr) {
            const mimeType = file.type || 'image/jpeg';
            imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      }
    } else {
      const body = await req.json();
      titleSi = body.title_si || '';
      titleEn = body.title_en || '';
      descriptionSi = body.description_si || '';
      descriptionEn = body.description_en || '';
      category = body.category || 'general';
      badgeTextSi = body.badge_text_si || null;
      badgeTextEn = body.badge_text_en || null;
      isPinned = Boolean(body.is_pinned);
      isPublished = body.is_published !== false;
      imageUrl = body.image_url || null;
    }

    // Graceful language fallbacks so single-language submissions work cleanly
    if (!titleSi && titleEn) titleSi = titleEn;
    if (!titleEn && titleSi) titleEn = titleSi;
    if (!descriptionSi && descriptionEn) descriptionSi = descriptionEn;
    if (!descriptionEn && descriptionSi) descriptionEn = descriptionSi;

    if (!titleSi && !titleEn) {
      return NextResponse.json({ success: false, error: 'Headline / Title is required' }, { status: 400 });
    }

    if (!descriptionSi && !descriptionEn) {
      return NextResponse.json({ success: false, error: 'Description text is required' }, { status: 400 });
    }

    const created = await createNewsAnnouncement({
      title_si: titleSi,
      title_en: titleEn,
      description_si: descriptionSi,
      description_en: descriptionEn,
      image_url: imageUrl,
      category,
      badge_text_si: badgeTextSi,
      badge_text_en: badgeTextEn,
      is_pinned: isPinned,
      is_published: isPublished
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement published successfully',
      announcement: created
    });
  } catch (err) {
    console.error('Failed to create announcement:', err);
    return NextResponse.json({ success: false, error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT update news announcement
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const contentType = req.headers.get('content-type') || '';

    let id: number | null = null;
    let titleSi: string | undefined;
    let titleEn: string | undefined;
    let descriptionSi: string | undefined;
    let descriptionEn: string | undefined;
    let category: string | undefined;
    let badgeTextSi: string | null | undefined;
    let badgeTextEn: string | null | undefined;
    let isPinned: boolean | undefined;
    let isPublished: boolean | undefined;
    let imageUrl: string | null | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const rawId = formData.get('id') as string;
      id = rawId ? parseInt(rawId, 10) : null;
      
      if (formData.has('title_si')) titleSi = (formData.get('title_si') as string) || '';
      if (formData.has('title_en')) titleEn = (formData.get('title_en') as string) || '';
      if (formData.has('description_si')) descriptionSi = (formData.get('description_si') as string) || '';
      if (formData.has('description_en')) descriptionEn = (formData.get('description_en') as string) || '';
      if (formData.has('category')) category = (formData.get('category') as string) || 'general';
      if (formData.has('badge_text_si')) badgeTextSi = (formData.get('badge_text_si') as string) || null;
      if (formData.has('badge_text_en')) badgeTextEn = (formData.get('badge_text_en') as string) || null;
      if (formData.has('is_pinned')) isPinned = formData.get('is_pinned') === 'true';
      if (formData.has('is_published')) isPublished = formData.get('is_published') === 'true';

      const directImageUrl = formData.get('image_url') as string;
      if (directImageUrl !== null && directImageUrl !== undefined) {
        imageUrl = directImageUrl.trim() || null;
      }

      const file = formData.get('image') as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let ext = path.extname(file.name || '').toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
          ext = '.jpg';
        }

        const safeFilename = `news-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const storagePath = `news/${safeFilename}`;
        
        // 1. Try Supabase Storage
        try {
          const mimeType = file.type || 'image/jpeg';
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('uploads')
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage
              .from('uploads')
              .getPublicUrl(storagePath);
            if (pubData?.publicUrl) {
              imageUrl = pubData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase news storage error:', storageErr);
        }

        // 2. Fallback to local or data URL
        if (!imageUrl) {
          try {
            const uploadDir = path.join(process.cwd(), 'public', 'images', 'news');
            await fs.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, safeFilename);
            await fs.writeFile(filePath, buffer);
            imageUrl = `/images/news/${safeFilename}`;
          } catch (fsErr) {
            const mimeType = file.type || 'image/jpeg';
            imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
          }
        }
      }
    } else {
      const body = await req.json();
      id = body.id ? parseInt(String(body.id), 10) : null;
      titleSi = body.title_si;
      titleEn = body.title_en;
      descriptionSi = body.description_si;
      descriptionEn = body.description_en;
      category = body.category;
      badgeTextSi = body.badge_text_si;
      badgeTextEn = body.badge_text_en;
      isPinned = body.is_pinned;
      isPublished = body.is_published;
      imageUrl = body.image_url;
    }

    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Valid announcement ID is required' }, { status: 400 });
    }

    const updated = await updateNewsAnnouncement(id, {
      title_si: titleSi,
      title_en: titleEn,
      description_si: descriptionSi,
      description_en: descriptionEn,
      category,
      badge_text_si: badgeTextSi,
      badge_text_en: badgeTextEn,
      is_pinned: isPinned,
      is_published: isPublished,
      image_url: imageUrl
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: updated
    });
  } catch (err) {
    console.error('Failed to update announcement:', err);
    return NextResponse.json({ success: false, error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE news announcement
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    let id = url.searchParams.get('id') ? parseInt(url.searchParams.get('id')!, 10) : null;

    if (!id) {
      try {
        const body = await req.json();
        if (body.id) id = parseInt(String(body.id), 10);
      } catch {
        // Body was empty or not JSON
      }
    }

    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Announcement ID is required' }, { status: 400 });
    }

    // Check existing item to optionally clean up uploaded file
    const existing = await getNewsById(id);
    if (existing?.image_url && existing.image_url.startsWith('/images/news/')) {
      const localFilePath = path.join(process.cwd(), 'public', existing.image_url.replace(/^\//, ''));
      try {
        await fs.unlink(localFilePath);
      } catch {
        // Ignore file delete errors if already missing
      }
    }

    const success = await deleteNewsAnnouncement(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Announcement not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (err) {
    console.error('Failed to delete announcement:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete announcement' }, { status: 500 });
  }
}
