import { NextRequest, NextResponse } from 'next/server';
import { getImportedMembersList } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  try {
    await initDatabaseSchema();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = Math.max((page - 1) * limit, 0);

    const result = await getImportedMembersList(search, limit, offset);

    return NextResponse.json({
      success: true,
      members: result.members,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    });
  } catch (error) {
    console.error('Error fetching imported members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members list' },
      { status: 500 }
    );
  }
}
