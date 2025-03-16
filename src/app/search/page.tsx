"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/currency';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  rating: number;
  discount?: number;
  isNew?: boolean;
  isSale?: boolean;
  description?: string;
  tags?: string[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // If there's a search query, use the search endpoint
        const endpoint = searchQuery 
          ? `/api/products?q=${encodeURIComponent(searchQuery)}` 
          : '/api/products';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const { data } = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...Array.from(new Set(data.map((p: Product) => p.category)))];
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [searchQuery]);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

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
    <div className="bg-gray-50 py-8 md:py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        {/* Search Header */}
        <div className="mb-8" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-gray-900 mb-4" suppressHydrationWarning>
            Search Results for "{searchQuery}"
          </h1>
          <div className="flex items-center justify-between" suppressHydrationWarning>
            <p className="text-gray-600" suppressHydrationWarning>
              {filteredProducts.length} products found
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              suppressHydrationWarning
            >
              <SlidersHorizontal size={20} />
              Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8" suppressHydrationWarning>
            {/* Filters */}
            <div 
              className={`md:block ${showFilters ? 'block' : 'hidden'} space-y-6 bg-white p-6 rounded-lg shadow-sm`}
              suppressHydrationWarning
            >
              {/* Categories */}
              <div suppressHydrationWarning>
                <h3 className="font-medium text-gray-900 mb-4" suppressHydrationWarning>Categories</h3>
                <div className="space-y-2" suppressHydrationWarning>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-2 py-1 rounded ${
                        selectedCategory === category
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      suppressHydrationWarning
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div suppressHydrationWarning>
                <h3 className="font-medium text-gray-900 mb-4" suppressHydrationWarning>Price Range</h3>
                <div className="space-y-4" suppressHydrationWarning>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                    suppressHydrationWarning
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600" suppressHydrationWarning>
                    <span suppressHydrationWarning>{formatCurrency(priceRange[0])}</span>
                    <span suppressHydrationWarning>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div suppressHydrationWarning>
                <h3 className="font-medium text-gray-900 mb-4" suppressHydrationWarning>Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  suppressHydrationWarning
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 100000]);
                  setSortBy('relevance');
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                suppressHydrationWarning
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>

            {/* Product Grid */}
            <div className="md:col-span-3" suppressHydrationWarning>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
                  {filteredProducts.map((product) => (
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
                        <div className="flex items-center mb-1" suppressHydrationWarning>
                          <div className="flex mr-2" suppressHydrationWarning>
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-xs text-gray-500" suppressHydrationWarning>
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                        
                        <Link href={`/products/${product.id}`} className="block">
                          <h3 className="font-medium text-gray-900 mb-1 hover:text-blue-600" suppressHydrationWarning>
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-500 mb-2" suppressHydrationWarning>
                          {product.category}
                        </p>
                        
                        <div className="flex items-center justify-between" suppressHydrationWarning>
                          <div suppressHydrationWarning>
                            <span className="font-bold text-gray-900" suppressHydrationWarning>
                              {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2" suppressHydrationWarning>
                                {formatCurrency(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => addToCart(product)}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            suppressHydrationWarning
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center" suppressHydrationWarning>
                  <h3 className="text-lg font-medium text-gray-900 mb-2" suppressHydrationWarning>
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4" suppressHydrationWarning>
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange([0, 100000]);
                      setSortBy('relevance');
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    suppressHydrationWarning
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchContent />
      </Suspense>
    </MainLayout>
  );
} 