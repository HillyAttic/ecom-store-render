"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { calculateDiscountPercentage } from '@/utils/currency';

// Define product type
interface Product {
  id: number;
  name: string;
  price: number; // Price in USD
  originalPrice?: number; // Original price in USD
  image: string;
  category: string;
  subcategory?: string;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  description: string;
  tags?: string[];
}

const FeaturedProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch products');
        }
        
        // Ensure prices are numbers
        const processedData = result.data.map((product: Product) => ({
          ...product,
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined
        }));
        
        setProducts(processedData);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError(error.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  // Get unique categories from products
  const availableCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <section className="py-12 bg-gray-50" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="text-center mb-10" suppressHydrationWarning>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" suppressHydrationWarning>Featured Fabrics</h2>
          <p className="text-gray-600 max-w-2xl mx-auto" suppressHydrationWarning>
            Discover our curated selection of premium fabrics that combine quality, elegance, and durability for all your textile needs.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2" suppressHydrationWarning>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              suppressHydrationWarning
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.href = '/admin/import-products'} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Import Products
            </button>
          </div>
        ) : (
          <>
            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" suppressHydrationWarning>
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
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found in this category.</p>
                {products.length === 0 && (
                  <button 
                    onClick={() => window.location.href = '/admin/import-products'} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Import Products
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* View all button */}
        {products.length > 0 && (
          <div className="text-center mt-10" suppressHydrationWarning>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              suppressHydrationWarning
            >
              View All Fabrics
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts; 