import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { adminRtdb } from '@/utils/firebase-admin';
import { orderService } from '@/services/orderService';

export default async function handler(req, res) {
  // Check if the request method is allowed
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication using NextAuth
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      console.log('Admin API: Unauthorized access attempt');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Comment out the strict admin role check for development (consistent with index.js)
    // In a real app, you would check if the user is an admin
    // For now, we'll assume all authenticated users can access admin endpoints
    // const isAdmin = session.user?.role === 'admin';
    // if (!isAdmin) {
    //   console.log(`Admin API: Non-admin user (${session.user?.email}) attempted to access admin endpoint`);
    //   return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    // }
    
    // Get the order ID from the URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    
    console.log(`Admin API: ${req.method} request for order ${id} by admin ${session.user?.email}`);
    
    // Normalize the ID - remove any unnecessary characters that might have been introduced
    const normalizedId = id.toString().trim();
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        try {
          // Get order details using orderService
          const order = await orderService.getOrderById(normalizedId);
          
          if (!order) {
            console.log(`Admin API: Order ${normalizedId} not found`);
            return res.status(404).json({ success: false, message: 'Order not found' });
          }
          
          // Ensure ID fields are consistently provided
          const normalizedOrder = {
            ...order,
            id: order.id || normalizedId,
            _id: order._id || normalizedId,
            orderId: order.orderId || normalizedId
          };
          
          console.log(`Admin API: Successfully fetched order ${normalizedId}`);
          return res.status(200).json({ success: true, data: normalizedOrder });
        } catch (error) {
          console.error(`Admin API: Error fetching order ${normalizedId}:`, error);
          return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch order'
          });
        }
        
      case 'PUT':
        // Update order details
        const { status, trackingNumber } = req.body;
        
        // Validate required fields
        if (!status) {
          console.log('Admin API: Missing status in request body');
          return res.status(400).json({ success: false, message: 'Status is required' });
        }
        
        // Validate status value
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          console.log(`Admin API: Invalid status value in request: ${status}`);
          return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        
        // Validate order ID format
        if (normalizedId.trim() === '') {
          console.log(`Admin API: Invalid order ID: ${normalizedId}`);
          return res.status(400).json({ success: false, message: 'Invalid order ID' });
        }
        
        console.log(`Admin API: Updating order ${normalizedId} status to ${status}`);
        
        try {
          // First check if the order exists
          const existingOrder = await orderService.getOrderById(normalizedId);
          
          if (!existingOrder) {
            console.log(`Admin API: Order ${normalizedId} not found`);
            return res.status(404).json({ success: false, message: 'Order not found' });
          }
          
          // Use the orderService to update order status
          // Pass null for userId to skip owner verification (admin override)
          const updatedOrder = await orderService.updateOrderStatus(normalizedId, status);
          
          if (!updatedOrder) {
            console.log(`Admin API: Update failed for order ${normalizedId}`);
            return res.status(500).json({ success: false, message: 'Order not found or update failed' });
          }
          
          // Ensure both id and _id fields are present
          const normalizedOrder = {
            ...updatedOrder,
            id: updatedOrder.id || normalizedId,
            _id: updatedOrder._id || normalizedId,
            orderId: updatedOrder.orderId || normalizedId
          };
          
          // Normalize shipping address if present
          if (normalizedOrder.shippingAddress) {
            normalizedOrder.shippingAddress = {
              ...normalizedOrder.shippingAddress,
              street: normalizedOrder.shippingAddress.street || normalizedOrder.shippingAddress.addressLine1 || normalizedOrder.shippingAddress.streetAddress,
              addressLine1: normalizedOrder.shippingAddress.addressLine1 || normalizedOrder.shippingAddress.street || normalizedOrder.shippingAddress.streetAddress,
              zipCode: normalizedOrder.shippingAddress.zipCode || normalizedOrder.shippingAddress.postalCode,
              postalCode: normalizedOrder.shippingAddress.postalCode || normalizedOrder.shippingAddress.zipCode
            };
          }
          
          console.log('Admin API: Order updated successfully');
          
          // Manually emit socket events in case they weren't emitted in the service
          if (global.io && normalizedOrder) {
            try {
              // Make sure we have the userId
              const userId = normalizedOrder.userId || (await orderService.getOrderById(normalizedId))?.userId;
              
              if (userId) {
                console.log(`Admin API: Manually emitting socket events for order ${normalizedId} to user ${userId}`);
                // Emit to the specific user
                global.io.to(`user-${userId}`).emit('order-updated', normalizedOrder);
                
                // Emit to admin room
                global.io.to('admin-room').emit('order-status-changed', normalizedOrder);
                
                console.log('Admin API: Socket events manually emitted for order update');
              } else {
                console.log(`Admin API: Cannot emit socket events - no userId found for order ${normalizedId}`);
              }
            } catch (socketError) {
              console.error('Admin API: Error manually emitting socket events:', socketError);
              // Don't fail the request just because of socket emission error
            }
          }
          
          return res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: normalizedOrder
          });
        } catch (error) {
          console.error('Admin API: Error updating order status:', error);
          return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update order'
          });
        }
        
      case 'DELETE':
        try {
          // Delete order using orderService
          await orderService.deleteOrder(normalizedId);
          
          return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
          });
        } catch (error) {
          console.error(`Admin API: Error deleting order ${normalizedId}:`, error);
          return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete order'
          });
        }
        
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Admin API: Error in order handler:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
} 