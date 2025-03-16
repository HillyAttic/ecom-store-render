"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/currency';

export default function WishlistPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
    
    // Show feedback
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = `${product.name} added to cart!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              <span className="text-sm font-medium">{wishlistItems.length} items</span>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-gray-400" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Save items you love to your wishlist and review them anytime.</p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                    <div className="flex items-center mb-3">
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(item.price)}</span>
                      {item.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 