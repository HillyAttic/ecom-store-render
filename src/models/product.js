import { rtdbHelpers } from '@/utils/firebase-admin';
import { validatePrice, processPrice } from '@/utils/currency';

// Get all products with optional pagination
export async function getAllProducts(limit = 0, page = 0) {
  try {
    console.log('Starting getAllProducts function');
    
    // Query products with pagination
    const options = {};
    if (limit) {
      options.limit = limit;
    }
    
    const products = await rtdbHelpers.queryDocuments('products', options);
    
    // Process each product to ensure consistent data types
    const processedProducts = products.map(product => {
      const price = processPrice(product.price);
      const originalPrice = product.originalPrice ? processPrice(product.originalPrice) : undefined;
      
      return {
        ...product,
        price,
        originalPrice,
        rating: validatePrice(product.rating) || 0,
        description: product.description || "Premium quality fabric with elegant design and comfortable texture. Perfect for various occasions and seasons."
      };
    });
    
    console.log(`Found ${processedProducts.length} products in database`);
    if (processedProducts.length > 0) {
      console.log('First product sample:', JSON.stringify(processedProducts[0], null, 2));
    }
    
    return processedProducts;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}

// Get product by ID
export async function getProductById(id) {
  try {
    console.log('Getting product with ID:', id);
    
    // Handle both string and number IDs
    const productId = typeof id === 'string' ? id : id.toString();
    
    const product = await rtdbHelpers.getDocument('products', productId);
    
    if (product) {
      // Process the product to ensure consistent data types
      const price = processPrice(product.price);
      const originalPrice = product.originalPrice ? processPrice(product.originalPrice) : undefined;
      
      return {
        ...product,
        price,
        originalPrice,
        rating: validatePrice(product.rating) || 0,
        description: product.description || "Premium quality fabric with elegant design and comfortable texture. Perfect for various occasions and seasons."
      };
    }
    
    console.log('Product found:', product ? 'Yes' : 'No');
    return product;
  } catch (error) {
    console.error('Database error in getProductById:', error);
    throw new Error('Failed to fetch product');
  }
}

// Search products (simplified for Firebase)
export async function searchProducts(query, limit = 10) {
  try {
    if (!query || !query.trim()) {
      return [];
    }
    
    // Get all products first (Firebase RTDB doesn't support text search natively)
    const allProducts = await rtdbHelpers.queryDocuments('products');
    
    // Perform client-side filtering
    const searchQuery = query.toLowerCase();
    
    const filteredProducts = allProducts.filter(product => {
      return (
        (product.name && product.name.toLowerCase().includes(searchQuery)) ||
        (product.category && product.category.toLowerCase().includes(searchQuery)) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchQuery)) ||
        (product.description && product.description.toLowerCase().includes(searchQuery)) ||
        (product.tags && Array.isArray(product.tags) && product.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery)
        ))
      );
    }).slice(0, limit);
    
    return filteredProducts;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Search failed');
  }
}

// Create a new product
export async function createProduct(productData) {
  try {
    console.log('Creating new product with data:', productData);
    
    // Generate a unique ID within Firebase
    // Process prices
    const price = processPrice(productData.price);
    const originalPrice = productData.originalPrice ? processPrice(productData.originalPrice) : undefined;
    
    // Ensure numeric fields are properly typed and validated
    const newProduct = {
      ...productData,
      price,
      originalPrice,
      rating: validatePrice(productData.rating) || 0,
      description: productData.description || "Premium quality fabric with elegant design and comfortable texture. Perfect for various occasions and seasons."
    };
    
    console.log('Final product data to insert:', newProduct);
    
    // Insert the product using Firebase
    const result = await rtdbHelpers.createDocument('products', newProduct);
    
    console.log('Product created successfully:', result);
    
    // Return the created product with its ID
    return {
      id: result.id,
      ...newProduct
    };
  } catch (error) {
    console.error('Database error in createProduct:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

// Update an existing product
export async function updateProduct(id, productData) {
  try {
    // Handle both string and number IDs
    const productId = typeof id === 'string' ? id : id.toString();
    console.log('Updating product with ID:', productId);
    
    // First check if the product exists
    const existingProduct = await rtdbHelpers.getDocument('products', productId);
    if (!existingProduct) {
      console.error('Product not found with ID:', productId);
      throw new Error('Product not found');
    }
    
    // Remove id from update data to prevent changing immutable fields
    const { id: _, ...updateData } = productData;
    
    // Process prices
    const price = processPrice(updateData.price);
    const originalPrice = updateData.originalPrice ? processPrice(updateData.originalPrice) : undefined;
    
    // Validate and process the update data
    const processedUpdateData = {
      ...updateData,
      price,
      originalPrice,
      rating: validatePrice(updateData.rating) || 0,
      description: updateData.description || existingProduct.description
    };
    
    console.log('Final update data:', processedUpdateData);
    
    await rtdbHelpers.updateDocument('products', productId, processedUpdateData);
    
    const updatedProduct = await getProductById(productId);
    console.log('Retrieved updated product:', updatedProduct);
    return updatedProduct;
  } catch (error) {
    console.error('Database error in updateProduct:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

// Delete a product
export async function deleteProduct(id) {
  try {
    console.log(`[MODEL] deleteProduct called with ID: ${id}`);
    
    // Handle both string and number IDs
    const productId = typeof id === 'string' ? id : id.toString();
    console.log(`[MODEL] deleteProduct - normalized ID: ${productId}`);
    
    // Check if rtdbHelpers is available
    if (!rtdbHelpers || typeof rtdbHelpers.deleteDocument !== 'function') {
      console.error('[MODEL] deleteProduct - rtdbHelpers or deleteDocument function is not available');
      throw new Error('Database helpers not properly initialized');
    }
    
    // Try to delete the document
    console.log(`[MODEL] deleteProduct - calling rtdbHelpers.deleteDocument('products', '${productId}')`);
    await rtdbHelpers.deleteDocument('products', productId);
    
    console.log(`[MODEL] deleteProduct - successfully deleted product ${productId}`);
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error(`[MODEL] Database error in deleteProduct for ID ${id}:`, error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
} 