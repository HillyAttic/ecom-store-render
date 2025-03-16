"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency, validatePrice, calculateDiscountPercentage } from '@/utils/currency';
import ProductDetailModal from './ProductDetailModal';

interface ProductCardProps {
  id: number;
  name: string;
  price: number; // Price in INR
  originalPrice?: number; // Original price in INR
  image: string;
  category?: string;
  rating?: number;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  description?: string;
  onAddToCart?: () => void; // Optional callback for adding to cart
}

const ProductCard = ({ 
  id, 
  name, 
  price, // Price in INR
  originalPrice, // Original price in INR
  image, 
  category = "", 
  rating = 4, 
  isNew = false, 
  isSale = false,
  discount = 0,
  description = "Premium quality fabric with elegant design and comfortable texture. Perfect for various occasions and seasons.",
  onAddToCart
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Validate prices
  const validatedPrice = validatePrice(price);
  const validatedOriginalPrice = originalPrice ? validatePrice(originalPrice) : undefined;

  // Calculate discount if original price exists
  const calculatedDiscount = validatedOriginalPrice 
    ? calculateDiscountPercentage(validatedOriginalPrice, validatedPrice)
    : 0;

  // Calculate a deterministic number of reviews based on the product ID
  const reviewCount = 10 + (id * 7) % 90;

  // Handle Add to Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal when clicking add to cart
    
    // Use the provided callback if available
    if (onAddToCart) {
      onAddToCart();
    } else {
      // Default behavior
      addToCart({
        id,
        name,
        price: validatedPrice, // Store price in INR
        image,
        originalPrice: validatedOriginalPrice // Store original price in INR if available
      });
      
      // Show feedback
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
      notification.textContent = `${name} added to cart!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    
    const product = {
      id,
      name,
      price: validatedPrice,
      originalPrice: validatedOriginalPrice,
      image,
      category,
      rating,
      description
    };
    
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div 
      className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsModalOpen(true)}
    >
      <div className="relative w-full pt-[100%] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className={`transition-transform duration-500 object-cover ${isHovered ? 'scale-110' : 'scale-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
          )}
          {calculatedDiscount > 0 && (
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{calculatedDiscount}%
            </span>
          )}
        </div>
        {category && (
          <span className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {category}
          </span>
        )}
        <div className={`absolute bottom-2 right-2 flex space-x-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
            onClick={handleWishlistToggle}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isInWishlist(id) ? 'fill-rose-600 text-rose-600' : 'text-gray-600'}`} />
          </button>
          <button 
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-gray-800 font-medium text-base mb-1.5 hover:text-rose-600 transition line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center mb-1.5">
          <div className="flex mr-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center">
            <span className="text-gray-900 font-bold text-sm">{formatCurrency(validatedPrice)}</span>
            {validatedOriginalPrice && (
              <span className="text-gray-500 text-xs line-through ml-1.5">
                {formatCurrency(validatedOriginalPrice)}
              </span>
            )}
          </div>
          <button
            className="bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 transition-colors flex items-center justify-center"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          id,
          name,
          price: validatedPrice,
          originalPrice: validatedOriginalPrice,
          image,
          category,
          rating,
          description,
          reviews: reviewCount,
          inStock: true
        }}
      />
    </div>
  );
};

export default ProductCard; 