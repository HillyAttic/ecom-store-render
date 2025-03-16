"use client";

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { memo } from 'react';

const NotFoundContent = memo(() => (
  <div 
    className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-12" 
    suppressHydrationWarning
  >
    <div 
      className="text-center px-4" 
      suppressHydrationWarning
    >
      <h1 
        className="text-6xl font-bold text-gray-900 mb-4" 
        suppressHydrationWarning
      >
        404
      </h1>
      <h2 
        className="text-2xl font-semibold text-gray-800 mb-6" 
        suppressHydrationWarning
      >
        Page Not Found
      </h2>
      <p 
        className="text-gray-600 mb-8 max-w-md mx-auto" 
        suppressHydrationWarning
      >
        We couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <div suppressHydrationWarning>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          suppressHydrationWarning
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  </div>
));

NotFoundContent.displayName = 'NotFoundContent';

export default function NotFound() {
  return (
    <MainLayout>
      <NotFoundContent />
    </MainLayout>
  );
} 