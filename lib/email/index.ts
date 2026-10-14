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
 * Sends form inquiry to FormSubmit (https://formsubmit.co/ajax/{email})
 * Delivered directly to destination email configured in the Admin dashboard.
 */
async function sendViaFormSubmit(
  recipient: string,
  data: ContactSubmissionPayload
): Promise<{ success: boolean; recipient: string; message?: string }> {
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://panduwasnuwara-mpcs.vercel.app';
    const payload: Record<string, string> = {
      'Name': data.name,
      'Phone Number': data.phone,
      'Email': data.email || 'Not provided',
      'Department': data.businessName || 'General Inquiry',
      'Subject': data.subject || 'Website Contact Form',
      'Message': data.message,
      '_subject': `New Inquiry from ${data.name} (${data.phone})`,
      '_template': 'table',
      '_captcha': 'false'
    };

    if (data.email) {
      payload['_replyto'] = data.email;
    }

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': origin,
        'Referer': `${origin}/`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json().catch(() => null);
    console.log(`[FormSubmit] Dispatch to ${recipient}:`, result);
    return {
      success: res.ok,
      recipient,
      message: result?.message || (res.ok ? 'Sent successfully' : 'Failed to dispatch')
    };
  } catch (err: any) {
    console.error(`[FormSubmit] Error dispatching to ${recipient}:`, err);
    return {
      success: false,
      recipient,
      message: err.message || 'Network error'
    };
  }
}

/**
 * Optional Web3Forms dispatch (https://api.web3forms.com/submit)
 * Activated when WEB3FORMS_ACCESS_KEY is defined in environment variables.
 */
async function sendViaWeb3Forms(
  accessKey: string,
  data: ContactSubmissionPayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const payload = {
      access_key: accessKey,
      name: data.name,
      email: data.email || 'no-reply@panduwasnuwara.lk',
      phone: data.phone,
      subject: `New Inquiry: ${data.name} - ${data.subject || 'Website Message'}`,
      department: data.businessName || 'General Inquiry',
      message: data.message,
      from_name: 'Panduwasnuwara MPCS Web Portal'
    };

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json().catch(() => null);
    return {
      success: res.ok && Boolean(result?.success),
      message: result?.message
    };
  } catch (err: any) {
    console.error('[Web3Forms] Error dispatching:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Creates a reusable nodemailer transporter if SMTP credentials are provided.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

/**
 * Sends the contact form submission email to the configured destination addresses.
 * Uses FormSubmit / Web3Forms directly to the emails configured in Admin Settings.
 */
export async function sendContactNotificationEmail(data: ContactSubmissionPayload): Promise<{
  success: boolean;
  recipients?: string[];
  reason?: string;
  results?: any[];
}> {
  try {
    // 1. Fetch destination emails configured in Admin Panel
    const recipients = await getContactNotificationEmails();

    if (!recipients || recipients.length === 0) {
      console.log('[Email Notification] No destination emails configured in Admin Settings. Skipping dispatch.');
      return { success: false, reason: 'no_recipients_configured' };
    }

    // 2. Dispatch via FormSubmit to all configured recipient emails
    const formSubmitPromises = recipients.map(email => sendViaFormSubmit(email, data));
    const formSubmitResults = await Promise.allSettled(formSubmitPromises);
    const results = formSubmitResults.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason });

    // 3. If Web3Forms access key is configured, also dispatch through Web3Forms
    const web3Key = process.env.WEB3FORMS_ACCESS_KEY;
    if (web3Key) {
      sendViaWeb3Forms(web3Key, data).catch(err => {
        console.error('[Web3Forms] Background dispatch error:', err);
      });
    }

    // 4. If SMTP transporter is configured, send via SMTP in parallel as fallback
    const transporter = createTransporter();
    if (transporter) {
      try {
        const fromAddress = process.env.SMTP_FROM || `"Panduwasnuwara MPCS" <${process.env.SMTP_USER}>`;
        await transporter.sendMail({
          from: fromAddress,
          to: recipients.join(', '),
          replyTo: data.email || undefined,
          subject: `New Inquiry: ${data.name} - ${data.subject || 'Website Message'}`,
          text: `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || 'Not provided'}\nDepartment: ${data.businessName || 'General'}\n\nMessage:\n${data.message}`
        });
      } catch (smtpErr) {
        console.warn('[SMTP Notification] Transporter error:', smtpErr);
      }
    }

    return {
      success: true,
      recipients,
      results
    };
  } catch (err: any) {
    console.error('[Email Notification] Error dispatching inquiry email:', err);
    return {
      success: false,
      reason: err.message || 'unknown_error'
    };
  }
}

/**
 * Dispatches a test inquiry to verify FormSubmit activation & delivery.
 */
export async function sendTestNotificationEmail(targetEmail?: string): Promise<{
  success: boolean;
  recipients: string[];
  results: any[];
}> {
  const recipients = targetEmail ? [targetEmail.trim()] : await getContactNotificationEmails();
  const testPayload: ContactSubmissionPayload = {
    name: 'MPCS Test Service',
    email: 'test@panduwasnuwarampcs.lk',
    phone: '037 229 1012',
    subject: 'FormSubmit Service Activation & Test Message',
    businessName: 'Head Office Administration',
    message: 'This is a test notification confirming that contact form submissions on the Panduwasnuwara MPCS portal are successfully delivered to this email address.'
  };

  const results = await Promise.all(recipients.map(email => sendViaFormSubmit(email, testPayload)));
  return {
    success: results.some(r => r.success),
    recipients,
    results
  };
}
