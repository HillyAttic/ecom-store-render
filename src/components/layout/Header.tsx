"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ShoppingBag, User, Heart, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import UserProfile from "@/components/user/UserProfile";

// Custom debounce function
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
};

// Define product type
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  description: string;
  tags?: string[];
}

// Categorized product data for better recommendations
const productCategories = {
  'silk': [1],
  'cotton': [2],
  'traditional': [3],
  'linen': [4],
  'georgette': [5],
  'indian': [1, 3],
  'premium': [1],
  'luxury': [1],
  'lightweight': [3, 4, 5],
  'soft': [1],
  'elegant': [5],
  'casual': [2],
  'sustainable': [2, 4],
  'eco-friendly': [2, 4]
};

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Handle scroll event to change header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function with proper cleanup and optimization
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setRelatedProducts([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch from API with error handling and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(
          `/api/products?q=${encodeURIComponent(query)}&limit=10`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Search failed');
        
        const { data } = await response.json();
        
        // Split results into direct and related matches using memoization
        const directMatches = data.filter((product: Product) => {
          const searchTerms = query.toLowerCase().split(' ');
          const productName = product.name.toLowerCase();
          const productCategory = product.category.toLowerCase();
          
          return searchTerms.every(term => 
            productName.includes(term) || productCategory.includes(term)
          );
        });
        
        const relatedMatches = data.filter((product: Product) => 
          !directMatches.some((match: Product) => match.id === product.id)
        );
        
        setSuggestions(directMatches);
        setRelatedProducts(relatedMatches);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Search request aborted');
        } else {
          console.error('Search error:', error);
        }
        // If API fails, show empty results
        setSuggestions([]);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms debounce
    []
  );

  // Save recent searches with limit
  const saveRecentSearch = useCallback((query: string) => {
    const maxRecentSearches = 5;
    setRecentSearches(prev => {
      const newSearches = [query, ...prev.filter(s => s !== query)];
      if (newSearches.length > maxRecentSearches) {
        newSearches.pop();
      }
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  // Handle search input with cleanup
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      searchProducts(query);
    } else {
      setSuggestions([]);
      setRelatedProducts([]);
    }
  }, [searchProducts]);

  // Clear search results when closing search
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    setRelatedProducts([]);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches if not already present
      saveRecentSearch(searchQuery);
      
      // Navigate to search results page
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (productId: number, productName: string) => {
    // Save to recent searches
    saveRecentSearch(productName);
    
    router.push(`/products/${productId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle clicking on a recent search
  const handleRecentSearchClick = (search: string) => {
    router.push(`/search?q=${encodeURIComponent(search)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white bg-opacity-95'
    }`} suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex items-center justify-between h-16" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" suppressHydrationWarning>
            <div className="relative" suppressHydrationWarning>
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center shadow-md" suppressHydrationWarning>
                <span className="text-white text-xl font-serif font-bold" suppressHydrationWarning>H</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full shadow-sm border border-white" suppressHydrationWarning></div>
            </div>
            <div className="flex flex-col" suppressHydrationWarning>
              <div className="font-bold text-2xl text-blue-900 tracking-wide" suppressHydrationWarning>HANDLOOM</div>
              <div className="text-xs text-gray-600 -mt-1 tracking-wider" suppressHydrationWarning>PREMIUM FABRICS</div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex relative flex-1 mx-8" ref={searchRef}>
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => setIsSearchOpen(true)}
                />
                <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                  <Search size={18} />
                </button>
              </form>
              
              {/* Search Suggestions */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 z-50 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                      <span className="ml-2 text-gray-600">Searching...</span>
                    </div>
                  ) : (
                    <>
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && searchQuery.length < 2 && (
                        <div className="p-3 border-b border-gray-100">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.slice(0, 5).map((search, index) => (
                              <button
                                key={index}
                                onClick={() => handleRecentSearchClick(search)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                              >
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Direct Matches */}
                      {suggestions.length > 0 && (
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Products</h3>
                          <div className="space-y-3">
                            {suggestions.slice(0, 4).map(product => (
                              <div 
                                key={product.id}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                onClick={() => handleSuggestionClick(product.id, product.name)}
                              >
                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                  <p className="text-sm text-gray-500 truncate">{product.category} • {product.subcategory}</p>
                                </div>
                                <div className="text-sm font-medium text-blue-900">
                                  {formatPrice(product.price)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {suggestions.length > 4 && (
                            <button
                              onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center py-2 hover:bg-blue-50 rounded-md"
                            >
                              View all {suggestions.length} results
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Related Products */}
                      {relatedProducts.length > 0 && (
                        <div className="p-3 border-t border-gray-100">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Related Products</h3>
                          <div className="space-y-3">
                            {relatedProducts.slice(0, 2).map(product => (
                              <div 
                                key={product.id}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                onClick={() => handleSuggestionClick(product.id, product.name)}
                              >
                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                  <p className="text-sm text-gray-500 truncate">{product.category} • {product.subcategory}</p>
                                </div>
                                <div className="text-sm font-medium text-blue-900">
                                  {formatPrice(product.price)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* No Results */}
                      {searchQuery.length >= 2 && suggestions.length === 0 && relatedProducts.length === 0 && (
                        <div className="p-4 text-center">
                          <p className="text-gray-500">No products found for "{searchQuery}"</p>
                          <p className="text-sm text-gray-400 mt-1">Try a different search term or browse our categories</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:block" suppressHydrationWarning>
            <ul className="flex items-center space-x-6">
              <li>
                <Link href="/" className="font-medium text-gray-700 hover:text-blue-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="font-medium text-gray-700 hover:text-blue-900 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-medium text-gray-700 hover:text-blue-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-medium text-gray-700 hover:text-blue-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button 
              className="md:hidden text-gray-700 hover:text-blue-900 p-1"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              suppressHydrationWarning
            >
              <Search size={20} />
            </button>
            
            {/* Wishlist */}
            <Link href="/wishlist" className="text-gray-700 hover:text-blue-900 p-1 relative" suppressHydrationWarning>
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            {/* User Account */}
            <UserProfile />
            
            {/* Cart */}
            <Link href="/cart" className="text-gray-700 hover:text-blue-900 p-1 relative" suppressHydrationWarning>
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-blue-900 p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              suppressHydrationWarning
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-3" suppressHydrationWarning>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchInput}
            />
            <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200" suppressHydrationWarning>
          <nav className="flex flex-col py-4 px-6 space-y-2" suppressHydrationWarning>
            <Link href="/" className="text-gray-700 hover:text-blue-900 font-medium py-2">Home</Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-900 font-medium py-2">Products</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-900 font-medium py-2">About Us</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-900 font-medium py-2">Contact</Link>
            <div className="border-t border-gray-100 my-2 pt-2">
              <Link href="/account" className="text-gray-700 hover:text-blue-900 font-medium py-2 flex items-center">
                <User size={18} className="mr-2" /> My Account
              </Link>
              <Link href="/wishlist" className="text-gray-700 hover:text-blue-900 font-medium py-2 flex items-center">
                <Heart size={18} className="mr-2" /> 
                Wishlist
                {wishlistItems.length > 0 && (
                  <span className="ml-2 bg-rose-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-blue-900 font-medium py-2 flex items-center">
                <ShoppingBag size={18} className="mr-2" /> Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
            </div>
            <Link href="/login" className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center mt-2">Sign In / Register</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;