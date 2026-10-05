import { NextRequest, NextResponse } from 'next/server';
import { getBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember } from '@/lib/models/board';
import { supabase } from '@/lib/supabase';
import path from 'path';

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

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const members = await getBoardMembers(false);
    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error('Error fetching admin board members:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch board members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let nameSi = '';
    let nameEn = '';
    let positionSi = '';
    let positionEn = '';
    let qualification = '';
    let phone = '';
    let email = '';
    let address = '';
    let roleType: 'chairman' | 'vice_chairman' | 'director' | 'officer' = 'director';
    let displayOrder = 0;
    let imageSrc = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      nameSi = (formData.get('name_si') as string)?.trim() || '';
      nameEn = (formData.get('name_en') as string)?.trim() || '';
      positionSi = (formData.get('position_si') as string)?.trim() || '';
      positionEn = (formData.get('position_en') as string)?.trim() || '';
      qualification = (formData.get('qualification') as string)?.trim() || '';
      phone = (formData.get('phone') as string)?.trim() || '';
      email = (formData.get('email') as string)?.trim() || '';
      address = (formData.get('address') as string)?.trim() || '';
      roleType = ((formData.get('role_type') as string) || 'director') as any;
      displayOrder = parseInt((formData.get('display_order') as string) || '0', 10);
      imageSrc = (formData.get('image_src') as string)?.trim() || '';

      const photoFile = formData.get('photo') as File | null;
      if (photoFile && photoFile.size > 0) {
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        let ext = path.extname(photoFile.name || '').toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) ext = '.jpg';
        const safeFilename = `board-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
        const storagePath = `board/${safeFilename}`;

        try {
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('uploads')
            .upload(storagePath, buffer, { contentType: photoFile.type || 'image/jpeg', upsert: true });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(storagePath);
            if (pubData?.publicUrl) imageSrc = pubData.publicUrl;
          }
        } catch (e) {
          console.warn('Storage upload error for board photo:', e);
        }
      }
    } else {
      const body = await req.json();
      nameSi = body.name_si?.trim() || '';
      nameEn = body.name_en?.trim() || '';
      positionSi = body.position_si?.trim() || '';
      positionEn = body.position_en?.trim() || '';
      qualification = body.qualification?.trim() || '';
      phone = body.phone?.trim() || '';
      email = body.email?.trim() || '';
      address = body.address?.trim() || '';
      roleType = body.role_type || 'director';
      displayOrder = parseInt(body.display_order || '0', 10);
      imageSrc = body.image_src?.trim() || '';
    }

    if (!nameSi || !nameEn || !positionSi || !positionEn) {
      return NextResponse.json({
        success: false,
        error: 'Name and Position in both Sinhala and English are required'
      }, { status: 400 });
    }

    const newMember = await createBoardMember({
      name_si: nameSi,
      name_en: nameEn,
      position_si: positionSi,
      position_en: positionEn,
      qualification,
      phone,
      email,
      address,
      role_type: roleType,
      display_order: displayOrder,
      image_src: imageSrc || null
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error('Error creating board member:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create board member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let id: number | null = null;
    let nameSi: string | undefined;
    let nameEn: string | undefined;
    let positionSi: string | undefined;
    let positionEn: string | undefined;
    let qualification: string | undefined;
    let phone: string | undefined;
    let email: string | undefined;
    let address: string | undefined;
    let roleType: ('chairman' | 'vice_chairman' | 'director' | 'officer') | undefined;
    let displayOrder: number | undefined;
    let isActive: boolean | undefined;
    let imageSrc: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      id = parseInt((formData.get('id') as string) || '0', 10);
      if (formData.has('name_si')) nameSi = (formData.get('name_si') as string)?.trim();
      if (formData.has('name_en')) nameEn = (formData.get('name_en') as string)?.trim();
      if (formData.has('position_si')) positionSi = (formData.get('position_si') as string)?.trim();
      if (formData.has('position_en')) positionEn = (formData.get('position_en') as string)?.trim();
      if (formData.has('qualification')) qualification = (formData.get('qualification') as string)?.trim();
      if (formData.has('phone')) phone = (formData.get('phone') as string)?.trim();
      if (formData.has('email')) email = (formData.get('email') as string)?.trim();
      if (formData.has('address')) address = (formData.get('address') as string)?.trim();
      if (formData.has('role_type')) roleType = (formData.get('role_type') as string) as any;
      if (formData.has('display_order')) displayOrder = parseInt((formData.get('display_order') as string) || '0', 10);
      if (formData.has('is_active')) isActive = formData.get('is_active') === 'true';
      if (formData.has('image_src')) imageSrc = (formData.get('image_src') as string)?.trim();

      const photoFile = formData.get('photo') as File | null;
      if (photoFile && photoFile.size > 0) {
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        let ext = path.extname(photoFile.name || '').toLowerCase();
        if (!ext || !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) ext = '.jpg';
        const safeFilename = `board-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
        const storagePath = `board/${safeFilename}`;

        try {
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('uploads')
            .upload(storagePath, buffer, { contentType: photoFile.type || 'image/jpeg', upsert: true });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(storagePath);
            if (pubData?.publicUrl) imageSrc = pubData.publicUrl;
          }
        } catch (e) {
          console.warn('Storage upload error for board photo:', e);
        }
      }
    } else {
      const body = await req.json();
      id = body.id ? parseInt(String(body.id), 10) : null;
      nameSi = body.name_si;
      nameEn = body.name_en;
      positionSi = body.position_si;
      positionEn = body.position_en;
      qualification = body.qualification;
      phone = body.phone;
      email = body.email;
      address = body.address;
      roleType = body.role_type;
      displayOrder = body.display_order !== undefined ? parseInt(String(body.display_order), 10) : undefined;
      isActive = body.is_active;
      imageSrc = body.image_src;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Valid board member ID is required' }, { status: 400 });
    }

    const updated = await updateBoardMember(id, {
      name_si: nameSi,
      name_en: nameEn,
      position_si: positionSi,
      position_en: positionEn,
      qualification,
      phone,
      email,
      address,
      role_type: roleType,
      display_order: displayOrder,
      is_active: isActive,
      image_src: imageSrc
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Board member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error('Error updating board member:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update board member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Board member ID is required' }, { status: 400 });
    }

    const ok = await deleteBoardMember(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to delete board member' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Board member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting board member:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete board member' }, { status: 500 });
  }
}
