"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, X, Star, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  category: string;
  rating: number;
  addedDate: string;
}

interface WishlistItemsProps {
  onRemoveItem: () => void;
}

const WishlistItems = ({ onRemoveItem }: WishlistItemsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample wishlist data - in a real app, this would come from an API or context
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 101,
      name: 'Premium Wireless Headphones',
      price: 12999,
      originalPrice: 16999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      inStock: true,
      category: 'Electronics',
      rating: 4.5,
      addedDate: '2023-12-10',
    },
    {
      id: 102,
      name: 'Smart Fitness Watch',
      price: 8499,
      originalPrice: 9999,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      inStock: true,
      category: 'Electronics',
      rating: 4.2,
      addedDate: '2023-12-05',
    },
    {
      id: 103,
      name: 'Designer Leather Handbag',
      price: 16999,
      originalPrice: 22999,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1015&q=80',
      inStock: true,
      category: 'Fashion',
      rating: 4.7,
      addedDate: '2023-11-28',
    },
    {
      id: 104,
      name: 'Ultra HD Smart LED TV',
      price: 49999,
      originalPrice: 64999,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      inStock: false,
      category: 'Electronics',
      rating: 4.8,
      addedDate: '2023-11-15',
    },
  ]);
  
  // Filter wishlist items based on search term
  const filteredItems = wishlistItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to remove item from wishlist
  const removeFromWishlist = (id: number) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
    // Notify parent component about removal
    onRemoveItem();
  };
  
  const addToCart = (item: WishlistItem) => {
    // In a real app, this would add the item to the cart
    alert(`Added ${item.name} to cart!`);
  };

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
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6" suppressHydrationWarning>
      {/* Search and sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" suppressHydrationWarning>
        <div className="relative w-full sm:w-auto" suppressHydrationWarning>
          <input
            type="text"
            placeholder="Search in wishlist..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            suppressHydrationWarning
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="flex items-center" suppressHydrationWarning>
          <label className="text-sm text-gray-600 mr-2" suppressHydrationWarning>Sort by:</label>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            suppressHydrationWarning
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>
      
      {filteredItems.length > 0 ? (
        <div className="space-y-6" suppressHydrationWarning>
          {filteredItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row" suppressHydrationWarning>
              {/* Product Image */}
              <div className="relative w-full md:w-60 h-48 md:h-auto flex-shrink-0" suppressHydrationWarning>
                <Link href={`/products/${item.id}`}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" suppressHydrationWarning>
                    <span className="text-white font-medium px-3 py-1 bg-red-600 rounded" suppressHydrationWarning>
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="flex-grow p-4 md:p-6 flex flex-col" suppressHydrationWarning>
                <div className="flex justify-between items-start" suppressHydrationWarning>
                  <div suppressHydrationWarning>
                    <div className="flex items-center" suppressHydrationWarning>
                      <span className="text-sm text-gray-500 bg-gray-100 rounded px-2 py-0.5 mr-2" suppressHydrationWarning>
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500" suppressHydrationWarning>
                        Added on {formatDate(item.addedDate)}
                      </span>
                    </div>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2 hover:text-blue-600 transition-colors" suppressHydrationWarning>
                        {item.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mt-2" suppressHydrationWarning>
                      <div className="flex mr-2" suppressHydrationWarning>
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-sm text-gray-500" suppressHydrationWarning>
                        ({item.rating.toFixed(1)})
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Remove from wishlist"
                    suppressHydrationWarning
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex items-end justify-between mt-auto pt-4" suppressHydrationWarning>
                  <div suppressHydrationWarning>
                    <div className="flex items-center" suppressHydrationWarning>
                      <span className="text-xl font-bold text-gray-900" suppressHydrationWarning>
                        {formatCurrency(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through" suppressHydrationWarning>
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>
                    {item.originalPrice && (
                      <span className="text-sm font-medium text-green-600" suppressHydrationWarning>
                        Save {formatCurrency(item.originalPrice - item.price)} ({Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%)
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => item.inStock && addToCart(item)}
                    disabled={!item.inStock}
                    className={`${
                      item.inStock 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-200 cursor-not-allowed text-gray-500'
                    } px-4 py-2 rounded-lg font-medium transition-colors flex items-center`}
                    suppressHydrationWarning
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center" suppressHydrationWarning>
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900" suppressHydrationWarning>No items found</h3>
          <p className="mt-1 text-sm text-gray-500" suppressHydrationWarning>
            {searchTerm 
              ? `No items matching "${searchTerm}"`
              : "Your wishlist is empty. Start shopping and save items you love!"
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
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                suppressHydrationWarning
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WishlistItems; 