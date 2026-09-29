import { NextResponse } from 'next/server';
import { getLiveStats } from '@/lib/models/stats';

export async function GET() {
  try {
    const stats = await getLiveStats();
    return NextResponse.json({
      success: true,
      stats
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err) {
    console.error('Error fetching live stats:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live stats' },
      { status: 500 }
    );
  }
}
