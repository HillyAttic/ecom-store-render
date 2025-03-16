"use client";

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import HydrationFix from '@/components/HydrationFix';
import { SessionProvider } from "next-auth/react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div id="app-root" suppressHydrationWarning>
                <HydrationFix>
                  {children}
                </HydrationFix>
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
} 