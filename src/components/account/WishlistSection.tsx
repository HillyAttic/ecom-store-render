"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, X, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  category: string;
}

const WishlistSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample wishlist data - in a real app, this would be from an API or context
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 101,
      name: 'Premium Wireless Headphones',
      price: 12999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      inStock: true,
      category: 'Electronics',
    },
    {
      id: 102,
      name: 'Smart Fitness Watch',
      price: 8499,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      inStock: true,
      category: 'Electronics',
    },
    {
      id: 103,
      name: 'Designer Leather Handbag',
      price: 16999,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1015&q=80',
      inStock: true,
      category: 'Fashion',
    },
    {
      id: 104,
      name: 'Ultra HD Smart LED TV',
      price: 49999,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      inStock: false,
      category: 'Electronics',
    },
  ]);
  
  // Filter wishlist items based on search term
  const filteredItems = wishlistItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to remove item from wishlist
  const removeFromWishlist = (id: number) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const addToCart = (item: WishlistItem) => {
    // In a real app, this would add the item to the cart
    alert(`Added ${item.name} to cart!`);
  };
  
  return (
    <div suppressHydrationWarning>
      <div className="flex justify-between items-center mb-6" suppressHydrationWarning>
        <h2 className="text-xl font-semibold text-gray-900" suppressHydrationWarning>My Wishlist</h2>
        <div className="relative" suppressHydrationWarning>
          <input
            type="text"
            placeholder="Search wishlist..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            suppressHydrationWarning
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>
      
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden" suppressHydrationWarning>
              <div className="relative h-48" suppressHydrationWarning>
                <Link href={`/products/${item.id}`}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 text-gray-500 hover:text-red-500 shadow-sm"
                  aria-label="Remove from wishlist"
                  suppressHydrationWarning
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-4" suppressHydrationWarning>
                <div className="mb-2" suppressHydrationWarning>
                  <span className="text-xs font-medium text-gray-500" suppressHydrationWarning>{item.category}</span>
                </div>
                <Link href={`/products/${item.id}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 transition line-clamp-1" suppressHydrationWarning>
                    {item.name}
                  </h3>
                </Link>
                <div className="flex justify-between items-center" suppressHydrationWarning>
                  <span className="text-lg font-bold text-gray-900" suppressHydrationWarning>
                    {formatCurrency(item.price)}
                  </span>
                  {item.inStock ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition"
                      suppressHydrationWarning
                    >
                      <ShoppingCart size={16} className="mr-1" />
                      Add to Cart
                    </button>
                  ) : (
                    <span className="text-sm text-red-600 font-medium" suppressHydrationWarning>Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white py-16 text-center rounded-lg border border-gray-200" suppressHydrationWarning>
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900" suppressHydrationWarning>Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-gray-500" suppressHydrationWarning>
            {searchTerm 
              ? `No items matching "${searchTerm}"`
              : "Save your favorite items to your wishlist for later."
            }
          </p>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              suppressHydrationWarning
            >
              Clear search
            </button>
          )}
          
          {!searchTerm && (
            <div className="mt-6" suppressHydrationWarning>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                Discover products
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WishlistSection; 