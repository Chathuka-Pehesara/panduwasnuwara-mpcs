import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return false;
  try {
    const parts = token.split('_');
    return parts.length >= 3 && parts[2] === 'admin';
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
    const file = (formData.get('file') || formData.get('cover') || formData.get('image')) as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No cover image file provided' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Cover photo exceeds 15MB limit' }, { status: 400 });
    }

    let ext = path.extname(file.name || '').toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    if (!allowedExts.includes(ext)) {
      ext = '.jpg';
    }

    const rawBase = path.basename(file.name || 'cover', path.extname(file.name || ''))
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 30);

    const safeFilename = `${rawBase || 'cover'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers');

    await fs.mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const targetPath = path.join(uploadDir, safeFilename);

    await fs.writeFile(targetPath, buffer);

    const publicUrl = `/uploads/covers/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    });
  } catch (error: any) {
    console.error('Error uploading cover photo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload cover photo' },
      { status: 500 }
    );
  }
}
