import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
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

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('logo') || formData.get('image')) as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    let ext = path.extname(file.name || '').toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico'];
    if (!allowedExts.includes(ext)) {
      ext = '.png';
    }

    // Clean base name for readability
    const rawBase = path.basename(file.name || 'logo', path.extname(file.name || ''))
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 30);

    const safeFilename = `${rawBase || 'logo'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
    const uploadType = ((formData.get('type') as string) || '').toLowerCase();
    const subfolder = (uploadType === 'cover' || uploadType === 'covers') ? 'covers' : 'logos';
    const storagePath = `${subfolder}/${safeFilename}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let publicUrl = '';

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
          publicUrl = pubData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload error:', storageErr);
    }

    // 2. Fallback to local or data URL
    if (!publicUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
        await fs.mkdir(uploadDir, { recursive: true });
        const targetPath = path.join(uploadDir, safeFilename);
        await fs.writeFile(targetPath, buffer);
        publicUrl = `/uploads/${subfolder}/${safeFilename}`;
      } catch (fsErr) {
        const mimeType = file.type || 'image/jpeg';
        publicUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}
