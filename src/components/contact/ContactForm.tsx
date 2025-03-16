"use client";

import { useState } from 'react';
import { Send } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  subject: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

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

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
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
      // Send the form data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          subject: '',
        });
        setSubmitStatus('success');
      } else {
        console.error('Form submission error:', data.error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
      {/* Name Input */}
      <div suppressHydrationWarning>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your name"
          suppressHydrationWarning
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.name}</p>
        )}
      </div>

      {/* Email Input */}
      <div suppressHydrationWarning>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="yourmail@example.com"
          suppressHydrationWarning
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.email}</p>
        )}
      </div>

      {/* Phone Input */}
      <div suppressHydrationWarning>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+1 (555) 123-4567"
          suppressHydrationWarning
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.phone}</p>
        )}
      </div>

      {/* Subject Input */}
      <div suppressHydrationWarning>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
          Bug Type *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
            errors.subject ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Website Error, Product Issue, Payment Problem"
          suppressHydrationWarning
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.subject}</p>
        )}
      </div>

      {/* Message Input */}
      <div suppressHydrationWarning>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
          Bug Description *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Please describe the issue in detail. Include steps to reproduce, expected behavior, and any error messages you received."
          suppressHydrationWarning
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-white font-medium ${
          isSubmitting
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
        suppressHydrationWarning
      >
        {isSubmitting ? (
          <div className="flex items-center" suppressHydrationWarning>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" suppressHydrationWarning></div>
            Submitting...
          </div>
        ) : (
          <div className="flex items-center" suppressHydrationWarning>
            <Send className="w-5 h-5 mr-2" />
            Submit Bug Report
          </div>
        )}
      </button>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg" suppressHydrationWarning>
          <p className="text-green-800" suppressHydrationWarning>
            Thank you for reporting this issue! Our development team will investigate it as soon as possible.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" suppressHydrationWarning>
          <p className="text-red-800" suppressHydrationWarning>
            Sorry, there was an error sending your message. Please try again later.
          </p>
        </div>
      )}
    </form>
  );
};

export default ContactForm; 