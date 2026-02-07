import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy | LearnMore',
  description: 'Learn how LearnMore collects, uses, and protects your personal data. Our privacy policy covers cookies, data sharing, and your rights.',
  openGraph: {
    title: 'Privacy Policy | LearnMore',
    description: 'How LearnMore collects, uses, and safeguards your information — including cookie policy and data rights.',
  },
}

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Privacy Policy</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: February 5, 2026</p>
          <p>
            At LearnMore Edu, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our educational platform.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you register, create an account, update your profile, or contact customer support. This may include your name, email address, grade level, and learning preferences.
          </p>
          <p>
            We also collect certain information automatically when you use our Service, such as your IP address, browser type, operating system, and details about your usage of the platform (e.g., study time, scores, and progress).
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personalize your learning experience and recommend relevant content.</li>
            <li>Track your progress and generate performance reports.</li>
            <li>Process transactions and send you related information.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Communicate with you about products, services, offers, and events.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share information about you with third-party vendors and service providers who need access to such information to carry out work on our behalf (e.g., payment processing or email delivery).
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is ever completely secure.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal data. You can manage most of your information through your account settings or contact us for assistance.
          </p>
        </div>
      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 LearnMore Edu. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
