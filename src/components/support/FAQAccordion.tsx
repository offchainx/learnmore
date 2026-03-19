'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I start a mock exam?",
    answer: "You can start a mock exam by navigating to the 'Practice' section in your dashboard and selecting the 'Mock Arena' option. From there, you can choose your subject and start the timer."
  },
  {
    question: "Can I use LearnMore on my phone?",
    answer: "Yes. LearnMore supports mobile browser access, so you can use it directly on your phone without installing a separate app."
  },
  {
    question: "What happens if I encounter a mistake in a question?",
    answer: "We strive for 100% accuracy, but if you find an error, please use the 'Report Error' button on the question page. Our content team will review and fix it promptly."
  },
  {
    question: "How do I reset my password?",
    answer: "Go to the Login page and click 'Forgot Password'. Follow the instructions sent to your email to set a new password."
  },
  {
    question: "What are AI Tokens?",
    answer: "AI Tokens are used to interact with our AI Tutor. Standard users get a daily free quota, while Premium users have higher limits and more advanced features."
  },
  {
    question: "What subjects does LearnMore support?",
    answer: "LearnMore currently covers 6 core subjects: Math, Physics, Chemistry, English, Chinese, and Biology — spanning the full curriculum for grades 7 through 9."
  },
  {
    question: "How does the Error Book work?",
    answer: "Every question you answer incorrectly is automatically added to your Error Book. The system tracks your mastery level and uses spaced repetition to remind you to review these questions at the optimal time."
  },
  {
    question: "What's the difference between Free and Premium plans?",
    answer: "The Free plan gives you access to basic practice and reference answers. Premium unlocks AI-powered tutoring, unlimited memory cards, adaptive learning insights, and advanced analytics."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "Go to Dashboard → Settings → Subscription, then click 'Cancel Subscription'. Your access will remain active until the end of the current billing cycle."
  },
  {
    question: "Will my account be charged after the trial ends?",
    answer: "No. When your trial ends, your account automatically downgrades to the Free plan. No charge is made unless you manually choose a paid plan."
  },
  {
    question: "How do I refer a friend to LearnMore?",
    answer: "Head to Dashboard → Refer a Friend, copy your unique referral code, and share it. Both you and your friend will earn learning rewards once they sign up."
  },
  {
    question: "Where can I find my learning progress reports?",
    answer: "Your progress reports are available in Dashboard → My Progress. You'll see weekly and monthly summaries including accuracy rates, streak days, and subject-level breakdowns."
  }
];

export function FAQAccordion({ searchQuery = '' }: { searchQuery?: string }) {
  const filtered = searchQuery.trim()
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <Accordion type="single" collapsible className="w-full">
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">No results found for "{searchQuery}"</p>
      ) : filtered.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-slate-800">
          <AccordionTrigger className="text-left text-white hover:text-blue-400 py-4 font-medium transition-all">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-slate-400 pb-4 leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
