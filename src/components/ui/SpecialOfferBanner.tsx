"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const SpecialOfferBanner = () => {
  // Set the countdown date (24 hours from now)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime.hours === 0 && prevTime.minutes === 0 && prevTime.seconds === 0) {
          clearInterval(timer);
          return prevTime;
        }
        
        const newSeconds = prevTime.seconds - 1;
        const newMinutes = newSeconds < 0 ? prevTime.minutes - 1 : prevTime.minutes;
        const newHours = newMinutes < 0 ? prevTime.hours - 1 : prevTime.hours;

        return {
          hours: newHours < 0 ? 23 : newHours,
          minutes: newMinutes < 0 ? 59 : newMinutes,
          seconds: newSeconds < 0 ? 59 : newSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden relative" suppressHydrationWarning>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" suppressHydrationWarning>
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} suppressHydrationWarning></div>
      </div>

      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8" suppressHydrationWarning>
          <div className="md:w-1/2 text-center md:text-left" suppressHydrationWarning>
            <span className="inline-block bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-4" suppressHydrationWarning>
              SUMMER SALE - LIMITED TIME OFFER
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" suppressHydrationWarning>
              Hot Summer Sale: Up to 50% Off on Selected Items!
            </h2>
            <p className="text-gray-100 mb-6 text-lg" suppressHydrationWarning>
              Beat the heat with cool deals! Shop our summer collection and enjoy massive discounts on seasonal favorites before they're gone!
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center md:justify-start mb-6" suppressHydrationWarning>
              <div className="flex items-center gap-4" suppressHydrationWarning>
                <Clock size={24} className="text-yellow-300" />
                <div className="flex gap-2" suppressHydrationWarning>
                  <div className="bg-gray-800 rounded-lg px-3 py-2 text-center min-w-[60px]" suppressHydrationWarning>
                    <span className="text-2xl font-bold text-white" suppressHydrationWarning>{formatTime(timeLeft.hours)}</span>
                    <p className="text-xs text-gray-400" suppressHydrationWarning>Hours</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-3 py-2 text-center min-w-[60px]" suppressHydrationWarning>
                    <span className="text-2xl font-bold text-white" suppressHydrationWarning>{formatTime(timeLeft.minutes)}</span>
                    <p className="text-xs text-gray-400" suppressHydrationWarning>Minutes</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-3 py-2 text-center min-w-[60px]" suppressHydrationWarning>
                    <span className="text-2xl font-bold text-white" suppressHydrationWarning>{formatTime(timeLeft.seconds)}</span>
                    <p className="text-xs text-gray-400" suppressHydrationWarning>Seconds</p>
                  </div>
                </div>
              </div>
            </div>

            <Link 
              href="/summer-sale" 
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6 py-3 rounded-lg transition duration-300 ease-in-out"
              suppressHydrationWarning
            >
              Shop Summer Sale
            </Link>
          </div>

          <div className="md:w-1/2 relative" suppressHydrationWarning>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden" suppressHydrationWarning>
              <Image
                src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1215&q=80"
                alt="Summer Sale"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-transparent" suppressHydrationWarning></div>
              <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-lg" suppressHydrationWarning>
                50% OFF
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOfferBanner; 