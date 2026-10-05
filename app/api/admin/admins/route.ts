import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins, createAdminUser, updateUser, deleteUser, findUserById } from '@/lib/models/user';

function getAuth(req: NextRequest): { username: string; role: string; isSuperAdmin: boolean } | null {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return null;
  try {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const role = parts[2];
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

// GET: list all administrator accounts (Super Admin only)
export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
  }

  try {
    const admins = await getAllAdmins();
    return NextResponse.json({ success: true, admins });
  } catch (err) {
    console.error('Error fetching admins:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch administrator accounts' }, { status: 500 });
  }
}

// POST: create a new administrator account (Super Admin only)
export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, fullName, nic, phone, password, email, role } = body;

    const cleanUsername = (username || nic || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();
    const cleanNic = (nic || '').trim().toUpperCase();
    const cleanPhone = (phone || '').trim();
    const cleanPassword = (password || '').trim();
    const targetRole = role === 'superadmin' ? 'superadmin' : 'admin';

    if (!cleanUsername || !cleanName || !cleanPassword) {
      return NextResponse.json({ success: false, error: 'Username, Full Name, and Password are required' }, { status: 400 });
    }

    if (cleanPassword.length < 5) {
      return NextResponse.json({ success: false, error: 'Password must be at least 5 characters' }, { status: 400 });
    }

    const newAdmin = await createAdminUser({
      username: cleanUsername,
      fullName: cleanName,
      nic: cleanNic || cleanUsername.toUpperCase(),
      phone: cleanPhone || '0372291012',
      password: cleanPassword,
      email: (email || '').trim() || undefined,
      role: targetRole
    });

    return NextResponse.json({ success: true, message: 'Administrator created successfully', admin: newAdmin });
  } catch (err: unknown) {
    console.error('Error creating admin:', err);
    const pgErr = err as { code?: string; message?: string };
    if (pgErr.code === '23505' || pgErr.message?.includes('duplicate key')) {
      return NextResponse.json({ success: false, error: 'An account with this username or NIC already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: pgErr.message || 'Failed to create administrator' }, { status: 500 });
  }
}

// PUT: update administrator credentials / permissions (Super Admin only)
export async function PUT(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, fullName, nic, phone, password, role } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Admin user ID required' }, { status: 400 });
    }

    const targetUser = await findUserById(Number(id));
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Admin account not found' }, { status: 404 });
    }

    // Safety: prevent demoting the root superadmin
    if (targetUser.username.toLowerCase() === 'superadmin' && role && role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Cannot demote the primary Super Administrator' }, { status: 400 });
    }

    const updated = await updateUser(Number(id), {
      fullName,
      nic,
      phone,
      password: password && password.trim().length > 0 ? password.trim() : undefined,
      role: role ? (role === 'superadmin' ? 'superadmin' : 'admin') : undefined
    });

    return NextResponse.json({ success: true, message: 'Admin updated successfully', admin: updated });
  } catch (err: unknown) {
    console.error('Error updating admin:', err);
    return NextResponse.json({ success: false, error: 'Failed to update administrator' }, { status: 500 });
  }
}

// DELETE: revoke / remove administrator (Super Admin only)
export async function DELETE(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isSuperAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Admin user ID is required' }, { status: 400 });
    }

    const targetUser = await findUserById(Number(id));
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Admin account not found' }, { status: 404 });
    }

    // Safety: cannot delete self or root superadmin
    if (targetUser.username.toLowerCase() === auth.username.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own Super Admin account' }, { status: 400 });
    }
    if (targetUser.username.toLowerCase() === 'superadmin') {
      return NextResponse.json({ success: false, error: 'Cannot delete the primary Super Administrator account' }, { status: 400 });
    }

    const success = await deleteUser(Number(id));
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to delete administrator' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Administrator account deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete administrator' }, { status: 500 });
  }
}
