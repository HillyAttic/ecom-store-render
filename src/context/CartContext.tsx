"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { validatePrice } from '@/utils/currency';

// Define the cart item type
export interface CartItem {
  id: number;
  name: string;
  price: number; // Price in INR
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  originalPrice?: number; // Original price in INR
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem, quantity?: number) => void;
  updateQuantity: (itemId: number, quantity: number, color?: string, size?: string) => void;
  removeItem: (itemId: number, color?: string, size?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with an empty cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  // Calculate totals whenever cart changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const newCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const newTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Only update if values have changed
    if (newCount !== itemCount) {
      setItemCount(newCount);
    }
    if (newTotal !== subtotal) {
      setSubtotal(newTotal);
    }
  }, [cartItems, isInitialized, itemCount, subtotal]);

  // Save cart to localStorage whenever it changes, using debounce
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveCart = () => {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    };

    const timeoutId = setTimeout(saveCart, 300); // Debounce for 300ms
    return () => clearTimeout(timeoutId);
  }, [cartItems, isInitialized]);

  // Memoize cart operations
  const addToCart = useCallback((item: CartItem, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => 
        i.id === item.id && 
        i.color === item.color && 
        i.size === item.size
      );

      if (existingItem) {
        return prevItems.map(i =>
          i === existingItem
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prevItems, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((itemId: number, color?: string, size?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.id === itemId &&
          (!color || item.color === color) &&
          (!size || item.size === size))
      )
    );
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number, color?: string, size?: string) => {
    if (quantity < 1) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId &&
        (!color || item.color === color) &&
        (!size || item.size === size)
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo(() => ({
    cartItems,
    itemCount,
    subtotal,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart
  }), [cartItems, itemCount, subtotal, addToCart, removeItem, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 