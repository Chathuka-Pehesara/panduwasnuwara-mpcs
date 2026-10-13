import { NextRequest } from 'next/server';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { findUserByNicOrUsername } from '@/lib/models/user';

export interface AuthContext {
  userId?: string | number;
  username: string;
  email?: string;
  role: 'admin' | 'user' | 'superadmin';
  isAdmin: boolean;
  isSuperAdmin: boolean;
  supabaseUser?: any;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mmwnicmrwrjxklcoujqh.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Singleton Supabase Auth Client for Token Verification
const supabase = supabaseAnonKey
  ? createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;

/**
 * Extracts Bearer token from request Authorization header or fallback cookies.
 */
export function extractAuthToken(req: NextRequest): string | null {
  // 1. Prioritize Authorization header (Bearer token)
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Fallback to Supabase auth cookie or legacy admin/auth tokens for backward compatibility
  return (
    req.cookies.get('sb-access-token')?.value ||
    req.cookies.get('mpcs_admin_token')?.value ||
    req.cookies.get('mpcs_auth_token')?.value ||
    req.cookies.get('auth_token')?.value ||
    null
  );
}

/**
 * Centralized authentication verifier for Route Handlers and Server Actions.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const token = extractAuthToken(req);
  if (!token) return null;

  try {
    // 1. Try Supabase Auth JWT verification if Supabase SDK is configured
    if (supabase && token.includes('.') && token.split('.').length === 3) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        const isSuper = user.app_metadata?.role === 'superadmin' || user.user_metadata?.role === 'superadmin';
        const isAdmin = isSuper || user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
        const role = (isSuper ? 'superadmin' : (isAdmin ? 'admin' : 'user')) as 'admin' | 'user' | 'superadmin';

        return {
          userId: user.id,
          username: user.email || user.user_metadata?.username || user.id,
          email: user.email,
          role,
          isAdmin,
          isSuperAdmin: isSuper,
          supabaseUser: user
        };
      }
    }

    // 2. Legacy token fallback (session_username_role_timestamp_random)
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const tokenRole = parts[2];
      const dbUser = await findUserByNicOrUsername(username);

      const isRootSuper = username.toLowerCase() === 'superadmin';
      const effectiveRole = dbUser?.role || tokenRole;
      const isSuper = isRootSuper || effectiveRole === 'superadmin' || tokenRole === 'superadmin';
      const isAdmin = isSuper || effectiveRole === 'admin' || tokenRole === 'admin';
      const role = (isSuper ? 'superadmin' : (isAdmin ? 'admin' : 'user')) as 'admin' | 'user' | 'superadmin';

      return {
        userId: dbUser?.id,
        username,
        email: dbUser?.email || undefined,
        role,
        isAdmin,
        isSuperAdmin: isSuper
      };
    }
  } catch (err) {
    console.error('Error verifying auth token:', err);
  }

  return null;
}

/**
 * Quick admin verification helper.
 */
export async function requireAdmin(req: NextRequest): Promise<{ auth: AuthContext | null; errorResponse?: Response }> {
  const auth = await getAuthContext(req);
  if (!auth || !auth.isAdmin) {
    return {
      auth: null,
      errorResponse: Response.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 })
    };
  }
  return { auth };
}

/**
 * Super admin verification helper.
 */
export async function requireSuperAdmin(req: NextRequest): Promise<{ auth: AuthContext | null; errorResponse?: Response }> {
  const auth = await getAuthContext(req);
  if (!auth || !auth.isSuperAdmin) {
    return {
      auth: null,
      errorResponse: Response.json({ success: false, error: 'Unauthorized: Super Admin privileges required' }, { status: 403 })
    };
  }
  return { auth };
}
