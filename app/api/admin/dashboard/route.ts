import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getActiveGuestCount } from '@/lib/models/guestSession';

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

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch all dashboard counts concurrently with Supabase SDK
    const [
      activeGuests,
      usersRes,
      membersRes,
      votersRes,
      pendingAppsRes,
      totalAppsRes,
      unreadInquiriesRes,
      latestAppsRes,
      latestMessagesRes
    ] = await Promise.all([
      getActiveGuestCount(),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('imported_members').select('*', { count: 'exact', head: true }),
      supabase.from('eligible_voters').select('*', { count: 'exact', head: true }),
      supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('membership_applications').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
      supabase.from('membership_applications').select('id, full_name_si, full_name_en, nic, phone, email, status, created_at, updated_at').order('updated_at', { ascending: false }).limit(5),
      supabase.from('inquiries').select('id, business_key, business_name, user_name, phone, email, subject, message, status, created_at, updated_at').order('updated_at', { ascending: false }).limit(5)
    ]);

    const registeredUsers = usersRes.count || 0;
    const membersCount = membersRes.count || 0;
    const votersCount = votersRes.count || 0;
    const pendingApplications = pendingAppsRes.count || 0;
    const totalApplications = totalAppsRes.count || 0;
    const unreadMessages = unreadInquiriesRes.count || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        activeGuests,
        registeredUsers,
        membersCount,
        votersCount,
        pendingApplications,
        totalApplications,
        unreadMessages
      },
      latestApplications: latestAppsRes.data || [],
      latestMessages: latestMessagesRes.data || [],
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard overview data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
