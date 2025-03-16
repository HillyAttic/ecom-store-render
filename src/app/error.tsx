"use client";

import { useEffect, memo } from "react";
import Link from "next/link";

interface ErrorContentProps {
  reset: () => void;
}

const ErrorContent = memo(({ reset }: ErrorContentProps) => (
  <div 
    className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4"
    suppressHydrationWarning
  >
    <div 
      className="text-center"
      suppressHydrationWarning
    >
      <h1 
        className="text-4xl font-bold text-gray-900 mb-4"
        suppressHydrationWarning
      >
        Something went wrong!
      </h1>
      <p 
        className="text-gray-600 mb-8"
        suppressHydrationWarning
      >
        We apologize for the inconvenience. Please try again.
      </p>
      <div 
        className="flex flex-col sm:flex-row gap-4 justify-center"
        suppressHydrationWarning
      >
        <button
          onClick={() => {
            // Clear any error states before retrying
            try {
              reset();
            } catch (e) {
              console.error('Error during reset:', e);
            }
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          suppressHydrationWarning
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          suppressHydrationWarning
        >
          Go back home
        </Link>
      </div>
    </div>
  </div>
));

ErrorContent.displayName = 'ErrorContent';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return <ErrorContent reset={reset} />;
} 