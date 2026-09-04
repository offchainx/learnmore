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
    question: 'What is Learnbank?',
    answer: 'Learnbank is preparing a mobile learning app focused on practice, reviewing mistakes, learning notes and progress. The first release is a limited iOS and Android beta.'
  },
  {
    question: 'Which devices are planned for beta?',
    answer: 'The initial beta is planned for iOS and Android devices. Availability depends on the beta build and invitation process.'
  },
  {
    question: 'Which subjects are in the initial scope?',
    answer: 'The initial scope covers Mathematics, Science, History and Geography. We will announce any additional subjects only after they are ready to test.'
  },
  {
    question: 'How do I join the beta?',
    answer: 'The beta sign-up form is being prepared. When it opens, it will collect only your email address, device type and testing interest.'
  },
  {
    question: 'Does this website sell subscriptions?',
    answer: 'No. Pro subscriptions will be handled inside the Learnbank mobile app through Apple App Store or Google Play when they become available.'
  },
  {
    question: 'What information will beta sign-up collect?',
    answer: 'Only your email address, device type and testing interest. We do not ask for student name, school, age or other student identity details in the beta form.'
  },
  {
    question: 'How can I share product feedback?',
    answer: 'Please email help@learnbank.net. We will use feedback to improve the beta, but cannot promise an individual reply or feature timeline.'
  },
  {
    question: 'Does Learnbank guarantee grades or exam outcomes?',
    answer: 'No. Learnbank is a study tool. Learning content and any AI-assisted response should be checked against your teacher, textbook or official materials.'
  },
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
