"use client";

import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/components/contact/ContactForm';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: [
        '+91 98765 43210',
        '+91 11 2345 6789',
      ],
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'handloomdashboard@gmail.com',
        'support@handloom.com',
        'sales@handloom.com',
      ],
    },
    {
      icon: MapPin,
      title: 'Location',
      details: [
        'Nirman Vihar',
        'New Delhi, 10001, India',
      ],
    },
    {
      icon: Clock,
      title: 'Hours',
      details: [
        'Monday - Saturday: 10AM - 8PM',
        'Sunday: 11AM - 6PM',
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 md:py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16" suppressHydrationWarning>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" suppressHydrationWarning>
              Report Bug
            </h1>
            <p className="text-lg text-gray-600" suppressHydrationWarning>
              Found an issue with our website or products? Let us know and we'll fix it as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12" suppressHydrationWarning>
            {/* Contact Information */}
            <div className="md:col-span-1 space-y-6" suppressHydrationWarning>
              {contactInfo.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  suppressHydrationWarning
                >
                  <div className="flex items-center mb-4" suppressHydrationWarning>
                    <item.icon className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900" suppressHydrationWarning>
                      {item.title}
                    </h3>
                  </div>
                  <div className="space-y-2 text-gray-600" suppressHydrationWarning>
                    {item.details.map((detail, idx) => (
                      <p key={idx} suppressHydrationWarning>{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2" suppressHydrationWarning>
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100" suppressHydrationWarning>
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100" suppressHydrationWarning>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754725782!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi%2C%20India!5e0!3m2!1sen!2sus!4v1686743879157!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 