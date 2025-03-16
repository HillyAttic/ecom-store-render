import { adminRtdb, rtdbHelpers } from '@/utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Creating test data in Firebase Realtime Database...');
    
    // Create sample products
    const sampleProducts = [
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 19.99,
        category: 'clothing',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 100
      },
      {
        name: 'Denim Jeans',
        description: 'Classic denim jeans with a modern fit',
        price: 49.99,
        category: 'clothing',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 50
      },
      {
        name: 'Leather Wallet',
        description: 'Genuine leather wallet with multiple card slots',
        price: 29.99,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1517254797898-6532a461b31f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 75
      }
    ];
    
    // Clear existing products first
    await adminRtdb.ref('products').remove();
    
    // Add new products
    const productResults = [];
    for (const product of sampleProducts) {
      const result = await rtdbHelpers.createDocument('products', product);
      productResults.push({ id: result.id, ...product });
      console.log(`Created product with ID: ${result.id}`);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Test data created successfully in Firebase Realtime Database',
      products: productResults
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create test data',
      error: error.message
    });
  }
} 