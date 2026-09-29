import { NextRequest, NextResponse } from 'next/server';
import { createInquiry, getInquiries, getInquiryCategoryCounts } from '@/lib/models/inquiry';
import { findUserByNicOrUsername } from '@/lib/models/user';
import { sendContactNotificationEmail } from '@/lib/email';

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
    const body = await req.json();
    const { business_key, business_name, user_name, phone, email, subject, message } = body;

    if (!business_key || !user_name || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields (Name, Phone, Subject, Message).' },
        { status: 400 }
      );
    }

    // Check if user is authenticated to attach user_id
    const userToken = req.cookies.get('mpcs_auth_token')?.value || req.cookies.get('mpcs_admin_token')?.value;
    const auth = getAuthFromToken(userToken);
    let userId: number | null = null;
    if (auth?.username) {
      const dbUser = await findUserByNicOrUsername(auth.username);
      if (dbUser?.id) {
        userId = dbUser.id;
      }
    }

    const inquiry = await createInquiry({
      business_key: business_key.trim(),
      business_name: business_name?.trim() || business_key.trim(),
      user_id: userId,
      user_name: user_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      subject: subject.trim(),
      message: message.trim()
    });

    // Trigger email notification to destination emails configured in Admin Panel
    sendContactNotificationEmail({
      name: user_name.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      businessName: business_name?.trim()
    }).catch(err => {
      console.error('Background email dispatch error:', err);
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
    const auth = getAuthFromToken(adminToken);

    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessKey = searchParams.get('businessKey') || 'all';
    const status = searchParams.get('status') || 'all';

    const inquiries = await getInquiries(businessKey, status);
    const categoryCounts = await getInquiryCategoryCounts();

    return NextResponse.json({
      success: true,
      inquiries,
      categoryCounts
    });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
