"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, CreditCard, Truck, Lock, X, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/currency';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, removeItem, itemCount, subtotal } = useCart();
  const { status } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [authRedirectTimer, setAuthRedirectTimer] = useState<number | null>(null);

  // Add this useEffect to remove bis_skin_checked attributes
  useEffect(() => {
    // Function to remove bis_skin_checked attributes
    const removeBisAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(el => {
        el.removeAttribute('bis_skin_checked');
      });
    };

    // Run immediately
    removeBisAttributes();

    // Cleanup function
    return () => {
      // No cleanup needed
    };
  }, []);

  // Redirect to cart page if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
    setIsLoading(false);
  }, [cartItems, router]);

  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Set a timer to redirect after showing the message for a few seconds
      const timer = window.setTimeout(() => {
        router.push('/auth/signin?returnUrl=/checkout');
      }, 3000);
      
      setAuthRedirectTimer(timer);
      
      // Clean up timer on unmount
      return () => {
        if (authRedirectTimer) {
          clearTimeout(authRedirectTimer);
        }
      };
    }
  }, [status, router, authRedirectTimer]);

  // If not authenticated, show a message and redirect
  if (status === 'unauthenticated') {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-amber-500 mb-4">
                  <AlertCircle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
                <p className="text-gray-600 mb-6">
                  You need to sign in to place an order. Redirecting you to the sign-in page...
                </p>
                <Link 
                  href="/auth/signin?returnUrl=/checkout" 
                  className="inline-block py-3 px-6 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    saveBillingInfo: false,
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Calculate order totals using useMemo to prevent unnecessary recalculations
  const { shippingCost, discountAmount, total } = useMemo(() => {
    const shippingCost = shippingMethod === 'express' ? 1499 : 499;
    const discountAmount = couponApplied ? Math.round(subtotal * 0.10) : 0; // 10% discount for example
    const total = subtotal + shippingCost - discountAmount;
    
    return { shippingCost, discountAmount, total };
  }, [shippingMethod, couponApplied, subtotal]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleApplyCoupon = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate the coupon code with an API
    if (couponCode.toLowerCase() === 'exclusive10') {
      setCouponApplied(true);
      setDiscount(10); // 10% discount
    } else {
      alert('Invalid coupon code');
    }
  }, [couponCode]);

  const handleRemoveItem = useCallback((id: number) => {
    removeItem(id);
  }, [removeItem]);

  const validateForm = useCallback(() => {
    let tempErrors = {
      firstName: '',
      lastName: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
    };
    let isValid = true;
    let errorMessage = '';

    // First Name validation
    if (!billingInfo.firstName.trim()) {
      tempErrors.firstName = 'First name is required';
      errorMessage += 'First Name\n';
      isValid = false;
    }

    // Last Name validation
    if (!billingInfo.lastName.trim()) {
      tempErrors.lastName = 'Last name is required';
      errorMessage += 'Last Name\n';
      isValid = false;
    }

    // Street Address validation
    if (!billingInfo.streetAddress.trim()) {
      tempErrors.streetAddress = 'Street address is required';
      errorMessage += 'Street Address\n';
      isValid = false;
    }

    // City validation
    if (!billingInfo.city.trim()) {
      tempErrors.city = 'City is required';
      errorMessage += 'City\n';
      isValid = false;
    }

    // State validation
    if (!billingInfo.state) {
      tempErrors.state = 'State is required';
      errorMessage += 'State\n';
      isValid = false;
    }

    // ZIP Code validation
    if (!billingInfo.zipCode.trim()) {
      tempErrors.zipCode = 'ZIP code is required';
      errorMessage += 'ZIP Code\n';
      isValid = false;
    }

    // Phone validation
    if (!billingInfo.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
      errorMessage += 'Phone Number\n';
      isValid = false;
    } else if (!/^\d{10}$/.test(billingInfo.phone.replace(/\D/g, ''))) {
      tempErrors.phone = 'Invalid phone number format';
      errorMessage += 'Phone Number (invalid format)\n';
      isValid = false;
    }

    // Email validation
    if (!billingInfo.email.trim()) {
      tempErrors.email = 'Email is required';
      errorMessage += 'Email\n';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      tempErrors.email = 'Invalid email format';
      errorMessage += 'Email (invalid format)\n';
      isValid = false;
    }

    setErrors(tempErrors);
    
    // Show alert if there are errors
    if (errorMessage) {
      alert(`Please fill in the following required fields:\n${errorMessage}`);
    }
    
    return isValid;
  }, [billingInfo]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (status !== 'authenticated') {
      router.push('/auth/signin?returnUrl=/checkout');
      return;
    }
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      // Show confirmation before placing order
      if (!confirm('Are you sure you want to place this order?')) {
        return;
      }
      
      const orderData = {
        billingInfo,
        cartItems,
        shippingMethod,
        paymentMethod,
        total,
        subtotal,
        shippingCost,
        discountAmount
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart after successful order
        router.push('/order-success');
      } else {
        alert(data.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('An error occurred while placing your order. Please try again.');
    }
  }, [validateForm, billingInfo, cartItems, shippingMethod, paymentMethod, total, subtotal, shippingCost, discountAmount, router, status]);

  // Loading state or empty cart redirect
  if (isLoading || cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-8 md:py-12" suppressHydrationWarning>
          <div className="container mx-auto px-4 text-center" suppressHydrationWarning>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" suppressHydrationWarning></div>
            <p className="mt-4 text-gray-600" suppressHydrationWarning>Checking your cart...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 md:py-12" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6" suppressHydrationWarning>
            <Link href="/" className="hover:text-blue-600" suppressHydrationWarning>Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/cart" className="hover:text-blue-600" suppressHydrationWarning>Cart</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium" suppressHydrationWarning>Checkout</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8" suppressHydrationWarning>Checkout</h1>

          <div className="grid md:grid-cols-12 gap-8" suppressHydrationWarning>
            {/* Main Content - Billing Form */}
            <div className="md:col-span-7" suppressHydrationWarning>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8" suppressHydrationWarning>
                <h2 className="text-xl font-semibold text-gray-900 mb-6" suppressHydrationWarning>Billing Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={billingInfo.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.firstName}</p>
                      )}
                    </div>
                    <div suppressHydrationWarning>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={billingInfo.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div suppressHydrationWarning>
                    <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={billingInfo.streetAddress}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                        errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      suppressHydrationWarning
                    />
                    {errors.streetAddress && (
                      <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.streetAddress}</p>
                    )}
                  </div>

                  <div suppressHydrationWarning>
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={billingInfo.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                      suppressHydrationWarning
                    />
                  </div>

                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        Town/City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={billingInfo.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.city}</p>
                      )}
                    </div>
                    <div suppressHydrationWarning>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        State/Province *
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={billingInfo.state}
                        onChange={handleSelectChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      >
                        <option value="">Select a state</option>
                        <option value="AN">Andaman and Nicobar Islands</option>
                        <option value="AP">Andhra Pradesh</option>
                        <option value="AR">Arunachal Pradesh</option>
                        <option value="AS">Assam</option>
                        <option value="BR">Bihar</option>
                        <option value="CH">Chandigarh</option>
                        <option value="CT">Chhattisgarh</option>
                        <option value="DN">Dadra and Nagar Haveli</option>
                        <option value="DD">Daman and Diu</option>
                        <option value="DL">Delhi</option>
                        <option value="GA">Goa</option>
                        <option value="GJ">Gujarat</option>
                        <option value="HR">Haryana</option>
                        <option value="HP">Himachal Pradesh</option>
                        <option value="JK">Jammu and Kashmir</option>
                        <option value="JH">Jharkhand</option>
                        <option value="KA">Karnataka</option>
                        <option value="KL">Kerala</option>
                        <option value="LA">Ladakh</option>
                        <option value="LD">Lakshadweep</option>
                        <option value="MP">Madhya Pradesh</option>
                        <option value="MH">Maharashtra</option>
                        <option value="MN">Manipur</option>
                        <option value="ML">Meghalaya</option>
                        <option value="MZ">Mizoram</option>
                        <option value="NL">Nagaland</option>
                        <option value="OR">Odisha</option>
                        <option value="PY">Puducherry</option>
                        <option value="PB">Punjab</option>
                        <option value="RJ">Rajasthan</option>
                        <option value="SK">Sikkim</option>
                        <option value="TN">Tamil Nadu</option>
                        <option value="TG">Telangana</option>
                        <option value="TR">Tripura</option>
                        <option value="UP">Uttar Pradesh</option>
                        <option value="UT">Uttarakhand</option>
                        <option value="WB">West Bengal</option>
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.state}</p>
                      )}
                    </div>
                    <div suppressHydrationWarning>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={billingInfo.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={billingInfo.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.phone}</p>
                      )}
                    </div>
                    <div suppressHydrationWarning>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={billingInfo.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        suppressHydrationWarning
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 error-message" suppressHydrationWarning>{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Save Information Checkbox */}
                  <div className="flex items-center" suppressHydrationWarning>
                    <input
                      type="checkbox"
                      id="saveBillingInfo"
                      name="saveBillingInfo"
                      checked={billingInfo.saveBillingInfo}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      suppressHydrationWarning
                    />
                    <label htmlFor="saveBillingInfo" className="ml-2 block text-sm text-gray-700" suppressHydrationWarning>
                      Save this information for faster checkout next time
                    </label>
                  </div>
                </form>
              </div>

              {/* Shipping Methods */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8" suppressHydrationWarning>
                <h2 className="text-xl font-semibold text-gray-900 mb-6" suppressHydrationWarning>Shipping Method</h2>
                
                <div className="space-y-4" suppressHydrationWarning>
                  <label 
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                      shippingMethod === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    suppressHydrationWarning
                  >
                    <div className="flex items-center" suppressHydrationWarning>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        suppressHydrationWarning
                      />
                      <div className="ml-3" suppressHydrationWarning>
                        <span className="block text-sm font-medium text-gray-900" suppressHydrationWarning>Standard Shipping</span>
                        <span className="block text-sm text-gray-500" suppressHydrationWarning>4-7 business days</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>
                      {formatCurrency(499)}
                    </span>
                  </label>

                  <label 
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                      shippingMethod === 'express' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    suppressHydrationWarning
                  >
                    <div className="flex items-center" suppressHydrationWarning>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        suppressHydrationWarning
                      />
                      <div className="ml-3" suppressHydrationWarning>
                        <span className="block text-sm font-medium text-gray-900" suppressHydrationWarning>Express Shipping</span>
                        <span className="block text-sm text-gray-500" suppressHydrationWarning>2-3 business days</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>
                      {formatCurrency(1499)}
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm p-6" suppressHydrationWarning>
                <h2 className="text-xl font-semibold text-gray-900 mb-6" suppressHydrationWarning>Payment Method</h2>
                
                <div className="space-y-4" suppressHydrationWarning>
                  <label 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      paymentMethod === 'credit-card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    suppressHydrationWarning
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={paymentMethod === 'credit-card'}
                      onChange={() => setPaymentMethod('credit-card')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      suppressHydrationWarning
                    />
                    <div className="ml-3 flex items-center" suppressHydrationWarning>
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>Credit Card</span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    suppressHydrationWarning
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      suppressHydrationWarning
                    />
                    <div className="ml-3" suppressHydrationWarning>
                      <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>Cash on Delivery</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'credit-card' && (
                  <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50" suppressHydrationWarning>
                    <p className="text-sm text-gray-500 text-center" suppressHydrationWarning>
                      Credit card form would be rendered here. Integrate with your preferred payment processor.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="md:col-span-5" suppressHydrationWarning>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24" suppressHydrationWarning>
                <h2 className="text-xl font-semibold text-gray-900 mb-6" suppressHydrationWarning>Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6" suppressHydrationWarning>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b" suppressHydrationWarning>
                      <div className="flex items-center" suppressHydrationWarning>
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0" suppressHydrationWarning>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4" suppressHydrationWarning>
                          <h3 className="text-sm font-medium text-gray-900" suppressHydrationWarning>{item.name}</h3>
                          <p className="text-sm text-gray-500" suppressHydrationWarning>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center" suppressHydrationWarning>
                        <span className="text-sm font-medium text-gray-900 mr-4" suppressHydrationWarning>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          suppressHydrationWarning
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="mb-6" suppressHydrationWarning>
                  <form onSubmit={handleApplyCoupon} className="flex" suppressHydrationWarning>
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                      suppressHydrationWarning
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-r-lg hover:bg-gray-300"
                      suppressHydrationWarning
                    >
                      Apply
                    </button>
                  </form>
                  {couponApplied && (
                    <div className="mt-2 flex items-center text-sm text-green-600" suppressHydrationWarning>
                      <CheckCircle size={16} className="mr-1" />
                      Coupon applied: {discount}% off
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 border-t border-b py-4 mb-6" suppressHydrationWarning>
                  <div className="flex justify-between" suppressHydrationWarning>
                    <span className="text-sm text-gray-500" suppressHydrationWarning>Subtotal</span>
                    <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between" suppressHydrationWarning>
                    <span className="text-sm text-gray-500" suppressHydrationWarning>Shipping</span>
                    <span className="text-sm font-medium text-gray-900" suppressHydrationWarning>{formatCurrency(shippingCost)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between" suppressHydrationWarning>
                      <span className="text-sm text-gray-500" suppressHydrationWarning>Discount</span>
                      <span className="text-sm font-medium text-green-600" suppressHydrationWarning>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t" suppressHydrationWarning>
                    <span className="text-base font-medium text-gray-900" suppressHydrationWarning>Total</span>
                    <span className="text-base font-bold text-gray-900" suppressHydrationWarning>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                  suppressHydrationWarning
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Place Order
                </button>

                {/* Security Notice */}
                <div className="mt-4 flex items-center justify-center text-xs text-gray-500" suppressHydrationWarning>
                  <Lock className="h-4 w-4 mr-1" />
                  Secure checkout provided by Exclusive
                </div>

                {/* Shipping & Returns */}
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400 mr-2">
                      <path d="M10 17h4V5H2v12h3"></path>
                      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path>
                      <path d="M14 17h1"></path>
                      <circle cx="7.5" cy="17.5" r="2.5"></circle>
                      <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                    <span className="text-sm text-gray-700">Free shipping on orders over ₹4,000</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400 mr-2">
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                    <span className="text-sm text-gray-700">All major payment methods accepted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 