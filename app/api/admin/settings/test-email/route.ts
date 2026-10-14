import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sendTestNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { auth, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = body.email;

    const result = await sendTestNotificationEmail(targetEmail);

    return NextResponse.json({
      success: true,
      message: 'Test message dispatched to FormSubmit',
      recipients: result.recipients,
      results: result.results
    });
  } catch (err: any) {
    console.error('Error sending test email:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch test email' },
      { status: 500 }
    );
  }
}
