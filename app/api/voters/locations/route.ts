import { NextResponse } from 'next/server';
import { getVoterFiles } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

export async function GET() {
  try {
    await initDatabaseSchema();
    const files = await getVoterFiles();

    return NextResponse.json({
      success: true,
      files,
      locations: files.map(f => ({ location: f.displayName, fileName: f.fileName, count: f.count }))
    });
  } catch (error) {
    console.error('Error fetching voter files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voter files' },
      { status: 500 }
    );
  }
}
