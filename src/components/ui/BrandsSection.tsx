"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const sellers = [
  {
    id: 1,
    name: 'Fabindia',
    logo: '/brands/fabindia.svg',
  },
  {
    id: 2,
    name: 'Sabyasachi',
    logo: '/brands/sabyasachi.svg',
  },
  {
    id: 3,
    name: 'Anita Dongre',
    logo: '/brands/anita-dongre.svg',
  },
  {
    id: 4,
    name: 'Ritu Kumar',
    logo: '/brands/ritu-kumar.svg',
  },
  {
    id: 5,
    name: 'Manish Malhotra',
    logo: '/brands/manish-malhotra.svg',
  },
  {
    id: 6,
    name: 'Raymond',
    logo: '/brands/raymond.svg',
  },
  {
    id: 7,
    name: 'Soch',
    logo: '/brands/soch.svg',
  },
  {
    id: 8,
    name: 'Biba',
    logo: '/brands/biba.svg',
  },
];

// Since we don't have actual SVG files, we'll use placeholder colored divs with seller names
const BrandsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    // Only apply animation if content is wider than container and component is mounted
    if (scrollWidth > clientWidth) {
      let scrollPosition = 0;
      let animationFrameId: number;
      const scrollSpeed = 0.5; // pixels per frame
      let lastTimestamp: number;

      const scroll = (timestamp: number) => {
        if (!scrollContainer) return;
        
        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        
        // Ensure smooth animation by considering frame time
        scrollPosition += (scrollSpeed * deltaTime) / 16.67; // 60 FPS target
        
        // Reset position when we've scrolled through half the content
        if (scrollPosition >= scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
        lastTimestamp = timestamp;
        animationFrameId = requestAnimationFrame(scroll);
      };

      animationFrameId = requestAnimationFrame(scroll);
      
      // Cleanup function
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trusted by Top Sellers</h2>
        </div>

        <div className="relative overflow-hidden">
          {/* Gradient fade on left */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent"></div>
          
          {/* Scrolling sellers container */}
          <div 
            ref={scrollRef}
            className="flex items-center space-x-12 py-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Double the sellers for infinite scroll effect */}
            {[...sellers, ...sellers].map((seller, index) => (
              <div 
                key={`${seller.id}-${index}`} 
                className="flex-shrink-0 flex flex-col items-center justify-center h-20 w-36"
              >
                {/* Placeholder colored div instead of actual SVG */}
                <div 
                  className="h-14 w-full rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                  style={{ 
                    backgroundColor: `hsl(${(seller.id * 45) % 360}, 65%, 55%)`,
                  }}
                >
                  {seller.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient fade on right */}
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection; 