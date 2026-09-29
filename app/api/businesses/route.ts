import { NextResponse } from 'next/server';
import { getAllBusinesses } from '@/lib/models/business';

export async function GET() {
  try {
    const businesses = await getAllBusinesses(true);
    return NextResponse.json({
      success: true,
      businesses
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}
