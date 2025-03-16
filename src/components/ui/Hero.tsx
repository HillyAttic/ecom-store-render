"use client";

import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  // Array of placeholder avatar colors
  const avatarColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <section className="relative bg-gray-100 overflow-hidden" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-16 md:py-24" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" suppressHydrationWarning>
          <div className="space-y-6" suppressHydrationWarning>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-gray-900 leading-tight" suppressHydrationWarning>
              Summer Collection 2025 Now Available
            </h1>
            <p className="text-lg text-gray-600 max-w-lg" suppressHydrationWarning>
              Explore our latest summer collection featuring breathable fabrics, vibrant colors, and designs perfect for the season. Limited time offers available!
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4" suppressHydrationWarning>
              <Link 
                href="/products" 
                className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-6 rounded-md text-center transition duration-300 ease-in-out"
              >
                Shop Summer Collection
              </Link>
              <Link 
                href="/categories" 
                className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-md border border-gray-300 text-center transition duration-300 ease-in-out"
              >
                Browse Categories
              </Link>
            </div>
            <div className="flex items-center space-x-4 pt-4" suppressHydrationWarning>
              <div className="flex -space-x-2" suppressHydrationWarning>
                {avatarColors.map((color, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center" 
                    style={{ backgroundColor: color }}
                    suppressHydrationWarning
                  >
                    <span className="text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600" suppressHydrationWarning>
                <span className="font-semibold text-gray-900" suppressHydrationWarning>3,200+</span> happy customers
              </div>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl" suppressHydrationWarning>
            <Image
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Summer Collection 2025"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-100 rounded-full opacity-70 blur-3xl" suppressHydrationWarning></div>
      <div className="absolute top-32 -right-16 w-48 h-48 bg-yellow-100 rounded-full opacity-70 blur-3xl" suppressHydrationWarning></div>
    </section>
  );
};

export default Hero; 