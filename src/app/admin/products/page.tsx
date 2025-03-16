"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown,
  AlertCircle,
  X,
  Check,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

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

// Define filter state
interface FilterState {
  category: string;
  priceRange: [number, number];
  status: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 10000],
    status: 'all'
  });
  const [categories, setCategories] = useState<string[]>(['all']);

  // Check authentication
  useEffect(() => {
    const token = Cookies.get('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Fetch products
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const { data } = await response.json();
        console.log('Fetched products:', data);
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
  }, [isAuthenticated]);

  // Add refresh function
  const refreshProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const { data } = await response.json();
      console.log('Refreshed products:', data);
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...Array.from(new Set(data.map((p: Product) => p.category)))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add effect to refresh products when the page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle delete
  const confirmDelete = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      console.log(`[ADMIN] Attempting to delete product with ID: ${productToDelete}`);
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
      });
      
      // Log the response for debugging
      console.log(`[ADMIN] Delete product response status: ${response.status}`);
      const responseData = await response.json();
      console.log(`[ADMIN] Delete product response data:`, responseData);
      
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${responseData.error || 'Unknown error'}`);
      }
      
      console.log(`[ADMIN] Product ${productToDelete} deleted successfully`);
      // Remove product from state
      setProducts(products.filter(p => p.id !== productToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('[ADMIN] Error deleting product:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredProducts = products
    .filter(product => {
      // Search query filter
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      
      // Price filter
      const matchesPrice = 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1];
      
      // Status filter
      const matchesStatus = 
        filters.status === 'all' || 
        (filters.status === 'new' && product.isNew) || 
        (filters.status === 'sale' && product.isSale);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
    })
    .sort((a, b) => {
      // Handle sorting
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'price':
          return direction * (a.price - b.price);
        case 'category':
          return direction * a.category.localeCompare(b.category);
        default:
          return direction * (a.id - b.id);
      }
    });

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add styles for darker placeholders */}
      <style jsx global>{`
        input::placeholder,
        select::placeholder,
        textarea::placeholder,
        .dark-placeholder::placeholder,
        [class*="jsx-"]::placeholder,
        [class*="jsx-"] input::placeholder,
        [class*="jsx-"] select::placeholder {
          color: #111827 !important; /* Gray-900 - almost black */
          opacity: 1 !important;
        }
        
        select,
        [class*="jsx-"] select,
        [class*="jsx-"] option {
          color: #111827 !important; /* Dark text for select and options */
        }
        
        /* Add specific styles for number inputs with placeholder */
        input[type="number"]::placeholder,
        [class*="jsx-"] input[type="number"]::placeholder {
          color: #000000 !important; /* Pure black for number inputs */
          font-weight: 500 !important;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/admin/products/add" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark-placeholder"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select 
                id="category-filter"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => setFilters({
                    ...filters, 
                    priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                  })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark-placeholder"
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => setFilters({
                    ...filters, 
                    priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000]
                  })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark-placeholder"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="sale">On Sale</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      {sortField === 'id' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Product
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      {sortField === 'category' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative rounded overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                        <div className="text-sm text-gray-500">{product.subcategory}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {product.isNew && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              New
                            </span>
                          )}
                          {product.isSale && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Sale
                            </span>
                          )}
                          {!product.isNew && !product.isSale && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Regular
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/products/edit/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => confirmDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No products found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <X size={18} className="mr-1 inline" />
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 size={18} className="mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-1" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 