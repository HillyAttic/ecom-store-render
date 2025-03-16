import { adminRtdb, rtdbHelpers } from '@/utils/firebase-admin';

// This is a protected API route that should only be called with a valid API key
export default async function handler(req, res) {
  // Check if this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check for API key
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (apiKey !== process.env.DEBUG_API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    console.log('Creating sample data in Firebase Realtime Database...');
    
    // Create sample users
    if (req.body.createUsers) {
      console.log('Creating sample users...');
      
      const sampleUsers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
          emailVerified: null
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          image: 'https://randomuser.me/api/portraits/women/1.jpg',
          emailVerified: null
        }
      ];
      
      for (const user of sampleUsers) {
        const result = await rtdbHelpers.createDocument('users', user);
        console.log(`Created user with ID: ${result.id}`);
      }
      
      console.log(`Created ${sampleUsers.length} sample users`);
    }
    
    // Create sample products
    if (req.body.createProducts) {
      console.log('Creating sample products...');
      
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
      
      for (const product of sampleProducts) {
        const result = await rtdbHelpers.createDocument('products', product);
        console.log(`Created product with ID: ${result.id}`);
      }
      
      console.log(`Created ${sampleProducts.length} sample products`);
    }
    
    // Create sample orders
    if (req.body.createOrders) {
      console.log('Creating sample orders...');
      
      // Get user IDs
      const usersRef = adminRtdb.ref('users');
      const usersSnapshot = await usersRef.limitToFirst(2).once('value');
      
      if (!usersSnapshot.exists()) {
        console.log('No users found to create orders for');
        return res.status(400).json({ success: false, message: 'No users found to create orders for' });
      }
      
      const userIds = [];
      usersSnapshot.forEach(childSnapshot => {
        userIds.push(childSnapshot.key);
      });
      
      // Get product IDs
      const productsRef = adminRtdb.ref('products');
      const productsSnapshot = await productsRef.limitToFirst(3).once('value');
      
      if (!productsSnapshot.exists()) {
        console.log('No products found to create orders with');
        return res.status(400).json({ success: false, message: 'No products found to create orders with' });
      }
      
      const products = [];
      productsSnapshot.forEach(childSnapshot => {
        products.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      const sampleOrders = [
        {
          userId: userIds[0],
          items: [
            {
              productId: products[0].id,
              name: products[0].name,
              price: products[0].price,
              quantity: 2,
              image: products[0].image
            },
            {
              productId: products[1].id,
              name: products[1].name,
              price: products[1].price,
              quantity: 1,
              image: products[1].image
            }
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Credit Card',
          totalAmount: (products[0].price * 2) + products[1].price,
          status: 'delivered'
        },
        {
          userId: userIds[1],
          items: [
            {
              productId: products[2].id,
              name: products[2].name,
              price: products[2].price,
              quantity: 1,
              image: products[2].image
            }
          ],
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
          },
          paymentMethod: 'PayPal',
          totalAmount: products[2].price,
          status: 'processing'
        }
      ];
      
      for (const order of sampleOrders) {
        const result = await rtdbHelpers.createDocument('orders', order);
        console.log(`Created order with ID: ${result.id}`);
      }
      
      console.log(`Created ${sampleOrders.length} sample orders`);
    }
    
    // Create sample addresses
    if (req.body.createAddresses) {
      console.log('Creating sample addresses...');
      
      // Get user IDs
      const usersRef = adminRtdb.ref('users');
      const usersSnapshot = await usersRef.limitToFirst(2).once('value');
      
      if (!usersSnapshot.exists()) {
        console.log('No users found to create addresses for');
        return res.status(400).json({ success: false, message: 'No users found to create addresses for' });
      }
      
      const userIds = [];
      usersSnapshot.forEach(childSnapshot => {
        userIds.push(childSnapshot.key);
      });
      
      const sampleAddresses = [
        {
          userId: userIds[0],
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true
        },
        {
          userId: userIds[0],
          street: '789 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          country: 'USA',
          isDefault: false
        },
        {
          userId: userIds[1],
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
          isDefault: true
        }
      ];
      
      for (const address of sampleAddresses) {
        const result = await rtdbHelpers.createDocument('addresses', address);
        console.log(`Created address with ID: ${result.id}`);
      }
      
      console.log(`Created ${sampleAddresses.length} sample addresses`);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Sample data created successfully in Firebase Realtime Database' 
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create sample data',
      error: error.message
    });
  }
} 