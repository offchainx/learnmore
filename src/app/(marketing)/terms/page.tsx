import type { Metadata } from 'next'
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter'
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Terms of Service | LearnMore',
  description: 'Read LearnMore\'s Terms of Service. Understand your rights, responsibilities, and our policies on account usage, content, and subscriptions.',
  openGraph: {
    title: 'Terms of Service | LearnMore',
    description: 'Understand your rights and responsibilities as a LearnMore user — covering accounts, content, payments, and more.',
  },
}

export default function TermsPage() {
  return (
    <div className="marketing-shell min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Terms of Service</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: February 5, 2026</p>
          <p>
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using the LearnMore Edu platform operated by us. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Content and Intellectual Property</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (&quot;Content&quot;). You are responsible for the Content that you post to the Service.
          </p>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of LearnMore Edu and its licensors.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Subscriptions and Payments</h2>
          <p>
            Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or LearnMore Edu cancels it.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </main>

      <MarketingSimpleFooter locale="en" />
    </div>
  );
}
