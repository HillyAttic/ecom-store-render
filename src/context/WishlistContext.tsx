"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define the shape of a wishlist item
export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  rating?: number;
  description?: string;
  addedDate: string;
}

// Define the shape of the wishlist context
interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

// Create the context with a default value
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session, status } = useAuth();

  // Load wishlist items from localStorage on mount
  useEffect(() => {
    const loadWishlist = () => {
      try {
        setIsLoading(true);
        if (status === 'loading') return;

        // If user is authenticated, we could fetch from an API here
        // For now, we'll use localStorage
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [status]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlistItems.length > 0 || !isLoading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoading]);

  // Add a product to the wishlist
  const addToWishlist = (product: any) => {
    // Check if product is already in wishlist
    if (wishlistItems.some(item => item.id === product.id)) {
      return;
    }

    // Format the product to match WishlistItem interface
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category || '',
      rating: product.rating || 0,
      description: product.description || '',
      addedDate: new Date().toISOString().split('T')[0]
    };

    setWishlistItems(prev => [...prev, wishlistItem]);
    
    // Show feedback
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = `${product.name} added to wishlist!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Remove a product from the wishlist
  const removeFromWishlist = (productId: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Clear the entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// Custom hook to use the wishlist context
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 