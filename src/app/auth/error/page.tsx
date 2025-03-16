"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'Configuration':
          setError('There is a problem with the server configuration.');
          break;
        case 'AccessDenied':
          setError('You do not have access to sign in.');
          break;
        case 'Verification':
          setError('The verification link may have been used or has expired.');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
        case 'OAuthAccountNotLinked':
        case 'EmailSignin':
        case 'CredentialsSignin':
        case 'SessionRequired':
          setError('There was a problem with the authentication process. Please try again.');
          break;
        default:
          setError('An unknown error occurred during authentication.');
          break;
      }
    } else {
      setError('An unknown error occurred during authentication.');
    }
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Authentication Error</h1>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
            
            <div className="flex justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </Link>
              
              <Link
                href="/"
                className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 