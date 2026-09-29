import { NextRequest, NextResponse } from 'next/server';
import { 
  getMembershipApplications, 
  updateMembershipApplicationStatus,
  updateMembershipApplication,
  deleteMembershipApplication
} from '@/lib/models/membershipApplication';
import { initDatabaseSchema } from '@/lib/db/schema';

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

// GET all applications
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';

    const applications = await getMembershipApplications(status);
    return NextResponse.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Failed to get membership applications for admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch membership applications' },
      { status: 500 }
    );
  }
}

// PATCH update status & notes
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application ID or status' },
        { status: 400 }
      );
    }

    const updated = await updateMembershipApplicationStatus(id, status, admin_notes);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Membership application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updated
    });
  } catch (error) {
    console.error('Failed to update membership application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}

// PUT edit application fields
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const body = await req.json();
    const { id, full_name_si, full_name_en, address, postal_address, nic, phone, email, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateMembershipApplication(id, {
      full_name_si,
      full_name_en,
      address,
      postal_address,
      nic,
      phone,
      email,
      status,
      admin_notes
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Membership application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updated
    });
  } catch (error) {
    console.error('Failed to edit membership application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to edit membership application' },
      { status: 500 }
    );
  }
}

// DELETE delete application
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '', 10);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    await deleteMembershipApplication(id);

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete membership application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete membership application' },
      { status: 500 }
    );
  }
}
