"use client";

import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    id: 1,
    name: 'Silk Fabrics',
    description: 'Luxurious silk fabrics for premium garments',
    image: 'https://images.unsplash.com/photo-1517637382994-f02da38c6728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    itemCount: 120,
  },
  {
    id: 2,
    name: 'Cotton Materials',
    description: 'Breathable cotton fabrics for everyday clothing',
    image: 'https://images.unsplash.com/photo-1544070078-a212eda27b49?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    itemCount: 350,
  },
  {
    id: 3,
    name: 'Traditional Textiles',
    description: 'Authentic Indian fabrics with intricate designs',
    image: 'https://images.unsplash.com/photo-1522125123931-9304d91a42ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    itemCount: 210,
  },
  {
    id: 4,
    name: 'Designer Fabrics',
    description: 'Premium fabrics for haute couture and fashion',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    itemCount: 180,
  },
];

const CategorySection = () => {
  return (
    <section className="py-12 relative overflow-hidden" suppressHydrationWarning>
      {/* Exact white dot pattern as provided */}
      <div 
        className="absolute inset-0 bg-repeat" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f3f4f6'
        }}
        suppressHydrationWarning
      ></div>
      
      <div className="container relative mx-auto px-4 sm:px-6" suppressHydrationWarning>
        <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h2 className="text-3xl font-bold text-gray-900" suppressHydrationWarning>Shop by Fabric Type</h2>
            <p className="text-gray-600 mt-1" suppressHydrationWarning>Browse our wide range of premium fabrics for all your needs</p>
          </div>
          <Link 
            href="/categories" 
            className="text-rose-600 hover:text-rose-800 font-medium flex items-center"
            suppressHydrationWarning
          >
            View All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
                suppressHydrationWarning
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group"
              suppressHydrationWarning
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 h-full" suppressHydrationWarning>
                <div className="relative" suppressHydrationWarning>
                  <div className="h-40 relative overflow-hidden" suppressHydrationWarning>
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" suppressHydrationWarning></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white" suppressHydrationWarning>
                      <h3 className="text-lg font-semibold" suppressHydrationWarning>{category.name}</h3>
                      <p className="text-sm text-gray-200" suppressHydrationWarning>{category.itemCount} Products</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4" suppressHydrationWarning>
                  <p className="text-gray-600 text-sm mb-3" suppressHydrationWarning>{category.description}</p>
                  <div className="flex items-center text-rose-500 font-medium text-sm" suppressHydrationWarning>
                    <span suppressHydrationWarning>Shop Now</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      suppressHydrationWarning
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                        suppressHydrationWarning
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection; 