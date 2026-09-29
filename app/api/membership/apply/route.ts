import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { createMembershipApplication } from '@/lib/models/membershipApplication';
import { findUserByNicOrUsername } from '@/lib/models/user';
import { initDatabaseSchema } from '@/lib/db/schema';

function getAuthFromToken(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const role = parts[2];
      return { username, role, isAdmin: role === 'admin' };
    }
  } catch (err) {
    console.error('Error parsing token:', err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    await initDatabaseSchema();

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const fullNameSi = (formData.get('full_name_si') as string)?.trim() || '';
    const fullNameEn = (formData.get('full_name_en') as string)?.trim() || '';
    const address = (formData.get('address') as string)?.trim() || '';
    const postalAddress = (formData.get('postal_address') as string)?.trim() || '';
    const nic = (formData.get('nic') as string)?.trim()?.toUpperCase() || '';
    const phone = (formData.get('phone') as string)?.trim() || '';
    const email = (formData.get('email') as string)?.trim() || null;
    const photoFile = formData.get('certified_form_photo') as File | null;

    // Validate required fields
    if (!fullNameSi || !fullNameEn || !address || !postalAddress || !nic || !phone) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    if (!photoFile || photoFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Photo of the certified rubber-stamped application form is required.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (photoFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit (10MB).' },
        { status: 400 }
      );
    }

    // Save certified form photo
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = path.extname(photoFile.name || '').toLowerCase();
    if (!ext || !['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) {
      ext = '.jpg';
    }

    const safeFilename = `app-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'membership-applications');

    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, buffer);

    const certifiedFormPhotoUrl = `/uploads/membership-applications/${safeFilename}`;

    // Check if user is logged in
    const token = req.cookies.get('mpcs_auth_token')?.value || req.cookies.get('mpcs_admin_token')?.value;
    const auth = getAuthFromToken(token);
    let userId: number | null = null;
    if (auth?.username) {
      const user = await findUserByNicOrUsername(auth.username);
      if (user?.id) {
        userId = user.id;
      }
    }

    const application = await createMembershipApplication({
      user_id: userId,
      full_name_si: fullNameSi,
      full_name_en: fullNameEn,
      address,
      postal_address: postalAddress,
      nic,
      phone,
      email,
      certified_form_photo: certifiedFormPhotoUrl
    });

    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error submitting membership application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit membership application. Please try again.' },
      { status: 500 }
    );
  }
}
