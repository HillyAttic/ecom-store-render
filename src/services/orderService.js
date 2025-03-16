import { rtdbHelpers, adminRtdbHelpers } from '@/utils/firebase';

const COLLECTION_NAME = 'orders';

export const orderService = {
  // Get all orders for a user
  getUserOrders: async (userId) => {
    try {
      if (!userId) {
        console.error('orderService.getUserOrders: No userId provided');
        return [];
      }
      
      // Ensure userId is a string
      const userIdString = String(userId);
      
      console.log(`orderService.getUserOrders: Fetching orders for user ${userIdString}`);
      
      // First try to get all orders and filter client-side
      try {
        console.log(`orderService.getUserOrders: Attempting to get all orders and filter for user ${userIdString}`);
        
        // Use adminRtdbHelpers for better security and reliability
        // Only use orderBy without where clause to avoid Firebase error
        const allOrders = await adminRtdbHelpers.queryDocuments(COLLECTION_NAME, {
          orderBy: 'createdAt',
          direction: 'desc' // Most recent orders first
        });
        
        // Filter orders client-side
        const userOrders = allOrders.filter(order => 
          String(order.userId) === userIdString && 
          !order.isTestOrder
        );
        console.log(`orderService.getUserOrders: Found ${userOrders.length} orders for user ${userIdString} out of ${allOrders.length} total orders`);
        
        if (userOrders && userOrders.length > 0) {
          return userOrders;
        }
      } catch (adminError) {
        console.error(`orderService.getUserOrders: Error using adminRtdbHelpers:`, adminError);
        // Continue to fallback method
      }
      
      // Fallback to rtdbHelpers
      console.log(`orderService.getUserOrders: Falling back to rtdbHelpers for user ${userIdString}`);
      
      try {
        // Get all orders and filter client-side
        const allOrders = await rtdbHelpers.queryDocuments(COLLECTION_NAME, {
          orderBy: 'createdAt',
          direction: 'desc'
        });
        
        // Filter orders client-side
        const userOrders = allOrders.filter(order => 
          String(order.userId) === userIdString && 
          !order.isTestOrder
        );
        console.log(`orderService.getUserOrders: Found ${userOrders.length} orders for user ${userIdString} using rtdbHelpers`);
        
        return userOrders || [];
      } catch (rtdbError) {
        console.error(`orderService.getUserOrders: Error using rtdbHelpers:`, rtdbError);
        throw rtdbError;
      }
    } catch (error) {
      console.error(`orderService.getUserOrders: Error getting orders for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Get an order by ID
  getOrderById: async (orderId) => {
    try {
      if (!orderId) {
        console.error('orderService.getOrderById: No orderId provided');
        return null;
      }
      
      console.log(`orderService.getOrderById: Fetching order ${orderId}`);
      
      // Try adminRtdbHelpers first
      try {
        const order = await adminRtdbHelpers.getDocument(COLLECTION_NAME, orderId);
        if (order) {
          console.log(`orderService.getOrderById: Found order ${orderId} using adminRtdbHelpers`);
          
          // Normalize the shipping address format
          if (order.shippingAddress) {
            order.shippingAddress = normalizeShippingAddress(order.shippingAddress);
          }
          
          return order;
        }
      } catch (adminError) {
        console.error(`orderService.getOrderById: Error using adminRtdbHelpers:`, adminError);
        // Continue to fallback method
      }
      
      // Fallback to rtdbHelpers
      console.log(`orderService.getOrderById: Falling back to rtdbHelpers for order ${orderId}`);
      const order = await rtdbHelpers.getDocument(COLLECTION_NAME, orderId);
      
      if (order) {
        console.log(`orderService.getOrderById: Found order ${orderId} using rtdbHelpers`);
        
        // Normalize the shipping address format
        if (order.shippingAddress) {
          order.shippingAddress = normalizeShippingAddress(order.shippingAddress);
        }
      } else {
        console.log(`orderService.getOrderById: Order ${orderId} not found`);
      }
      
      return order;
    } catch (error) {
      console.error(`orderService.getOrderById: Error getting order with ID ${orderId}:`, error);
      throw error;
    }
  },
  
  // Create a new order
  createOrder: async (orderData) => {
    try {
      if (!orderData) {
        console.error('orderService.createOrder: No orderData provided');
        throw new Error('Order data is required');
      }
      
      if (!orderData.userId) {
        console.error('orderService.createOrder: No userId in orderData');
        throw new Error('User ID is required');
      }
      
      console.log(`orderService.createOrder: Creating order for user ${orderData.userId}`);
      
      // Add timestamps
      const now = new Date().toISOString();
      const orderWithTimestamps = {
        ...orderData,
        status: orderData.status || 'pending',
        createdAt: now,
        updatedAt: now
      };
      
      // Use adminRtdbHelpers for better security and reliability
      try {
        const result = await adminRtdbHelpers.createDocument(COLLECTION_NAME, orderWithTimestamps);
        console.log(`orderService.createOrder: Created order ${result.id} using adminRtdbHelpers`);
        return result;
      } catch (adminError) {
        console.error(`orderService.createOrder: Error using adminRtdbHelpers:`, adminError);
        // Continue to fallback method
      }
      
      // Fallback to rtdbHelpers
      console.log(`orderService.createOrder: Falling back to rtdbHelpers`);
      const result = await rtdbHelpers.createDocument(COLLECTION_NAME, orderWithTimestamps);
      console.log(`orderService.createOrder: Created order ${result.id} using rtdbHelpers`);
      
      return result;
    } catch (error) {
      console.error('orderService.createOrder: Error creating order:', error);
      throw error;
    }
  },
  
  // Update an order
  updateOrder: async (orderId, orderData) => {
    try {
      // Add updated timestamp
      const orderWithTimestamp = {
        ...orderData,
        updatedAt: new Date().toISOString()
      };
      
      // Use adminRtdbHelpers for better security and reliability
      const result = await adminRtdbHelpers.updateDocument(COLLECTION_NAME, orderId, orderWithTimestamp);
      return result;
    } catch (error) {
      console.error(`Error updating order with ID ${orderId}:`, error);
      throw error;
    }
  },
  
  // Update order status
  updateOrderStatus: async (orderId, status, userId = null) => {
    console.log(`orderService.updateOrderStatus: Called with orderId=${orderId}, status=${status}`);
    
    if (!orderId) {
      console.error('orderService.updateOrderStatus: Missing orderId parameter');
      throw new Error('Order ID is required');
    }
    
    if (!status) {
      console.error('orderService.updateOrderStatus: Missing status parameter');
      throw new Error('Status is required');
    }
    
    try {
      // Fetch the order first to validate it exists
      console.log(`orderService.updateOrderStatus: Fetching order ${orderId} to validate its existence`);
      
      // Try adminRtdbHelpers first
      try {
        const order = await adminRtdbHelpers.getDocument(COLLECTION_NAME, orderId);
        if (!order) {
          console.error(`orderService.updateOrderStatus: Order ${orderId} not found`);
          throw new Error(`Order with ID ${orderId} not found`);
        }
        
        // Normalize the order to ensure proper handling
        const normalizedOrder = normalizeOrderData(order);
        
        console.log(`orderService.updateOrderStatus: Order ${orderId} found, current status=${normalizedOrder.status}`);
        
        // Validate the status transition
        if (status === normalizedOrder.status) {
          console.log(`orderService.updateOrderStatus: Order ${orderId} already has status ${status}, no update needed`);
          return { id: orderId, status, message: 'Order already has this status' };
        }
        
        // Special case for cancellation - only order owner or admin can cancel
        if (status === 'cancelled' && userId && userId !== normalizedOrder.userId) {
          console.error(`orderService.updateOrderStatus: User ${userId} not authorized to cancel order ${orderId}`);
          throw new Error('Only the order owner or admin can cancel an order');
        }
        
        // Prevent going backward in the fulfillment process (except for admin)
        const statusOrder = {
          'pending': 1,
          'processing': 2,
          'shipped': 3,
          'delivered': 4
        };
        
        // Only enforce this for non-admin user updates
        if (userId && statusOrder[status] < statusOrder[normalizedOrder.status]) {
          console.error(`orderService.updateOrderStatus: Cannot change status from ${normalizedOrder.status} to ${status}`);
          throw new Error(`Cannot change order status from ${normalizedOrder.status} to ${status}`);
        }
        
        // Update the order status
        try {
          console.log(`orderService.updateOrderStatus: Updating Firebase document ${orderId} with status ${status}`);
          
          // Prepare update data
          const updateData = { 
            status,
            updatedAt: new Date().toISOString()
          };
          
          // Log the exact data being sent to Firebase
          console.log('Firebase update data:', JSON.stringify(updateData));
          
          // Perform the Firebase update
          console.log(`Calling adminRtdbHelpers.updateDocument with collection=${COLLECTION_NAME}, id=${orderId}`);
          const result = await adminRtdbHelpers.updateDocument(COLLECTION_NAME, orderId, updateData);
          
          if (!result) {
            console.error(`orderService.updateOrderStatus: Firebase update returned falsy result for order ${orderId}`);
            throw new Error('Database update operation failed');
          }
          
          console.log(`orderService.updateOrderStatus: Firebase successfully updated order ${orderId} status to ${status}`);
          console.log('Firebase update result:', JSON.stringify(result));
        } catch (dbError) {
          console.error('orderService.updateOrderStatus: Firebase database update error:', dbError);
          throw new Error(`Failed to update order in database: ${dbError.message || 'Unknown error'}`);
        }
        
        // Make sure to return the complete updated order object with the new status
        const updatedOrder = {
          ...normalizedOrder,
          status,
          id: normalizedOrder.id || orderId,
          _id: normalizedOrder._id || orderId,
          updatedAt: new Date().toISOString()
        };
        
        // Emit socket events if socket.io is available
        try {
          if (global.io) {
            const orderUserId = updatedOrder.userId || order.userId;
            
            if (orderUserId) {
              console.log(`orderService.updateOrderStatus: Emitting socket events for order ${orderId} to user ${orderUserId}`);
              
              // Emit to the specific user
              global.io.to(`user-${orderUserId}`).emit('order-updated', updatedOrder);
              
              // Emit to admin room
              global.io.to('admin-room').emit('order-status-changed', updatedOrder);
              
              console.log('orderService.updateOrderStatus: Socket events emitted successfully');
            } else {
              console.log(`orderService.updateOrderStatus: Cannot emit socket events - no userId found for order ${orderId}`);
            }
          } else {
            console.log('orderService.updateOrderStatus: Socket.io not available for emitting events');
          }
        } catch (socketError) {
          console.error('orderService.updateOrderStatus: Error emitting socket events:', socketError);
          // Continue with the update even if socket emission fails
        }
        
        return updatedOrder;
      } catch (getDocError) {
        console.error(`orderService.updateOrderStatus: Error fetching order ${orderId}:`, getDocError);
        throw new Error(`Error fetching order: ${getDocError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`orderService.updateOrderStatus: Error updating status for order with ID ${orderId}:`, error);
      throw error;
    }
  },
  
  // Delete an order (typically just for admin purposes)
  deleteOrder: async (orderId) => {
    try {
      // Use adminRtdbHelpers for better security and reliability
      const result = await adminRtdbHelpers.deleteDocument(COLLECTION_NAME, orderId);
      return result;
    } catch (error) {
      console.error(`Error deleting order with ID ${orderId}:`, error);
      throw error;
    }
  },
  
  // Get recent orders for a user
  getRecentOrders: async (userId, limit = 5) => {
    try {
      // Get all orders and filter client-side
      const allOrders = await adminRtdbHelpers.queryDocuments(COLLECTION_NAME, {
        orderBy: 'createdAt',
        direction: 'desc'
      });
      
      // Filter orders client-side
      const userOrders = allOrders.filter(order => 
        String(order.userId) === String(userId) && 
        !order.isTestOrder
      );
      
      // Apply limit
      return userOrders.slice(0, limit);
    } catch (error) {
      console.error(`Error getting recent orders for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Get all orders (admin only)
  getAllOrders: async (options = {}) => {
    try {
      const queryOptions = {};
      
      // Apply sorting if provided
      if (options.sortBy) {
        queryOptions.orderBy = options.sortBy;
      } else {
        queryOptions.orderBy = 'createdAt';
      }
      
      // Apply sort direction
      queryOptions.direction = options.direction || 'desc';
      
      // Apply pagination if provided
      if (options.limit) {
        queryOptions.limit = options.limit;
      }
      
      // Use adminRtdbHelpers for better security and reliability
      const allOrders = await adminRtdbHelpers.queryDocuments(COLLECTION_NAME, queryOptions);
      
      // Filter out test orders and apply status filter if provided
      const filteredOrders = allOrders.filter(order => 
        !order.isTestOrder && 
        (!options.status || order.status === options.status)
      );
      
      // Normalize shipping addresses for all orders
      return filteredOrders.map(order => {
        if (order.shippingAddress) {
          order.shippingAddress = normalizeShippingAddress(order.shippingAddress);
        }
        return order;
      });
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }
};

// Add this helper function to normalize shipping address formats
const normalizeShippingAddress = (address) => {
  if (!address) return address;
  
  // Create a normalized version with all possible fields
  return {
    ...address,
    // Ensure standard field names are available
    street: address.street || address.addressLine1 || address.streetAddress,
    addressLine1: address.addressLine1 || address.street || address.streetAddress,
    addressLine2: address.addressLine2 || address.apartment,
    zipCode: address.zipCode || address.postalCode,
    postalCode: address.postalCode || address.zipCode,
    // If we have firstName/lastName but no fullName, create it
    fullName: address.fullName || 
      ((address.firstName || address.lastName) ? 
        `${address.firstName || ''} ${address.lastName || ''}`.trim() : 
        undefined)
  };
};

// Add the missing normalizeOrderData function
const normalizeOrderData = (order) => {
  if (!order) return order;
  
  // Create a normalized order with consistent ID fields
  const normalizedOrder = {
    ...order,
    // Ensure all ID formats are available
    id: order.id || order._id || order.orderId,
    _id: order._id || order.id || order.orderId,
    orderId: order.orderId || order.id || order._id
  };
  
  // Normalize shipping address if present
  if (normalizedOrder.shippingAddress) {
    normalizedOrder.shippingAddress = normalizeShippingAddress(normalizedOrder.shippingAddress);
  }
  
  return normalizedOrder;
};