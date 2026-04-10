import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY?.trim();

if (!resendApiKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing RESEND_API_KEY environment variable');
  } else {
    console.warn('Warning: RESEND_API_KEY is not set. Emails will not be sent.');
  }
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || 'LearnMore <noreply@learnmore.com>';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, react, text, replyTo }: SendEmailOptions) {
  if (!resend) {
    return { success: false, error: 'Missing API Key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react: react || undefined,
      text: text || '',
      replyTo: replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return { success: false, error: err };
  }
}
