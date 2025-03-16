"use client";

import { useState, useCallback, useRef } from 'react';
import { Mail } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount to prevent memory leaks
  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // In a real application, you would send this to your API
    console.log('Subscribing email:', email);
    setIsSubmitted(true);
    setError('');
    setEmail('');
    
    // Clear any existing timeout
    clearTimeoutRef();
    
    // Reset the success message after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  }, [email, clearTimeoutRef]);

  // Clean up on unmount
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  }, [error]);

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="max-w-3xl mx-auto text-center" suppressHydrationWarning>
          <div className="inline-block p-3 bg-blue-500 rounded-full mb-6" suppressHydrationWarning>
            <Mail size={28} suppressHydrationWarning />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" suppressHydrationWarning>Stay Updated with Our New Products</h2>
          <p className="text-blue-100 mb-8 text-lg" suppressHydrationWarning>
          stay updated with our new products, exciting offers, and exclusive coupons delivered straight to your inbox by subscribing to our newsletter
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" suppressHydrationWarning>
            <div className="flex-1 relative" suppressHydrationWarning>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={email}
                onChange={handleEmailChange}
                aria-label="Email address"
                suppressHydrationWarning
              />
              {error && <p className="absolute text-left text-red-300 text-sm mt-1" suppressHydrationWarning>{error}</p>}
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6 py-3 rounded-lg transition duration-300 ease-in-out flex-shrink-0"
              suppressHydrationWarning
            >
              <span suppressHydrationWarning>Subscribe</span>
            </button>
          </form>

          {isSubmitted && (
            <div className="mt-6 text-sm bg-blue-500 py-2 px-4 rounded-lg inline-block" suppressHydrationWarning>
              <p suppressHydrationWarning>Thank you for subscribing! Check your email for confirmation.</p>
            </div>
          )}

          <p className="mt-6 text-sm text-blue-200" suppressHydrationWarning>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter; 