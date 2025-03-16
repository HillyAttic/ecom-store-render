"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ClipboardList } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    // Only clear the cart once to prevent infinite loops
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 md:py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4 text-center" suppressHydrationWarning>
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8" suppressHydrationWarning>
            <div className="text-green-500 mb-6" suppressHydrationWarning>
              <CheckCircle className="w-16 h-16 mx-auto" suppressHydrationWarning />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4" suppressHydrationWarning>
              Order Placed Successfully!
            </h1>
            
            <p className="text-gray-600 mb-8" suppressHydrationWarning>
              Thank you for your order! We've sent a confirmation email with your order details.
              Our team will process your order shortly.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6" suppressHydrationWarning>
              <h2 className="text-lg font-medium text-blue-800 mb-2" suppressHydrationWarning>
                Track Your Order
              </h2>
              <p className="text-blue-700 mb-2" suppressHydrationWarning>
                You can now track the status of your order in your order history. We'll update the status as your order progresses.
              </p>
              <p className="text-sm text-blue-600" suppressHydrationWarning>
                Order status will change from: Pending → Processing → Shipped → Delivered
              </p>
            </div>

            <div className="space-y-4" suppressHydrationWarning>
              <Link
                href="/orders"
                className="inline-block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                suppressHydrationWarning
              >
                <div className="flex items-center justify-center" suppressHydrationWarning>
                  <ClipboardList className="w-5 h-5 mr-2" suppressHydrationWarning />
                  <span suppressHydrationWarning>View Order History</span>
                </div>
              </Link>
              
              <Link
                href="/"
                className="inline-block w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                suppressHydrationWarning
              >
                <div className="flex items-center justify-center" suppressHydrationWarning>
                  <ShoppingBag className="w-5 h-5 mr-2" suppressHydrationWarning />
                  <span suppressHydrationWarning>Continue Shopping</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 