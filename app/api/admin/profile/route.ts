import { NextRequest, NextResponse } from 'next/server';
import { findUserByNicOrUsername, updateUser, findUserById } from '@/lib/models/user';
import { supabase } from '@/lib/supabase';

function getAuth(req: NextRequest): { username: string; role: string; isSuperAdmin: boolean } | null {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return null;
  try {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const role = parts[2];
      const isAdmin = role === 'admin' || role === 'superadmin';
      if (!isAdmin) return null;
      return {
        username,
        role,
        isSuperAdmin: role === 'superadmin'
      };
    }
  } catch {
    return null;
  }
  return null;
}

// GET: retrieve current logged-in admin's profile
export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const user = await findUserByNicOrUsername(auth.username);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        fullName: user.full_name || user.username,
        nic: user.nic || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching admin profile:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT: update current logged-in admin's profile or change password
export async function PUT(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const user = await findUserByNicOrUsername(auth.username);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    const body = await req.json();
    const { fullName, nic, phone, email, currentPassword, newPassword } = body;

    // Handle password change request
    if (newPassword && typeof newPassword === 'string' && newPassword.trim().length > 0) {
      const cleanNewPassword = newPassword.trim();
      const cleanCurrentPassword = (currentPassword || '').trim();

      if (!cleanCurrentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      if (cleanNewPassword.length < 5) {
        return NextResponse.json({ success: false, error: 'New password must be at least 5 characters long.' }, { status: 400 });
      }

      // Verify current password
      const actualPassword = user.password || '';
      if (actualPassword && actualPassword !== cleanCurrentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
      }

      // Update password in users table and sync to admin_users
      await updateUser(user.id, {
        password: cleanNewPassword
      });

      // Also ensure admin_users has updated password
      try {
        await supabase.from('admin_users').upsert({
          username: user.username,
          password: cleanNewPassword,
          role: user.role
        });
      } catch (syncErr) {
        console.error('Error syncing password to admin_users:', syncErr);
      }
    }

    // Handle personal details update
    const detailsUpdates: {
      fullName?: string;
      nic?: string;
      phone?: string;
      email?: string;
    } = {};

    if (fullName !== undefined) detailsUpdates.fullName = String(fullName).trim();
    if (nic !== undefined) detailsUpdates.nic = String(nic).trim().toUpperCase();
    if (phone !== undefined) detailsUpdates.phone = String(phone).trim();

    if (Object.keys(detailsUpdates).length > 0 || email !== undefined) {
      const dbUpdates: Record<string, unknown> = {};
      if (detailsUpdates.fullName) dbUpdates.full_name = detailsUpdates.fullName;
      if (detailsUpdates.nic) dbUpdates.nic = detailsUpdates.nic;
      if (detailsUpdates.phone !== undefined) dbUpdates.phone = detailsUpdates.phone;
      if (email !== undefined) dbUpdates.email = String(email).trim() || null;

      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('users').update(dbUpdates).eq('id', user.id);
      }
    }

    const updatedUser = await findUserById(user.id);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser ? {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.full_name || updatedUser.username,
        nic: updatedUser.nic || '',
        phone: updatedUser.phone || '',
        email: updatedUser.email || '',
        role: updatedUser.role,
        createdAt: updatedUser.created_at
      } : null
    });
  } catch (err: unknown) {
    console.error('Error updating admin profile:', err);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
