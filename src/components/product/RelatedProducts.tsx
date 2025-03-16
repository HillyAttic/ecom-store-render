"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface RelatedProductsProps {
  category: string;
  excludeId?: string | number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  discount?: number;
}

const RelatedProducts = ({ category, excludeId }: RelatedProductsProps) => {
  // In a real app, this would be fetched from an API based on the category
  const products: Product[] = [
    {
      id: 401,
      name: 'Noise-Canceling Earbuds',
      price: 8999,
      originalPrice: 11999,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3',
      category: 'Electronics',
      rating: 4.3,
      discount: 25,
    },
    {
      id: 402,
      name: 'Wireless Speaker',
      price: 6999,
      originalPrice: 9999,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3',
      category: 'Electronics',
      rating: 4.5,
      discount: 30,
    },
    {
      id: 403,
      name: 'Gaming Headset',
      price: 14999,
      originalPrice: 19999,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3',
      category: 'Electronics',
      rating: 4.8,
      discount: 25,
    },
    {
      id: 404,
      name: 'Bluetooth Soundbar',
      price: 24999,
      originalPrice: 29999,
      image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?ixlib=rb-4.0.3',
      category: 'Electronics',
      rating: 4.6,
      discount: 16,
    },
  ].filter(product => product.id.toString() !== excludeId?.toString());

  // Helper to render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index}
        size={14}
        className={index < Math.floor(rating) 
          ? "fill-yellow-400 text-yellow-400" 
          : index < rating 
            ? "fill-yellow-400 text-yellow-400 opacity-50" 
            : "text-gray-300"
        }
      />
    ));
  };

  const addToCart = (product: Product) => {
    // In a real app, this would add the item to the cart
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-transform hover:shadow-md hover:translate-y-[-5px]"
          suppressHydrationWarning
        >
          {/* Product Image */}
          <Link href={`/products/${product.id}`} className="block relative aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.discount && (
              <div 
                className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded"
                suppressHydrationWarning
              >
                {product.discount}% OFF
              </div>
            )}
          </Link>

          {/* Product Info */}
          <div className="p-4" suppressHydrationWarning>
            <div className="mb-1" suppressHydrationWarning>
              <span className="text-xs text-gray-500 uppercase" suppressHydrationWarning>
                {product.category}
              </span>
            </div>
            
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[48px] hover:text-blue-600 transition-colors" suppressHydrationWarning>
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center mb-2" suppressHydrationWarning>
              <div className="flex mr-2" suppressHydrationWarning>
                {renderStars(product.rating)}
              </div>
              <span className="text-xs text-gray-500" suppressHydrationWarning>
                ({product.rating.toFixed(1)})
              </span>
            </div>

            <div className="flex items-center justify-between" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <span className="text-lg font-bold text-gray-900" suppressHydrationWarning>
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="ml-2 text-sm text-gray-500 line-through" suppressHydrationWarning>
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              <button
                onClick={() => addToCart(product)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                suppressHydrationWarning
              >
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedProducts; 