import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUser, deleteUser, findUserById } from '@/lib/models/user';

function getAuth(req: NextRequest): { username: string; role: string; isAdmin: boolean; isSuperAdmin: boolean } | null {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return null;
  try {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const role = parts[2];
      const isSuperAdmin = role === 'superadmin' || username.toLowerCase() === 'superadmin';
      const isAdmin = isSuperAdmin || role === 'admin';
      return { username, role, isAdmin, isSuperAdmin };
    }
  } catch {
    return null;
  }
  return null;
}

// GET: list users
// Regular admin: manages user accounts only.
// Super admin: manages both admin and user accounts.
export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allUsers = await getAllUsers();
    // Regular admin sees & manages user accounts only
    const users = auth.isSuperAdmin
      ? allUsers
      : allUsers.filter(u => u.role !== 'admin' && u.role !== 'superadmin');

    return NextResponse.json({ 
      success: true, 
      users,
      isSuperAdmin: auth.isSuperAdmin
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT: edit and save user details
// Regular admin: can edit user accounts only. Cannot modify admin accounts or elevate roles.
// Super admin: can edit both user and admin accounts.
export async function PUT(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, fullName, nic, phone, role, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await findUserById(Number(id));
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isTargetAdmin = targetUser.role === 'admin' || targetUser.role === 'superadmin';

    // Regular admin can manage user accounts ONLY
    if (!auth.isSuperAdmin) {
      if (isTargetAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized: Regular administrators can manage user accounts only'
        }, { status: 403 });
      }

      if (role && (role === 'admin' || role === 'superadmin')) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized: Only Super Administrators can assign administrator roles'
        }, { status: 403 });
      }
    }

    // Safety: prevent demoting root superadmin
    if (targetUser.username.toLowerCase() === 'superadmin' && role && role !== 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'The root Super Administrator role cannot be changed'
      }, { status: 400 });
    }

    const updated = await updateUser(Number(id), {
      fullName,
      nic,
      phone,
      role: auth.isSuperAdmin ? (role || targetUser.role) : 'user',
      password: (!isTargetAdmin && password) ? password.trim() : (auth.isSuperAdmin && password ? password.trim() : undefined)
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: unknown) {
    console.error('Error updating user:', err);
    const pgError = err as { code?: string };
    if (pgError.code === '23505') {
      return NextResponse.json({ success: false, error: 'A user with this NIC or Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: remove user
// Regular admin: can delete user accounts only.
// Super admin: can delete user and admin accounts (except root superadmin).
export async function DELETE(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || !auth.isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await findUserById(Number(id));
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isTargetAdmin = targetUser.role === 'admin' || targetUser.role === 'superadmin';

    // Regular admin can delete user accounts ONLY
    if (!auth.isSuperAdmin && isTargetAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Regular administrators can manage user accounts only'
      }, { status: 403 });
    }

    // Safety: root superadmin cannot be deleted
    if (targetUser.username.toLowerCase() === 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'The root Super Administrator account cannot be deleted'
      }, { status: 400 });
    }

    const success = await deleteUser(Number(id));
    if (!success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
