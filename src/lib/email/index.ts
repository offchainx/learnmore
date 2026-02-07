/**
 * Email Module Barrel Export
 *
 * Provides email sending utilities and templates.
 */

// Email sending client
export { sendEmail } from './resend'

// Email templates
export {
  WelcomeEmail,
  WeeklyReportEmail,
  TrialExpiryEmail,
  ReceiptEmail,
  FeedbackAckEmail,
} from './templates'
