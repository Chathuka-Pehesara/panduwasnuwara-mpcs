import { NextRequest, NextResponse } from 'next/server';
import { recordGuestPing, getActiveGuestCount } from '@/lib/models/guestSession';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body?.sessionId;
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    const count = await recordGuestPing(sessionId);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error in active-guests ping:', error);
    return NextResponse.json({ success: false, count: 1 });
  }
}

export async function GET() {
  try {
    const count = await getActiveGuestCount();
    return NextResponse.json({ 
      success: true, 
      count 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching active-guests count:', error);
    return NextResponse.json({ success: false, count: 0 });
  }
}
