import { rtdbHelpers } from '@/utils/firebase';

const COLLECTION_NAME = 'products';

export const productService = {
  // Get all products with optional filtering and pagination
  getAllProducts: async (options = {}) => {
    try {
      const queryOptions = {};
      
      // Apply category filter if provided
      if (options.category) {
        queryOptions.where = [['category', '==', options.category]];
      }
      
      // Apply sorting if provided
      if (options.sortBy) {
        queryOptions.orderBy = options.sortBy;
      }
      
      // Apply pagination if provided
      if (options.limit) {
        queryOptions.limit = options.limit;
      }
      
      const products = await rtdbHelpers.queryDocuments(COLLECTION_NAME, queryOptions);
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },
  
  // Get a product by ID
  getProductById: async (productId) => {
    try {
      const product = await rtdbHelpers.getDocument(COLLECTION_NAME, productId);
      return product;
    } catch (error) {
      console.error(`Error getting product with ID ${productId}:`, error);
      throw error;
    }
  },
  
  // Create a new product
  createProduct: async (productData) => {
    try {
      const result = await rtdbHelpers.createDocument(COLLECTION_NAME, productData);
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update a product
  updateProduct: async (productId, productData) => {
    try {
      const result = await rtdbHelpers.updateDocument(COLLECTION_NAME, productId, productData);
      return result;
    } catch (error) {
      console.error(`Error updating product with ID ${productId}:`, error);
      throw error;
    }
  },
  
  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const result = await rtdbHelpers.deleteDocument(COLLECTION_NAME, productId);
      return result;
    } catch (error) {
      console.error(`Error deleting product with ID ${productId}:`, error);
      throw error;
    }
  },
  
  // Search products by name or description
  searchProducts: async (searchTerm) => {
    try {
      // Get all products first (not ideal for large datasets)
      const allProducts = await rtdbHelpers.queryDocuments(COLLECTION_NAME);
      
      // Filter products client-side (Realtime Database doesn't support text search)
      const searchTermLower = searchTerm.toLowerCase();
      const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(searchTermLower);
        const descMatch = product.description && product.description.toLowerCase().includes(searchTermLower);
        return nameMatch || descMatch;
      });
      
      return filteredProducts;
    } catch (error) {
      console.error(`Error searching products with term "${searchTerm}":`, error);
      throw error;
    }
  },
  
  // Get featured products
  getFeaturedProducts: async (limit = 4) => {
    try {
      // In a real app, you might have a 'featured' field to filter by
      // For now, we'll just return the first few products
      const products = await rtdbHelpers.queryDocuments(COLLECTION_NAME, { limit });
      return products;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  },
  
  // Get products by IDs
  getProductsByIds: async (productIds) => {
    try {
      const productPromises = productIds.map(id => rtdbHelpers.getDocument(COLLECTION_NAME, id));
      const products = await Promise.all(productPromises);
      return products.filter(product => product !== null); // Filter out any null results
    } catch (error) {
      console.error('Error getting products by IDs:', error);
      throw error;
    }
  }
}; 