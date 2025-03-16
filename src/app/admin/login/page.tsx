"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, User, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { signIn } from '@/lib/firebase-auth';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const token = Cookies.get('adminToken');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use Firebase Authentication
      const userCredential = await signIn(formData.email, formData.password);
      
      // Get the user token
      const token = await userCredential.user.getIdToken();
      
      // Store the token and user information in cookies
      Cookies.set('adminToken', token, { expires: 1 }); // Expires in 1 day
      Cookies.set('adminUsername', userCredential.user.email || '', { expires: 1 });
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      // Handle Firebase auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8" suppressHydrationWarning>
      <div className="sm:mx-auto sm:w-full sm:max-w-md" suppressHydrationWarning>
        <div className="flex justify-center" suppressHydrationWarning>
          <Link href="/">
            <div className="flex items-center space-x-3" suppressHydrationWarning>
              <div className="relative" suppressHydrationWarning>
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center shadow-md" suppressHydrationWarning>
                  <span className="text-white text-xl font-serif font-bold" suppressHydrationWarning>H</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full shadow-sm border border-white" suppressHydrationWarning></div>
              </div>
              <div className="flex flex-col" suppressHydrationWarning>
                <div className="font-bold text-2xl text-blue-900 tracking-wide" suppressHydrationWarning>HANDLOOM</div>
                <div className="text-xs text-gray-600 -mt-1 tracking-wider" suppressHydrationWarning>PREMIUM FABRICS</div>
              </div>
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" suppressHydrationWarning>
          Admin Panel Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600" suppressHydrationWarning>
          Secure access for authorized administrators only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" suppressHydrationWarning>
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200" suppressHydrationWarning>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded" suppressHydrationWarning>
              <div className="flex items-center" suppressHydrationWarning>
                <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700" suppressHydrationWarning>{error}</p>
              </div>
            </div>
          )}
          
          {/* API Key Debug Info */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800">Firebase Debug Info</h3>
            <p className="text-xs mt-1 text-yellow-700">
              API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
                `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 8)}...` : 
                "Missing API Key"}
            </p>
            <p className="text-xs mt-1 text-yellow-700">
              <a href="/admin/dashboard/test-login" className="underline">Try alternative login method</a>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit} suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning>
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Admin email"
                  value={formData.email}
                  onChange={handleChange}
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div suppressHydrationWarning>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" suppressHydrationWarning>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Secure password"
                  value={formData.password}
                  onChange={handleChange}
                  suppressHydrationWarning
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center" suppressHydrationWarning>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    suppressHydrationWarning
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between" suppressHydrationWarning>
              <div className="flex items-center" suppressHydrationWarning>
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900" suppressHydrationWarning>
                  Remember me
                </label>
              </div>

              <div className="text-sm" suppressHydrationWarning>
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500" suppressHydrationWarning>
                  Forgot password?
                </a>
              </div>
            </div>

            <div suppressHydrationWarning>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                suppressHydrationWarning
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6" suppressHydrationWarning>
            <div className="relative" suppressHydrationWarning>
              <div className="absolute inset-0 flex items-center" suppressHydrationWarning>
                <div className="w-full border-t border-gray-300" suppressHydrationWarning></div>
              </div>
              <div className="relative flex justify-center text-sm" suppressHydrationWarning>
                <span className="px-2 bg-white text-gray-500" suppressHydrationWarning>Security Notice</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-center text-gray-500" suppressHydrationWarning>
              This is a secure area. All login attempts are monitored and recorded.
              Unauthorized access is strictly prohibited and may result in legal action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 