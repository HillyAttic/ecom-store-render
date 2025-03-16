"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Save } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin');
    } else if (status === "authenticated" && session?.user) {
      // In a real app, you would fetch user data from an API
      const nameParts = session.user.name?.split(' ') || ['', ''];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email || '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      });
      setIsLoading(false);
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to an API
    alert('Settings saved successfully!');
  };

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your account settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
                <div className="flex items-center space-x-4 mb-8">
                  {session.user.image ? (
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={18} />
                    <span>Profile Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'address' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin size={18} />
                    <span>Address</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'security' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Lock size={18} />
                    <span>Security</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bell size={18} />
                    <span>Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'privacy' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Shield size={18} />
                    <span>Privacy</span>
                  </button>
                </nav>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    href="/account"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Back to Account
                  </Link>
                </div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed (Google authentication)</p>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Save size={16} />
                        <span>Save Changes</span>
                      </button>
                    </form>
                  </div>
                )}
                
                {activeTab === 'address' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-6">
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Enter your street address"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="Enter your city"
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="Enter your state"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="Enter your ZIP code"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            disabled
                          />
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Save size={16} />
                        <span>Save Changes</span>
                      </button>
                    </form>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-yellow-800">
                        You are signed in with Google. Password management is handled through your Google account.
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        disabled
                      >
                        Managed by Google
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Connected Accounts</h3>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-3">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Google</p>
                            <p className="text-sm text-gray-500">{session.user.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                    <p className="text-gray-600 mb-6">
                      Manage how you receive notifications from our store.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Order Updates</p>
                          <p className="text-sm text-gray-500">Receive notifications about your order status</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Promotions</p>
                          <p className="text-sm text-gray-500">Receive notifications about sales and special offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Account Activity</p>
                          <p className="text-sm text-gray-500">Receive notifications about account activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                )}
                
                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                    <p className="text-gray-600 mb-6">
                      Manage your privacy settings and data usage preferences.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Data Collection</p>
                          <p className="text-sm text-gray-500">Allow us to collect data about your shopping preferences</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Personalized Recommendations</p>
                          <p className="text-sm text-gray-500">Receive personalized product recommendations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Cookies</p>
                          <p className="text-sm text-gray-500">Allow us to use cookies to improve your experience</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 