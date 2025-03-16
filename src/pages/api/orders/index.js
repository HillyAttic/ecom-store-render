import { orderService } from '@/services/orderService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      console.log('API: Unauthorized access attempt to /api/orders');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Ensure userId exists and is a string
    const userId = session.user.id ? String(session.user.id) : null;
    
    if (!userId) {
      console.error('API: Missing user ID in session', session);
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    console.log(`API: Processing ${req.method} request to /api/orders for user ${userId}`);
    
    // GET request - fetch user's orders
    if (req.method === 'GET') {
      console.log(`API: Fetching orders for user ${userId}`);
      
      try {
        const orders = await orderService.getUserOrders(userId);
        console.log(`API: Found ${orders?.length || 0} orders for user ${userId}`);
        
        // Return orders in a consistent format with success flag and data property
        return res.status(200).json({
          success: true,
          data: orders || [],
          message: 'Orders retrieved successfully'
        });
      } catch (error) {
        console.error(`API: Error fetching orders for user ${userId}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve orders',
          error: error.message
        });
      }
    }
    
    // POST request - create a new order
    if (req.method === 'POST') {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.items || !orderData.items.length) {
        return res.status(400).json({ success: false, message: 'Order items are required' });
      }
      
      if (!orderData.shippingAddress) {
        return res.status(400).json({ success: false, message: 'Shipping address is required' });
      }
      
      // Add user ID to the order
      orderData.userId = userId;
      
      console.log(`API: Creating new order for user ${userId} with ${orderData.items.length} items`);
      
      try {
        const result = await orderService.createOrder(orderData);
        console.log(`API: Order created successfully with ID ${result.id}`);
        
        return res.status(201).json({
          success: true,
          data: result,
          message: 'Order created successfully'
        });
      } catch (error) {
        console.error(`API: Error creating order for user ${userId}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create order',
          error: error.message
        });
      }
    }
    
    // Method not allowed
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('API: Error handling order request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
} 