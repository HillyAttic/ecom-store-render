"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const SignUpForm = () => {
  const { signup } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Use our auth context signup function
      const success = await signup(formData.name, formData.email, formData.password);
      
      if (success) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleGoogleSignUp = () => {
    // Google sign up logic would go here
    alert('Google sign up would be implemented here');
  };

  return (
    <div className="w-full" suppressHydrationWarning>
      {submitStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center" suppressHydrationWarning>
          <svg 
            className="w-16 h-16 text-green-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2" suppressHydrationWarning>
            Account Created Successfully!
          </h3>
          <p className="text-gray-600 mb-4" suppressHydrationWarning>
            Thank you for signing up. You can now login with your credentials.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            suppressHydrationWarning
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
          {/* Name Input */}
          <div suppressHydrationWarning>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-1"
              suppressHydrationWarning
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
              suppressHydrationWarning
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div suppressHydrationWarning>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
              suppressHydrationWarning
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
              suppressHydrationWarning
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div suppressHydrationWarning>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
              suppressHydrationWarning
            >
              Password
            </label>
            <div className="relative" suppressHydrationWarning>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                suppressHydrationWarning
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500" suppressHydrationWarning>
                Password must be at least 8 characters with uppercase and number
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium text-white ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition`}
            suppressHydrationWarning
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4" suppressHydrationWarning>
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 flex items-center justify-center space-x-2 hover:bg-gray-50 transition"
            suppressHydrationWarning
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            <span className="text-gray-700">Sign up with Google</span>
          </button>

          {/* Login Link */}
          <div className="text-center mt-4" suppressHydrationWarning>
            <p className="text-gray-600" suppressHydrationWarning>
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                suppressHydrationWarning
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4" suppressHydrationWarning>
              There was an error creating your account. Please try again.
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default SignUpForm; 