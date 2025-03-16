"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^\S+@\S+\.\S+$/.test(email)) {
      // In a real app, you would send this to your API
      console.log('Newsletter subscription:', email);
      setIsSubscribed(true);
      setEmail('');
      
      // Reset the success message after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300" suppressHydrationWarning>
      {/* Newsletter Section */}
      <div className="border-b border-gray-800" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <h3 className="text-xl font-semibold text-white mb-2" suppressHydrationWarning>Subscribe to Our Newsletter</h3>
              <p className="text-gray-400" suppressHydrationWarning>Stay updated with our latest offers and products</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto" suppressHydrationWarning>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full md:w-64 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg flex items-center transition duration-300"
                suppressHydrationWarning
              >
                <Send className="w-5 h-5 mr-2" suppressHydrationWarning />
                <span suppressHydrationWarning>Subscribe</span>
              </button>
            </form>
          </div>
          {isSubscribed && (
            <div className="mt-4 text-center" suppressHydrationWarning>
              <p className="text-green-400 text-sm" suppressHydrationWarning>
                Thank you for subscribing to our newsletter!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" suppressHydrationWarning>
          {/* Company Info */}
          <div suppressHydrationWarning>
            <h2 className="text-xl font-serif italic text-white mb-4" suppressHydrationWarning>Handloom</h2>
            <p className="text-gray-400 mb-4" suppressHydrationWarning>
              Your premier destination for timeless fashion and contemporary style. Discover curated collections that blend elegance with modern trends.
            </p>
            <div className="flex space-x-4" suppressHydrationWarning>
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                <Facebook className="w-5 h-5" suppressHydrationWarning />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                <Twitter className="w-5 h-5" suppressHydrationWarning />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                <Instagram className="w-5 h-5" suppressHydrationWarning />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                <Linkedin className="w-5 h-5" suppressHydrationWarning />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold text-white mb-4" suppressHydrationWarning>Quick Links</h3>
            <ul className="space-y-3" suppressHydrationWarning>
              <li suppressHydrationWarning>
                <Link href="/about" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                  About Us
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/contact" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                  Contact Us
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/faq" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                  FAQ
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                  Privacy Policy
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/terms" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                  Terms of Use
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition duration-300" suppressHydrationWarning>
                  Shipping Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold text-white mb-4" suppressHydrationWarning>Support</h3>
            <ul className="space-y-3" suppressHydrationWarning>
              <li className="flex items-center" suppressHydrationWarning>
                <Phone className="w-5 h-5 mr-2 text-blue-500" suppressHydrationWarning />
                <span suppressHydrationWarning>+91 98765 43210</span>
              </li>
              <li className="flex items-center" suppressHydrationWarning>
                <Mail className="w-5 h-5 mr-2 text-blue-500" suppressHydrationWarning />
                <span suppressHydrationWarning>handloomdashboard@gmail.com</span>
              </li>
              <li className="flex items-start" suppressHydrationWarning>
                <MapPin className="w-5 h-5 mr-2 text-blue-500 mt-1" suppressHydrationWarning />
                <span suppressHydrationWarning>
                  123 Nirman Vihar<br />
                  New Delhi, DL 10001<br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-6" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row justify-between items-center" suppressHydrationWarning>
            <p className="text-gray-400 text-sm" suppressHydrationWarning>
              © {new Date().getFullYear()} handloom. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0" suppressHydrationWarning>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition duration-300" suppressHydrationWarning>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition duration-300" suppressHydrationWarning>
                Terms of Use
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition duration-300" suppressHydrationWarning>
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 