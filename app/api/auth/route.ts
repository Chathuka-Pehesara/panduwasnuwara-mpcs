import { NextRequest, NextResponse } from 'next/server';
import { findUserByNicOrUsername, createUser } from '@/lib/models/user';
import { getRecoveryWhatsAppNumber } from '@/lib/models/setting';

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

export async function GET(req: NextRequest) {
  const token = req.cookies.get('mpcs_auth_token')?.value || req.cookies.get('mpcs_admin_token')?.value;
  const auth = getAuthFromToken(token);
  const recoveryWhatsAppNumber = await getRecoveryWhatsAppNumber();

  if (!auth) {
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      recoveryWhatsAppNumber
    });
  }

  const user = await findUserByNicOrUsername(auth.username);

  return NextResponse.json({
    isAuthenticated: true,
    isAdmin: auth.isAdmin,
    user: user ? {
      id: user.id,
      username: user.username,
      fullName: user.full_name || user.username,
      nic: user.nic || user.username,
      phone: user.phone || '',
      email: user.email || '',
      role: user.role
    } : {
      username: auth.username,
      fullName: auth.username,
      nic: auth.username,
      phone: '',
      email: '',
      role: auth.role
    },
    recoveryWhatsAppNumber
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out' });
      response.cookies.delete('mpcs_auth_token');
      response.cookies.delete('mpcs_admin_token');
      return response;
    }

    // Register
    if (action === 'register') {
      const { fullName, nic, phone, password, email } = body;
      const cleanName = (fullName || '').trim();
      const cleanNic = (nic || '').trim();
      const cleanPhone = (phone || '').trim();
      const cleanPassword = (password || '').trim();

      if (!cleanName || !cleanNic || !cleanPhone || !cleanPassword) {
        return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
      }

      if (cleanName.length < 2) {
        return NextResponse.json({ success: false, error: 'Full name is too short' }, { status: 400 });
      }

      if (cleanNic.length < 5) {
        return NextResponse.json({ success: false, error: 'Valid NIC number is required' }, { status: 400 });
      }

      if (cleanPhone.length < 9) {
        return NextResponse.json({ success: false, error: 'Valid phone number is required' }, { status: 400 });
      }

      if (cleanPassword.length < 4) {
        return NextResponse.json({ success: false, error: 'Password must be at least 4 characters' }, { status: 400 });
      }

      // Check if user already exists
      const existing = await findUserByNicOrUsername(cleanNic);
      if (existing) {
        return NextResponse.json({ success: false, error: 'An account with this NIC already exists' }, { status: 409 });
      }

      const newUser = await createUser({
        fullName: cleanName,
        nic: cleanNic,
        phone: cleanPhone,
        password: cleanPassword,
        email: (email || '').trim() || undefined
      });

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.full_name,
          nic: newUser.nic,
          phone: newUser.phone,
          role: newUser.role,
          isAdmin: false
        }
      });
    }

    // Login
    const { nic, username, password } = body;
    const identifier = (nic || username || '').trim();
    const cleanPassword = (password || '').trim();

    if (!identifier || !cleanPassword) {
      return NextResponse.json({ success: false, error: 'NIC and password required' }, { status: 400 });
    }

    const foundUser = await findUserByNicOrUsername(identifier);

    if (!foundUser || foundUser.password !== cleanPassword) {
      return NextResponse.json({ success: false, error: 'Invalid NIC or password' }, { status: 401 });
    }

    const isAdmin = foundUser.role === 'admin';
    const token = `session_${encodeURIComponent(foundUser.username)}_${foundUser.role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        username: foundUser.username,
        fullName: foundUser.full_name || foundUser.username,
        nic: foundUser.nic || foundUser.username,
        phone: foundUser.phone || '',
        role: foundUser.role,
        isAdmin
      }
    });

    response.cookies.set({
      name: isAdmin ? 'mpcs_admin_token' : 'mpcs_auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (err) {
    console.error('Auth handler error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
