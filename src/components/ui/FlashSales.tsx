"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency, usdToInr } from '@/utils/currency';
import ProductDetailModal from '../product/ProductDetailModal';

// Sample flash sale fabric products
const flashSaleProducts = [
  {
    id: 101,
    name: 'Premium Banarasi Silk',
    price: 1299.99,
    originalPrice: 2499.99,
    image: 'https://images.unsplash.com/photo-1517637382994-f02da38c6728?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    discount: 48,
    timeLeft: 3600 * 4 + 1800, // 4 hours and 30 minutes in seconds
    category: 'Silk',
    description: 'Luxurious Banarasi silk fabric with intricate golden zari work. Perfect for traditional Indian attire like sarees, lehengas, and formal ethnic wear. Limited time flash sale offer!',
  },
  {
    id: 102,
    name: 'Organic Khadi Cotton',
    price: 899.99,
    originalPrice: 1799.99,
    image: 'https://images.unsplash.com/photo-1544070078-a212eda27b49?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    discount: 50,
    timeLeft: 3600 * 2 + 1200, // 2 hours and 20 minutes in seconds
    category: 'Cotton',
    description: 'Handspun and handwoven organic khadi cotton fabric. Breathable, sustainable, and eco-friendly. Ideal for summer wear and casual outfits. Special flash sale discount!',
  },
  {
    id: 103,
    name: 'Designer Jacquard Fabric',
    price: 1599.99,
    originalPrice: 2999.99,
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    discount: 47,
    timeLeft: 3600 * 5 + 2400, // 5 hours and 40 minutes in seconds
    category: 'Jacquard',
    description: 'Premium designer jacquard fabric with elegant patterns and rich texture. Perfect for upholstery, curtains, and formal attire. Grab this limited time flash sale offer!',
  },
  {
    id: 104,
    name: 'Pure Linen Collection',
    price: 1499.99,
    originalPrice: 2799.99,
    image: 'https://images.unsplash.com/photo-1528459105426-b9548367069b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    discount: 46,
    timeLeft: 3600 * 3 + 900, // 3 hours and 15 minutes in seconds
    category: 'Linen',
    description: 'Premium pure linen fabric with natural texture and excellent breathability. Perfect for summer clothing and home decor. Flash sale price for a limited time only!',
  },
];

const FlashSaleItem = ({ product }: { product: typeof flashSaleProducts[0] }) => {
  const [timeLeft, setTimeLeft] = useState(product.timeLeft);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  
  // Convert prices to INR for display
  const priceInr = product.price; // Already in INR
  const originalPriceInr = product.originalPrice; // Already in INR

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const time = formatTime(timeLeft);
  
  // Handle Add to Cart
  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price / 80, // Convert INR to USD for cart
      image: product.image,
      originalPriceUSD: product.price / 80, // Convert INR to USD for cart
    });
    
    // Show feedback
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = `${product.name} added to cart!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Create a product object for the modal
  const productForModal = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image, // Pass the single image
    images: [product.image, product.image, product.image], // Also pass the images array for backward compatibility
    description: product.description,
    rating: 4.5,
    reviews: 120,
    inStock: true,
    category: product.category,
    colors: ['#e6c9a8', '#d4a76a', '#b07d62'], // Example fabric colors
    sizes: ['1 meter', '2 meters', '5 meters', '10 meters'], // Example fabric sizes
    material: 'Premium Fabric Blend', // Example material
    pattern: 'Designer Pattern' // Example pattern
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        suppressHydrationWarning
      >
        <div className="relative" suppressHydrationWarning>
          <div className="h-48 relative overflow-hidden" suppressHydrationWarning>
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="absolute top-2 left-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded" suppressHydrationWarning>
            {product.discount}% OFF
          </div>
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded" suppressHydrationWarning>
            {product.category}
          </div>
          <button 
            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            aria-label="Quick view"
            suppressHydrationWarning
          >
            <Eye size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4" suppressHydrationWarning>
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1" suppressHydrationWarning>{product.name}</h3>
          <div className="flex items-center mb-2" suppressHydrationWarning>
            <span className="text-xl font-bold text-rose-600" suppressHydrationWarning>{formatCurrency(priceInr)}</span>
            <span className="ml-2 text-sm text-gray-500 line-through" suppressHydrationWarning>{formatCurrency(originalPriceInr)}</span>
          </div>

          <div className="flex items-center justify-between mb-3" suppressHydrationWarning>
            <div className="flex items-center text-gray-500 text-sm" suppressHydrationWarning>
              <Clock size={14} className="mr-1" />
              <span suppressHydrationWarning>Ends in: </span>
              <span className="ml-1 font-semibold text-rose-600" suppressHydrationWarning>
                {time.hours}:{time.minutes}:{time.seconds}
              </span>
            </div>
          </div>

          <button 
            onClick={(e) => handleAddToCart(e)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-md flex items-center justify-center transition-colors" 
            suppressHydrationWarning
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={productForModal}
      />
    </>
  );
};

const FlashSales = () => {
  return (
    <section className="py-12 bg-gray-50" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h2 className="text-3xl font-bold text-gray-900" suppressHydrationWarning>Flash Sales</h2>
            <p className="text-gray-600 mt-1" suppressHydrationWarning>Limited-time offers on premium fabrics!</p>
          </div>
          <Link 
            href="/flash-sales" 
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
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
          {flashSaleProducts.map((product) => (
            <FlashSaleItem key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSales; 