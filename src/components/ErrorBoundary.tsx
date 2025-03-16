"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
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
              Oops! Something went wrong
            </h1>
            <p 
              className="text-gray-600 mb-8"
              suppressHydrationWarning
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              suppressHydrationWarning
            >
              <button
                onClick={() => this.setState({ hasError: false })}
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
      );
    }

    return this.props.children;
  }
} 