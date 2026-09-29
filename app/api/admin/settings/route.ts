import { NextRequest, NextResponse } from 'next/server';
import {
  getRecoveryWhatsAppNumber,
  setSetting,
  getContactDestinationEmail1,
  getContactDestinationEmail2
} from '@/lib/models/setting';
import { getYearsOfService, setYearsOfService } from '@/lib/models/stats';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const recoveryWhatsAppNumber = await getRecoveryWhatsAppNumber();
    const yearsOfService = await getYearsOfService();
    const contactEmail1 = await getContactDestinationEmail1();
    const contactEmail2 = await getContactDestinationEmail2();
    const hasSmtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

    return NextResponse.json({
      success: true,
      settings: {
        recoveryWhatsAppNumber,
        yearsOfService,
        contactEmail1,
        contactEmail2,
        hasSmtpConfigured
      }
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { auth, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { recoveryWhatsAppNumber, yearsOfService, contactEmail1, contactEmail2 } = body;

    if (recoveryWhatsAppNumber !== undefined) {
      // Strip non-digit characters except leading plus
      const cleaned = recoveryWhatsAppNumber.replace(/[^0-9]/g, '');
      await setSetting('recovery_whatsapp_number', cleaned);
    }

    if (yearsOfService !== undefined) {
      await setYearsOfService(yearsOfService);
    }

    if (contactEmail1 !== undefined) {
      await setSetting('contact_destination_email_1', (contactEmail1 || '').trim());
    }

    if (contactEmail2 !== undefined) {
      await setSetting('contact_destination_email_2', (contactEmail2 || '').trim());
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}

