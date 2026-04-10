import type { Metadata } from 'next'
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter'
import { Navbar } from '@/components/layout/navbar';
import { marketingSiteConfig } from '@/lib/marketing/site-shell'

export const metadata: Metadata = {
  title: 'Refund Policy | LearnMore',
  description: 'LearnMore\'s refund policy: 7-day money-back guarantee, eligibility criteria, non-refundable items, and how to request a refund.',
  openGraph: {
    title: 'Refund Policy | LearnMore',
    description: 'Everything you need to know about requesting a refund — including our 7-day money-back guarantee.',
  },
}

export default function RefundPage() {
  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Refund Policy</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: February 5, 2026</p>
          <p>
            Thank you for choosing LearnMore Edu for your educational journey. We want to make sure you have a rewarding experience while you&apos;re exploring, evaluating, and purchasing our digital courses and services.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. 7-Day Money Back Guarantee</h2>
          <p>
            We offer a 7-day money-back guarantee for our standard subscription plans. If you are not satisfied with our service, you can request a full refund within 7 days of your initial purchase.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Eligibility for Refund</h2>
          <p>
            To be eligible for a refund, you must meet the following criteria:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The refund request must be made within 7 days of the transaction date.</li>
            <li>You must not have consumed more than 20% of the course content or completed more than 5 mock exams.</li>
            <li>The request must be sent from the email address associated with your LearnMore account.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Non-refundable Items</h2>
          <p>
            Certain services are non-refundable, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Promotional or discounted purchases marked as &quot;Non-refundable&quot; at the time of sale.</li>
            <li>One-on-one tutoring sessions that have already been completed or cancelled with less than 24 hours notice.</li>
            <li>Services purchased through third-party platforms or resellers (please contact them directly).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Refund Process</h2>
          <p>
            To request a refund, please contact our support team at <span className="text-blue-400">{marketingSiteConfig.supportEmail}</span> with your account details and reason for the request. Once approved, the refund will be processed to your original method of payment within 5-10 business days.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about our Refund Policy, please contact us via our support center or email us at {marketingSiteConfig.supportEmail}.
          </p>
        </div>
      </main>

      <MarketingSimpleFooter locale="en" />
    </div>
  );
}
