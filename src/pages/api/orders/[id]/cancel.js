import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { orderService } from '@/services/orderService';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      console.log('API: Unauthorized access attempt to /api/orders/[id]/cancel');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Ensure userId exists and is a string
    const userId = session.user.id ? String(session.user.id) : null;
    
    if (!userId) {
      console.error('API: Missing user ID in session', session);
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Ensure email exists on session for additional verification
    const userEmail = session.user.email;
    if (!userEmail) {
      console.error('API: Missing user email in session', session);
      return res.status(400).json({ success: false, message: 'User email is required' });
    }
    
    // Get the order ID from the URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    
    console.log(`API: Processing ${req.method} request to /api/orders/${id}/cancel for user ${userId} (${userEmail})`);
    
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
      // First, check if the order exists and belongs to this user
      const order = await orderService.getOrderById(id);
      
      if (!order) {
        console.error(`API: Order ${id} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      // Verify the order belongs to this user
      if (String(order.userId) !== userId) {
        console.error(`API: User ${userId} attempted to cancel order ${id} that belongs to user ${order.userId}`);
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to cancel this order' 
        });
      }
      
      // Verify order status allows cancellation
      if (!['pending', 'processing'].includes(order.status)) {
        console.error(`API: Cannot cancel order ${id} with status ${order.status}`);
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status '${order.status}'. Only pending or processing orders can be cancelled.`
        });
      }
      
      // Use orderService to cancel the order, passing userId for verification
      const result = await orderService.updateOrderStatus(id, 'cancelled', userId);
      
      console.log(`API: Order ${id} cancelled successfully by user ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: result
      });
    } catch (error) {
      console.error(`API: Error cancelling order ${id}:`, error);
      
      // Return appropriate status code based on error type
      if (error.message.includes('permission') || error.message.includes('not found for this user')) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to cancel this order' 
        });
      }
      
      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      });
    }
  } catch (error) {
    console.error('API: Error handling order cancellation request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
} 