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
    answer: "Yes! LearnMore is a Progressive Web App (PWA). You can access it via your mobile browser or 'Add to Home Screen' for a native-like experience."
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
  }
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
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
