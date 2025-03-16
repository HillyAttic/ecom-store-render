"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      category: 'Shopping',
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide shipping information and payment details to complete your purchase.',
    },
    {
      category: 'Shopping',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All transactions are secure and encrypted.',
    },
    {
      category: 'Shipping',
      question: 'How long will it take to receive my order?',
      answer: 'Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available at checkout for faster delivery.',
    },
    {
      category: 'Shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. International shipping times and costs vary by location and can be calculated at checkout.',
    },
    {
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Some restrictions apply to certain products.',
    },
    {
      category: 'Returns',
      question: 'How do I initiate a return?',
      answer: 'To initiate a return, log into your account, go to your orders, and select the item you wish to return. Follow the prompts to generate a return shipping label.',
    },
    {
      category: 'Account',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner of our website. Fill in your email address, create a password, and provide basic information to complete registration.',
    },
    {
      category: 'Account',
      question: 'How can I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.',
    },
    {
      category: 'Products',
      question: 'Are your products authentic?',
      answer: 'Yes, all products sold on our platform are 100% authentic. We work directly with manufacturers and authorized distributors to ensure product authenticity.',
    },
    {
      category: 'Products',
      question: 'What if I receive a defective item?',
      answer: 'If you receive a defective item, please contact our customer service within 48 hours of delivery. We\'ll arrange a replacement or refund.',
    },
  ];

  const categories = Array.from(new Set(faqItems.map(item => item.category)));

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 md:py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16" suppressHydrationWarning>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" suppressHydrationWarning>
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600" suppressHydrationWarning>
              Find answers to common questions about our products, services, and policies.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8" suppressHydrationWarning>
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} suppressHydrationWarning>
                <h2 className="text-2xl font-bold text-gray-900 mb-6" suppressHydrationWarning>
                  {category}
                </h2>
                <div className="space-y-4" suppressHydrationWarning>
                  {faqItems
                    .filter(item => item.category === category)
                    .map((item, index) => {
                      const itemIndex = categoryIndex * 100 + index;
                      return (
                        <div
                          key={itemIndex}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                          suppressHydrationWarning
                        >
                          <button
                            onClick={() => setOpenItem(openItem === itemIndex ? null : itemIndex)}
                            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                            suppressHydrationWarning
                          >
                            <span className="font-medium text-gray-900" suppressHydrationWarning>
                              {item.question}
                            </span>
                            {openItem === itemIndex ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          {openItem === itemIndex && (
                            <div 
                              className="px-6 py-4 bg-gray-50 border-t border-gray-100"
                              suppressHydrationWarning
                            >
                              <p className="text-gray-600" suppressHydrationWarning>{item.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div 
            className="mt-16 bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100"
            suppressHydrationWarning
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4" suppressHydrationWarning>
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-6" suppressHydrationWarning>
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              suppressHydrationWarning
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 