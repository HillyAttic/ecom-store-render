"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingBag, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/currency';
import { useCart } from '@/context/CartContext';

// Define product type
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  description: string;
  tags: string[];
}

// Define cart item type
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const { data } = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      } as CartItem);
    }
  };

  // Render stars for product rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index}
        size={18}
        className={index < Math.floor(rating) 
          ? "fill-yellow-400 text-yellow-400" 
          : index < rating 
            ? "fill-yellow-400 text-yellow-400 opacity-50" 
            : "text-gray-300"
        }
      />
    ));
  };

  // Calculate discount percentage
  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft size={16} className="mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-900">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-blue-900">Products</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href={`/products?category=${product.category}`} className="text-gray-500 hover:text-blue-900">{product.category}</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.originalPrice && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {calculateDiscount(product.originalPrice, product.price)}% OFF
              </div>
            )}
            {product.isNew && (
              <div className="absolute top-4 right-4 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                NEW
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-500 uppercase">{product.category} • {product.subcategory}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderStars(product.rating)}
              </div>
              <span className="text-gray-600">({product.rating.toFixed(1)})</span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-blue-900">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="ml-3 text-lg text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-green-600 mt-1">You save {formatCurrency(product.originalPrice - product.price)} ({calculateDiscount(product.originalPrice, product.price)}%)</p>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">Quantity</label>
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 border-y border-gray-300 text-center text-gray-700 focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center"
              >
                <ShoppingBag size={18} className="mr-2" />
                Add to Cart
              </button>
              <button
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-md font-medium flex items-center justify-center"
              >
                <Heart size={18} className="mr-2" />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 