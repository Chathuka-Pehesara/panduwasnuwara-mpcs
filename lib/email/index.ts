import nodemailer from 'nodemailer';
import { getContactNotificationEmails } from '@/lib/models/setting';

export interface ContactSubmissionPayload {
  name: string;
  email?: string | null;
  phone: string;
  subject?: string;
  message: string;
  businessName?: string;
}

/**
 * Creates a reusable nodemailer transporter based on environment configuration.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Sends the contact form submission email to the configured destination addresses.
 * Delivers to 1 or 2 addresses as specified in the admin panel settings.
 */
export async function sendContactNotificationEmail(data: ContactSubmissionPayload): Promise<{
  success: boolean;
  recipients?: string[];
  reason?: string;
  messageId?: string;
}> {
  try {
    // 1. Fetch destination emails configured in Admin Panel
    const recipients = await getContactNotificationEmails();

    if (!recipients || recipients.length === 0) {
      console.log('[Email Notification] No destination emails configured in Admin Settings. Skipping dispatch.');
      return { success: false, reason: 'no_recipients_configured' };
    }

    // 2. Format the message exactly as requested
    const formattedText = `Name: ${data.name}

Email: ${data.email || 'Not provided'}

Phone Number: ${data.phone}

Message: ${data.message}
`;

    // Professional HTML template matching the exact required format
    const formattedHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #003399; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #003399; margin: 0; font-size: 20px;">New Website Contact Inquiry</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Panduwasnuwara MPCS Official Website</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.8; color: #1e293b;">
          <p style="margin: 0 0 12px 0;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${data.email ? `<a href="mailto:${escapeHtml(data.email)}" style="color: #003399; text-decoration: underline;">${escapeHtml(data.email)}</a>` : 'Not provided'}</p>
          <p style="margin: 0 0 12px 0;"><strong>Phone Number:</strong> <a href="tel:${escapeHtml(data.phone.replace(/[^0-9+]/g, ''))}" style="color: #003399; text-decoration: underline;">${escapeHtml(data.phone)}</a></p>
          <p style="margin: 0 0 6px 0;"><strong>Message:</strong></p>
          <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; white-space: pre-wrap; font-size: 13px; color: #334155;">${escapeHtml(data.message)}</div>
        </div>

        ${data.businessName ? `<p style="font-size: 11px; color: #94a3b8; margin-top: 16px;">Target Department: ${escapeHtml(data.businessName)}</p>` : ''}
        <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
          Sent automatically via Panduwasnuwara MPCS Web Portal
        </div>
      </div>
    `;

    // 3. Initialize mailer
    const transporter = createTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Panduwasnuwara MPCS" <${process.env.SMTP_USER || 'no-reply@panduwasnuwara.lk'}>`;

    if (!transporter) {
      console.warn('[Email Notification] SMTP credentials (SMTP_USER / SMTP_PASS) not set in environment. Destination emails:', recipients);
      console.log('--- EMAIL CONTENT PREVIEW ---');
      console.log(`To: ${recipients.join(', ')}`);
      console.log(formattedText);
      console.log('-----------------------------');
      return { success: false, reason: 'smtp_not_configured', recipients };
    }

    // 4. Dispatch to all configured recipients (works for 1 or 2 addresses)
    const mailOptions = {
      from: fromAddress,
      to: recipients.join(', '),
      replyTo: data.email || undefined,
      subject: `New Inquiry: ${data.name} - ${data.subject || 'Website Message'}`,
      text: formattedText,
      html: formattedHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Notification] Successfully sent inquiry to [${recipients.join(', ')}] Message ID: ${info.messageId}`);

    return {
      success: true,
      recipients,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error('[Email Notification] Error dispatching inquiry email:', err);
    return {
      success: false,
      reason: err.message || 'unknown_error'
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
