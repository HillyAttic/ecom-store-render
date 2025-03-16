"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Heart, Share2, ShoppingCart, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    price: number;
    images?: string[];
    image?: string;
    description: string;
    rating: number;
    reviews?: number;
    inStock?: boolean;
    category?: string;
    colors?: string[];
    sizes?: string[];
    material?: string;
    pattern?: string;
    originalPrice?: number;
  };
}

const ProductDetailModal = ({ isOpen, onClose, product }: ProductDetailModalProps) => {
  // Create an images array from either product.images or a single product.image
  const productImages = product.images || (product.image ? [product.image] : []);
  
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImages[0] || '',
        color: selectedColor,
        size: selectedSize,
        originalPrice: product.originalPrice
      },
      quantity
    );
    onClose();
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    if (productImages.length <= 1) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (productImages.length <= 1) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  // Default placeholder image if no images are available
  const placeholderImage = "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Product Images */}
          <div className="relative">
            <div className="relative h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={productImages[currentImageIndex] || placeholderImage}
                alt={product.name}
                fill
                className="object-cover"
              />
              
              {/* Image navigation buttons */}
              {productImages.length > 1 && (
                <>
                  <button 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail images */}
            {productImages.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover h-full w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStars()}
                </div>
                <span className="text-sm text-gray-500">({product.reviews || 0} Reviews)</span>
              </div>
              <div className="mt-1">
                <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-gray-500 text-sm line-through">₹{product.originalPrice.toLocaleString()}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Free shipping on orders over ₹1000</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Product Attributes */}
            <div className="space-y-4 mb-6">
              {/* Material */}
              {product.material && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Material</h3>
                  <p className="text-gray-700">{product.material}</p>
                </div>
              )}

              {/* Pattern */}
              {product.pattern && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Pattern</h3>
                  <p className="text-gray-700">{product.pattern}</p>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Color</h3>
                  <div className="flex space-x-2 mt-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border ${
                          selectedColor === color ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select ${color} color`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          selectedSize === size 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 py-1 text-gray-800">{quantity}</span>
                <button
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
              <button
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">SKU: {product.id.toString().padStart(6, '0')}</span>
                {product.category && <span>Category: {product.category}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal; 