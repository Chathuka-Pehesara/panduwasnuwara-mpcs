import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUser, deleteUser } from '@/lib/models/user';

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

// GET: list all users
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT: edit and save user details
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, fullName, nic, phone, role, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updated = await updateUser(Number(id), {
      fullName,
      nic,
      phone,
      role,
      password: password ? password.trim() : undefined
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

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
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
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
