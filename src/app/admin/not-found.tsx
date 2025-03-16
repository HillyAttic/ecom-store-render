"use client";

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { memo } from 'react';

const AdminNotFoundContent = memo(() => (
  <div 
    className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4" 
    suppressHydrationWarning
  >
    <div 
      className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center"
      suppressHydrationWarning
    >
      <div 
        className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
        suppressHydrationWarning
      >
        <ShieldAlert className="h-8 w-8 text-red-600" />
      </div>
      
      <h1 
        className="text-3xl font-bold text-gray-900 mb-2"
        suppressHydrationWarning
      >
        404 - Not Found
      </h1>
      
      <p 
        className="text-gray-600 mb-6"
        suppressHydrationWarning
      >
        The admin page you're looking for doesn't exist or you don't have permission to access it.
      </p>
      
      <div 
        className="flex flex-col sm:flex-row gap-3 justify-center"
        suppressHydrationWarning
      >
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          suppressHydrationWarning
        >
          Go to Dashboard
        </Link>
        
        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          suppressHydrationWarning
        >
          Back to Login
        </Link>
      </div>
    </div>
  </div>
));

AdminNotFoundContent.displayName = 'AdminNotFoundContent';

export default function AdminNotFound() {
  return <AdminNotFoundContent />;
} 