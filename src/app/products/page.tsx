"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, Search, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { calculateDiscountPercentage } from '@/utils/currency';
import { useCart, CartItem } from '@/context/CartContext';
import RangeSlider from '@/components/ui/RangeSlider';
import MainLayout from '@/components/layout/MainLayout';

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
  updatedAt?: string;
}

export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">All Fabrics</h1>
            <p className="text-gray-600 mt-2">
              Browse our extensive collection of premium fabrics for all your needs
            </p>
          </div>
          
          <ProductsContent />
        </div>
      </div>
    </MainLayout>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products...');
        const url = searchQuery 
          ? `/api/products?search=${encodeURIComponent(searchQuery)}` 
          : '/api/products';
        
        console.log('Fetching from URL:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('Failed to fetch products:', response.status, response.statusText);
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Received products:', result);
        
        if (!result.success) {
          console.error('API returned error:', result.error);
          throw new Error(result.error || 'Failed to fetch products');
        }
        
        const { data } = result;
        console.log(`Received ${data.length} products`);
        
        // Log all products to debug
        data.forEach((product: Product, index: number) => {
          console.log(`Product ${index + 1}:`, product.id, product.name, 'Price:', product.price, 'Category:', product.category);
        });
        
        // Ensure prices are numbers
        const processedData = data.map((product: Product) => ({
          ...product,
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined
        }));
        
        setProducts(processedData);
        
        // Extract unique categories
        const categories = ['All', ...Array.from(new Set(processedData.map((p: Product) => p.category)))];
        setAllCategories(categories as string[]);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError(error.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [searchQuery]);

  // Filter products based on selected filters
  const filteredProducts = products
    // First check if products might have a visibility flag
    .filter(product => {
      // Check if any product has a 'visible' field set to false
      if (product.hasOwnProperty('visible') && product.visible === false) {
        console.log('Found hidden product:', product.id, product.name);
        return false;
      }
      // Also check for isPublished if that's used
      if (product.hasOwnProperty('isPublished') && !product.isPublished) {
        console.log('Found unpublished product:', product.id, product.name);
        return false;
      }
      return true;
    })
    .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
    .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'newest') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0; // default: relevance
    });

  // Debug products filtering
  console.log('Products after loading:', products.length);
  console.log('Products after filtering:', filteredProducts.length);
  console.log('Selected category:', selectedCategory);
  console.log('Price range:', priceRange);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already triggered by the useEffect dependency on searchQuery
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      originalPrice: product.originalPrice
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Mobile filter button */}
      <div className="md:hidden mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters sidebar */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">Categories</h3>
            <div className="space-y-1.5">
              {allCategories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="mr-1.5"
                  />
                  <span className="text-gray-700 text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">Price Range</h3>
            <RangeSlider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onChange={setPriceRange}
            />
            <div className="flex justify-between mt-1.5 text-xs text-gray-500">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Search bar */}
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fabrics..."
              className="w-full p-2 pl-8 pr-8 border border-gray-300 rounded-lg text-sm"
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        {/* Results count and sort (mobile) */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-600 text-sm">
            {loading ? 'Loading products...' : `${filteredProducts.length} products found`}
          </p>
          <div className="md:hidden">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-1.5 border border-gray-300 rounded text-xs"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low-high">Sort: Price Low-High</option>
              <option value="price-high-low">Sort: Price High-Low</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-red-500 mb-3 text-sm">{error}</p>
            <button 
              onClick={() => window.location.href = '/admin/import-products'} 
              className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Import Products
            </button>
          </div>
        ) : (
          <>
            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    category={product.category}
                    rating={product.rating}
                    isNew={product.isNew}
                    isSale={product.isSale}
                    discount={calculateDiscountPercentage(product.originalPrice || 0, product.price)}
                    description={product.description}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-500 mb-3 text-sm">No products found matching your criteria.</p>
                {products.length === 0 && (
                  <button 
                    onClick={() => window.location.href = '/admin/import-products'} 
                    className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Import Products
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 