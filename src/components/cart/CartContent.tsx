"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, RefreshCw, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/currency';

const CartContent = () => {
  // Use cart context instead of local state
  const { cartItems, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Calculate shipping and total
  // Free shipping for orders over ₹8,000 (equivalent to $100 at exchange rate)
  const freeShippingThreshold = 8000;
  const shipping = subtotal > freeShippingThreshold ? 0 : 800; // ₹800 shipping (about $10)
  const discount = couponApplied ? subtotal * (couponDiscount / 100) : 0;
  const total = subtotal + shipping - discount;

  // Apply coupon code
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'summer20') {
      setCouponApplied(true);
      setCouponDiscount(20);
    } else {
      alert('Invalid coupon code');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" suppressHydrationWarning>
      {/* Cart Items Section */}
      <div className={`lg:col-span-2 ${!cartItems.length ? 'lg:col-start-2 lg:col-end-2' : ''}`} suppressHydrationWarning>
        {cartItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden" suppressHydrationWarning>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-gray-100 border-b border-gray-200" suppressHydrationWarning>
              <div className="col-span-3 text-gray-700 font-medium" suppressHydrationWarning>Product</div>
              <div className="text-gray-700 font-medium" suppressHydrationWarning>Price</div>
              <div className="text-gray-700 font-medium" suppressHydrationWarning>Quantity</div>
              <div className="text-gray-700 font-medium" suppressHydrationWarning>Subtotal</div>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-gray-200" suppressHydrationWarning>
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 md:grid md:grid-cols-6 md:gap-4 md:items-center flex flex-col" suppressHydrationWarning>
                  {/* Product Info */}
                  <div className="md:col-span-3 flex items-center w-full mb-4 md:mb-0" suppressHydrationWarning>
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="text-gray-400 hover:text-red-500 mr-3 flex-shrink-0"
                      aria-label="Remove item"
                      suppressHydrationWarning
                    >
                      <X size={18} />
                    </button>
                    <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-md overflow-hidden flex-shrink-0" suppressHydrationWarning>
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="ml-4 flex-grow" suppressHydrationWarning>
                      <h3 className="text-gray-800 font-medium line-clamp-2" suppressHydrationWarning>{item.name}</h3>
                      <div className="text-sm text-gray-500 mt-1" suppressHydrationWarning>
                        {item.color && <span suppressHydrationWarning>Color: {item.color}</span>}
                        {item.size && <span className="ml-2" suppressHydrationWarning>Size: {item.size}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-gray-800 mb-3 md:mb-0 flex justify-between w-full md:block" suppressHydrationWarning>
                    <span className="md:hidden font-medium" suppressHydrationWarning>Price:</span>
                    <span suppressHydrationWarning>{formatCurrency(item.price)}</span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center mb-3 md:mb-0 justify-between w-full md:justify-start" suppressHydrationWarning>
                    <span className="md:hidden font-medium" suppressHydrationWarning>Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-md" suppressHydrationWarning>
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                        suppressHydrationWarning
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center" suppressHydrationWarning>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                        suppressHydrationWarning
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-gray-800 font-medium flex justify-between w-full md:block" suppressHydrationWarning>
                    <span className="md:hidden font-medium" suppressHydrationWarning>Subtotal:</span>
                    <span suppressHydrationWarning>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-4 justify-between" suppressHydrationWarning>
              <Link 
                href="/" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition"
                suppressHydrationWarning
              >
                <ShoppingBag size={18} className="mr-2" />
                <span suppressHydrationWarning>Continue Shopping</span>
              </Link>
              <div className="flex flex-wrap sm:flex-nowrap gap-2" suppressHydrationWarning>
                <button 
                  onClick={clearCart} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition flex items-center"
                  suppressHydrationWarning
                >
                  <X size={18} className="mr-1" />
                  <span className="hidden sm:inline" suppressHydrationWarning>Clear Cart</span>
                  <span className="sm:hidden" suppressHydrationWarning>Clear</span>
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition flex items-center"
                  suppressHydrationWarning
                >
                  <RefreshCw size={18} className="mr-1" />
                  <span className="hidden sm:inline" suppressHydrationWarning>Update Cart</span>
                  <span className="sm:hidden" suppressHydrationWarning>Update</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 text-center w-full" suppressHydrationWarning>
              <div className="flex justify-center mb-4" suppressHydrationWarning>
                <ShoppingBag size={60} className="text-gray-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2" suppressHydrationWarning>Your cart is empty</h2>
              <p className="text-gray-600 mb-6" suppressHydrationWarning>Looks like you haven't added any products to your cart yet.</p>
              <Link 
                href="/" 
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                suppressHydrationWarning
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Coupon Code Section */}
        {cartItems.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4" suppressHydrationWarning>
            <h3 className="text-lg font-medium text-gray-800 mb-3" suppressHydrationWarning>Apply Coupon Code</h3>
            <div className="flex flex-col sm:flex-row gap-3" suppressHydrationWarning>
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500" suppressHydrationWarning>
                <Tag size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="w-full focus:outline-none text-gray-700"
                  suppressHydrationWarning
                />
              </div>
              <button
                onClick={applyCoupon}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                suppressHydrationWarning
              >
                Apply Coupon
              </button>
            </div>
            {couponApplied && (
              <div className="mt-3 text-green-600 flex items-center flex-wrap" suppressHydrationWarning>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full" suppressHydrationWarning>
                  {couponDiscount}% OFF
                </span>
                <span className="ml-2 text-sm" suppressHydrationWarning>Coupon "{couponCode}" applied successfully!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="lg:col-span-1" suppressHydrationWarning>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20" suppressHydrationWarning>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-200" suppressHydrationWarning>
              Order Summary
            </h2>
            <div className="space-y-3 mb-6" suppressHydrationWarning>
              <div className="flex justify-between text-gray-600" suppressHydrationWarning>
                <span suppressHydrationWarning>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-medium text-gray-800" suppressHydrationWarning>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600" suppressHydrationWarning>
                <span suppressHydrationWarning>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600" suppressHydrationWarning>Free</span>
                ) : (
                  <span className="font-medium text-gray-800" suppressHydrationWarning>{formatCurrency(shipping)}</span>
                )}
              </div>
              {couponApplied && (
                <div className="flex justify-between text-gray-600" suppressHydrationWarning>
                  <span suppressHydrationWarning>Discount ({couponDiscount}%)</span>
                  <span className="text-red-600 font-medium" suppressHydrationWarning>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-lg text-gray-800" suppressHydrationWarning>
                <span suppressHydrationWarning>Total</span>
                <span suppressHydrationWarning>{formatCurrency(total)}</span>
              </div>
            </div>
            {shipping > 0 && (
              <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm" suppressHydrationWarning>
                Add {formatCurrency(freeShippingThreshold - subtotal)} more to get FREE shipping!
              </div>
            )}
            <button 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              suppressHydrationWarning
            >
              <span suppressHydrationWarning>Proceed to Checkout</span>
              <ArrowRight size={18} className="ml-2" />
            </button>
            <div className="mt-4 text-center text-sm text-gray-500" suppressHydrationWarning>
              <p suppressHydrationWarning>We accept</p>
              <div className="flex justify-center gap-2 mt-2" suppressHydrationWarning>
                <div className="w-10 h-6 bg-gray-200 rounded" suppressHydrationWarning></div>
                <div className="w-10 h-6 bg-gray-200 rounded" suppressHydrationWarning></div>
                <div className="w-10 h-6 bg-gray-200 rounded" suppressHydrationWarning></div>
                <div className="w-10 h-6 bg-gray-200 rounded" suppressHydrationWarning></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContent; 