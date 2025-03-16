"use client";

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    role: 'Garment Manufacturer, Delhi',
    content: "Fashion Forever has transformed our sourcing process. The quality of fabrics is exceptional, and their B2B pricing is very competitive. Their timely delivery has helped us meet our production deadlines consistently. We've been working with them for over two years now.",
    rating: 5,
    color: 'hsl(0, 70%, 60%)', // Red
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Boutique Owner, Mumbai',
    content: "As a boutique owner specializing in designer wear, I need high-quality fabrics that stand out. Fashion Forever offers an impressive range of premium textiles that my customers love. Their silk and cotton varieties are particularly exceptional. The bulk ordering process is seamless.",
    rating: 5,
    color: 'hsl(120, 70%, 60%)', // Green
  },
  {
    id: 3,
    name: 'Vikram Mehta',
    role: 'Textile Wholesaler, Surat',
    content: "Fashion Forever has been our trusted supplier for various fabric needs. Their extensive catalog of materials, from traditional to modern designs, helps us cater to diverse market demands. The consistency in quality across batches is remarkable.",
    rating: 4,
    color: 'hsl(240, 70%, 60%)', // Blue
  },
  {
    id: 4,
    name: 'Ananya Reddy',
    role: 'Fashion Designer, Bangalore',
    content: "I source all my specialty fabrics from Fashion Forever for my seasonal collections. Their range of eco-friendly and sustainable textiles has helped my brand establish a unique identity in the market. Their team understands the specific requirements of designers.",
    rating: 5,
    color: 'hsl(60, 70%, 60%)', // Yellow
  },
  {
    id: 5,
    name: 'Sunil Agarwal',
    role: 'Apparel Exporter, Tirupur',
    content: "As an exporter dealing with international clients, fabric quality and consistency are paramount. Fashion Forever has been instrumental in helping us meet global standards. Their documentation and certification for exports are always in order, making our job easier.",
    rating: 4,
    color: 'hsl(300, 70%, 60%)', // Purple
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-rose-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our valued B2B customers about their experience sourcing fabrics and textiles from Fashion Forever.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Current Testimonial */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div 
                className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-rose-100 flex-shrink-0 flex items-center justify-center" 
                style={{ backgroundColor: testimonials[activeIndex].color }}
              >
                <span className="text-white text-2xl font-bold">{testimonials[activeIndex].name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < testimonials[activeIndex].rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonials[activeIndex].content}"</p>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonials[activeIndex].name}</h4>
                  <p className="text-sm text-gray-500">{testimonials[activeIndex].role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeIndex === index ? 'bg-rose-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 