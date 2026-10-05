import { NextRequest, NextResponse } from 'next/server';
import {
  getServicesByBusinessKey,
  getAllBusinessServices,
  createBusinessService,
  updateBusinessService,
  deleteBusinessService
} from '@/lib/models/businessService';

function getAuthFromToken(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'session') {
      const username = decodeURIComponent(parts[1]);
      const role = parts[2];
      return { username, role, isAdmin: role === 'admin' || role === 'superadmin' };
    }
  } catch (err) {
    console.error('Error parsing token:', err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessKey = searchParams.get('businessKey');
    const includeInactive = searchParams.get('all') === 'true';

    if (!businessKey || businessKey === 'all') {
      const services = await getAllBusinessServices();
      return NextResponse.json({ success: true, services });
    }

    const services = await getServicesByBusinessKey(businessKey, !includeInactive);
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error('Error fetching business services:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
    const auth = getAuthFromToken(adminToken);

    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { business_key, title_si, title_en, desc_si, desc_en, features_si, features_en, display_order, is_active } = body;

    if (!business_key || !title_si || !title_en) {
      return NextResponse.json(
        { success: false, error: 'Business key, Sinhala title, and English title are required' },
        { status: 400 }
      );
    }

    const service = await createBusinessService({
      business_key,
      title_si,
      title_en,
      desc_si,
      desc_en,
      features_si,
      features_en,
      display_order: display_order ?? 0,
      is_active: is_active ?? true
    });

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating business service:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
    const auth = getAuthFromToken(adminToken);

    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }

    const updated = await updateBusinessService(id, data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    console.error('Error updating business service:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
    const auth = getAuthFromToken(adminToken);

    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '', 10);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Valid service ID is required' }, { status: 400 });
    }

    const deleted = await deleteBusinessService(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Service not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting business service:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
