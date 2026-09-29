import { NextRequest, NextResponse } from 'next/server';
import { getAllBusinesses, createBusiness, updateBusiness, deleteBusiness } from '@/lib/models/business';

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
    const businesses = await getAllBusinesses(false);
    return NextResponse.json({ success: true, businesses });
  } catch (error) {
    console.error('Error fetching admin businesses:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch businesses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title_en || !body.title_si) {
      return NextResponse.json({ success: false, error: 'Title in English and Sinhala required' }, { status: 400 });
    }

    const key = body.key || body.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const business = await createBusiness({
      ...body,
      key
    });

    return NextResponse.json({ success: true, business });
  } catch (error: any) {
    console.error('Error creating business:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create business' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = parseInt(body.id, 10);
    if (!id) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    const updated = await updateBusiness(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    console.error('Error updating business:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update business' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '', 10);
    if (!id) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    await deleteBusiness(id);
    return NextResponse.json({ success: true, message: 'Business deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting business:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete business' }, { status: 500 });
  }
}
