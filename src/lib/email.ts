import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'Learn More <onboarding@resend.dev>', // Default sender for testing
}: SendEmailParams) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email sending skipped.');
    return { success: false, error: 'Missing API Key' };
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};
