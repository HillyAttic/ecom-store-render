import { NextResponse } from 'next/server';
import { adminRtdb } from '@/utils/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const search = searchParams.get('search');
    
    console.log('API Request - Params:', { category, limit, search });
    
    // Reference to the products node in the database using admin SDK
    const productsRef = adminRtdb.ref('products');
    const snapshot = await productsRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('No products found in database');
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'No products found in the database'
      });
    }
    
    // Convert the snapshot to an array of products
    let products: any[] = [];
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      products.push(product);
    });
    
    console.log('Total products found in database:', products.length);
    
    // Apply category filter if provided
    if (category && category !== 'All') {
      products = products.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
      );
      console.log('After category filter:', products.length);
    }
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
      );
      console.log('After search filter:', products.length);
    }
    
    // Apply limit if provided
    if (limit && limit > 0) {
      console.log('Applying limit:', limit);
      products = products.slice(0, limit);
    }
    
    console.log('Final products count to return:', products.length);
    
    // Check for any hidden products or issues
    products.forEach((product, index) => {
      if (!product.id || !product.name) {
        console.log(`WARNING: Product at index ${index} is missing required fields:`, product);
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: products,
      count: products.length
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the product data from the request body
    const productData = await request.json();
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, price, and category are required' 
        },
        { status: 400 }
      );
    }
    
    // Generate a new product ID
    const productsRef = adminRtdb.ref('products');
    const newProductRef = productsRef.push();
    
    // Add the ID to the product data
    const productWithId = {
      id: newProductRef.key,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    // Save the product to the database
    await newProductRef.set(productWithId);
    
    // Return success response with the created product
    return NextResponse.json({
      success: true,
      data: productWithId,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create product'
      },
      { status: 500 }
    );
  }
} 