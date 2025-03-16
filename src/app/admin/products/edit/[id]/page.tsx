"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Loader2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface FormData {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  rating: number;
  isNew: boolean;
  isSale: boolean;
  description: string;
  tags: string;
}

interface Product extends Omit<FormData, 'tags'> {
  id: number;
  tags: string[];
}

export default function EditProduct({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = parseInt(params.id);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: 0,
    originalPrice: undefined,
    image: '',
    category: '',
    subcategory: '',
    rating: 5,
    isNew: false,
    isSale: false,
    description: '',
    tags: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Check authentication
  useEffect(() => {
    const token = Cookies.get('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Fetch product data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchProduct() {
      try {
        setFetchLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }
        
        const { data } = await response.json();
        
        // Convert tags array to comma-separated string
        setFormData({
          ...data,
          tags: data.tags ? data.tags.join(', ') : ''
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        setFetchError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setFetchLoading(false);
      }
    }
    
    fetchProduct();
  }, [isAuthenticated, productId]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (formData.originalPrice !== undefined && formData.originalPrice <= 0) {
      errors.originalPrice = 'Original price must be greater than 0';
    }
    
    if (formData.originalPrice !== undefined && formData.originalPrice <= formData.price) {
      errors.originalPrice = 'Original price must be greater than current price for sale items';
    }
    
    if (!formData.image.trim()) {
      errors.image = 'Image URL is required';
    } else if (!isValidUrl(formData.image)) {
      errors.image = 'Please enter a valid URL';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormData]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    console.log('Starting product update process...');
    
    try {
      // Prepare data for API
      const productData = {
        ...formData,
        // Convert tags string to array
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };
      
      console.log('Sending update request with data:', productData);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      console.log('Response status:', response.status);
      
      // Get the response data
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        console.error('Error response data:', responseData);
        throw new Error(responseData.error || 'Failed to update product');
      }
      
      console.log('Update successful, response data:', responseData);
      
      setSuccess(true);
      
      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{fetchError}</p>
              <div className="mt-4">
                <Link 
                  href="/admin/products" 
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>
        <Link 
          href="/admin/products" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Products
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Product updated successfully! Redirecting to products list...
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>
              
              {/* Product ID (read-only) */}
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID
                </label>
                <input
                  type="text"
                  id="id"
                  value={productId}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                />
              </div>
              
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter product name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>
              
              {/* Original Price (for sale items) */}
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (₹) {formData.isSale && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full border ${formErrors.originalPrice ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                />
                {formErrors.originalPrice && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.originalPrice}</p>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g. Electronics, Clothing, etc."
                />
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>
              
              {/* Subcategory */}
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Smartphones, T-shirts, etc."
                />
              </div>
              
              {/* Rating */}
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h2>
              
              {/* Image URL */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={`w-full border ${formErrors.image ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {formErrors.image && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.image}</p>
                )}
                {formData.image && !formErrors.image && (
                  <div className="mt-2 relative h-32 w-32 border rounded-md overflow-hidden">
                    <img 
                      src={formData.image} 
                      alt="Product preview" 
                      className="object-cover h-full w-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150?text=Image+Error';
                        setFormErrors({
                          ...formErrors,
                          image: 'Unable to load image from URL'
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter product description"
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>
              
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. bestseller, featured, summer"
                />
              </div>
              
              {/* Status Checkboxes */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isNew"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isNew" className="ml-2 block text-sm text-gray-700">
                    Mark as New
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSale"
                    name="isSale"
                    checked={formData.isSale}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isSale" className="ml-2 block text-sm text-gray-700">
                    Mark as On Sale
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
            >
              <X size={18} className="mr-1" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-1" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 