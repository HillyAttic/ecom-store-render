"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Minus, Plus, X, RefreshCw, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/currency';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  // Use the global cart context instead of local state
  const { cartItems, updateQuantity, removeItem, clearCart, itemCount, subtotal } = useCart();
  const { status } = useAuth();
  
  // Calculate the estimated tax (5% of subtotal)
  const estimatedTax = Math.round(subtotal * 0.05);
  const total = subtotal + estimatedTax;

  const handleQuantityChange = (id: number, delta: number) => {
    // Find the current item
    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem) return;
    
    // Calculate the new quantity
    const newQuantity = currentItem.quantity + delta;
    
    // Update with the correct quantity value
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  // Function to handle checkout button click
  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (status === 'unauthenticated') {
      e.preventDefault();
      // Show alert and redirect to sign in page
      alert('You need to sign in to proceed to checkout.');
      window.location.href = '/auth/signin?returnUrl=/checkout';
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 md:py-12" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-8" suppressHydrationWarning>
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900">Shopping Cart</span>
          </nav>

          {/* Page Title */}
          <div className="text-center mb-10" suppressHydrationWarning>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>Your Shopping Cart</h1>
            <p className="text-gray-600" suppressHydrationWarning>
              {cartItems.length > 0 
                ? `You have ${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`
                : 'Your cart is empty'}
            </p>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid md:grid-cols-12 gap-8" suppressHydrationWarning>
              {/* Cart Items */}
              <div className="md:col-span-8" suppressHydrationWarning>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden" suppressHydrationWarning>
                  <div className="hidden md:grid md:grid-cols-12 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 p-4" suppressHydrationWarning>
                    <div className="md:col-span-6" suppressHydrationWarning>Product</div>
                    <div className="md:col-span-2 text-center" suppressHydrationWarning>Price</div>
                    <div className="md:col-span-2 text-center" suppressHydrationWarning>Quantity</div>
                    <div className="md:col-span-2 text-right" suppressHydrationWarning>Subtotal</div>
                  </div>

                  {/* Cart Items List */}
                  {cartItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="grid md:grid-cols-12 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50"
                      suppressHydrationWarning
                    >
                      {/* Product Info */}
                      <div className="md:col-span-6 flex items-center" suppressHydrationWarning>
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0" suppressHydrationWarning>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1" suppressHydrationWarning>
                          <Link 
                            href={`/products/${item.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                            suppressHydrationWarning
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="mt-1 inline-flex items-center text-xs text-red-600 hover:text-red-800"
                            suppressHydrationWarning
                          >
                            <X size={12} className="mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 md:text-center" suppressHydrationWarning>
                        <div className="md:hidden text-xs text-gray-500 mb-1" suppressHydrationWarning>Price:</div>
                        <div className="flex md:justify-center items-center" suppressHydrationWarning>
                          <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>
                            {formatCurrency(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2" suppressHydrationWarning>
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 md:text-center" suppressHydrationWarning>
                        <div className="md:hidden text-xs text-gray-500 mb-1" suppressHydrationWarning>Quantity:</div>
                        <div className="inline-flex items-center border border-gray-300 rounded-lg" suppressHydrationWarning>
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            suppressHydrationWarning
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2 text-sm text-gray-900" suppressHydrationWarning>{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            suppressHydrationWarning
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="md:col-span-2 md:text-right" suppressHydrationWarning>
                        <div className="md:hidden text-xs text-gray-500 mb-1" suppressHydrationWarning>Subtotal:</div>
                        <span className="font-medium text-gray-900" suppressHydrationWarning>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Cart Actions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50" suppressHydrationWarning>
                    <button
                      onClick={handleClearCart}
                      className="inline-flex items-center text-sm text-gray-600 hover:text-red-600"
                      suppressHydrationWarning
                    >
                      <X size={16} className="mr-1" />
                      Clear Cart
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      suppressHydrationWarning
                    >
                      <RefreshCw size={16} className="mr-1" />
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="md:col-span-4" suppressHydrationWarning>
                <div className="bg-white rounded-xl shadow-sm p-6" suppressHydrationWarning>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4" suppressHydrationWarning>Order Summary</h2>
                  <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4" suppressHydrationWarning>
                    <div className="flex justify-between" suppressHydrationWarning>
                      <span className="text-gray-600" suppressHydrationWarning>Subtotal</span>
                      <span className="font-medium text-gray-900" suppressHydrationWarning>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between" suppressHydrationWarning>
                      <span className="text-gray-600" suppressHydrationWarning>Estimated Tax</span>
                      <span className="font-medium text-gray-900" suppressHydrationWarning>{formatCurrency(estimatedTax)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between mb-6" suppressHydrationWarning>
                    <span className="text-base font-semibold text-gray-900" suppressHydrationWarning>Total</span>
                    <span className="text-lg font-bold text-gray-900" suppressHydrationWarning>{formatCurrency(total)}</span>
                  </div>
                  
                  {status === 'unauthenticated' ? (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg" suppressHydrationWarning>
                      <div className="flex items-center text-amber-700">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <p className="text-sm">You need to sign in to place an order</p>
                      </div>
                    </div>
                  ) : null}
                  
                  <Link 
                    href="/checkout"
                    onClick={handleCheckoutClick}
                    className="w-full block text-center py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                    suppressHydrationWarning
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                      <path d="M3 6h18"></path>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    {status === 'unauthenticated' ? 'Sign In to Checkout' : 'Proceed to Checkout'}
                  </Link>
                  <div className="mt-4 text-xs text-gray-500 text-center" suppressHydrationWarning>Shipping and taxes calculated at checkout</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12" suppressHydrationWarning>
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items in cart</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding some products to your cart.</p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  suppressHydrationWarning
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 