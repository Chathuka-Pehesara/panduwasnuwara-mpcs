import { NextResponse } from 'next/server';
import { getMemberFiles } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

export async function GET() {
  try {
    await initDatabaseSchema();
    const files = await getMemberFiles();

    return NextResponse.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Error fetching member files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member files' },
      { status: 500 }
    );
  }
}
