"use client";

import { useState } from 'react';
import Link from 'next/link';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically make an API call to initiate password reset
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <svg 
          className="w-16 h-16 text-green-500 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2" suppressHydrationWarning>
          Check Your Email
        </h3>
        <p className="text-gray-600 mb-6" suppressHydrationWarning>
          We've sent a password reset link to {email}. 
          Please check your inbox and follow the instructions to reset your password.
        </p>
        <div className="flex flex-col space-y-3" suppressHydrationWarning>
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            suppressHydrationWarning
          >
            Return to Login
          </Link>
          <button 
            onClick={() => setIsSuccess(false)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            suppressHydrationWarning
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
      <div suppressHydrationWarning>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-700 mb-1"
          suppressHydrationWarning
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="your.email@example.com"
          className={`w-full px-4 py-3 rounded-lg border ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          suppressHydrationWarning
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 rounded-lg font-medium text-white ${
          isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } transition`}
        suppressHydrationWarning
      >
        {isSubmitting ? 'Sending Reset Link...' : 'Reset Password'}
      </button>

      <div className="text-center" suppressHydrationWarning>
        <Link 
          href="/login" 
          className="text-blue-600 hover:text-blue-800 text-sm"
          suppressHydrationWarning
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm; 