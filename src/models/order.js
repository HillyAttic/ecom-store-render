import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  convertDocToObj,
  prepareDataForFirestore,
  setDoc,
  deleteDoc,
  limit
} from '@/utils/firebase';

// Simple in-memory cache for orders
const orderCache = {
  userOrders: new Map(), // userId -> {orders, timestamp}
  orderDetails: new Map(), // orderId -> {order, timestamp}
  cacheTTL: 60000, // 1 minute cache TTL
  
  // Get cached user orders if available and not expired
  getUserOrders(userId) {
    const cached = this.userOrders.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.orders;
    }
    return null;
  },
  
  // Set user orders in cache
  setUserOrders(userId, orders) {
    this.userOrders.set(userId, {
      orders,
      timestamp: Date.now()
    });
  },
  
  // Get cached order if available and not expired
  getOrder(orderId) {
    const cached = this.orderDetails.get(orderId);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.order;
    }
    return null;
  },
  
  // Set order in cache
  setOrder(orderId, order) {
    this.orderDetails.set(orderId, {
      order,
      timestamp: Date.now()
    });
  },
  
  // Invalidate cache for a user
  invalidateUserCache(userId) {
    this.userOrders.delete(userId);
  },
  
  // Invalidate cache for an order
  invalidateOrderCache(orderId) {
    this.orderDetails.delete(orderId);
  },
  
  // Clear all caches
  clearAll() {
    this.userOrders.clear();
    this.orderDetails.clear();
  }
};

// Define the orders collection name
const COLLECTION_NAME = 'orders';

// Helper function to get orders collection reference
const getOrdersCollection = () => {
  return collection(db, COLLECTION_NAME);
};

// Helper function to get order document reference
const getOrderDoc = (orderId) => {
  return doc(db, COLLECTION_NAME, orderId);
};

// Get all orders for a user
export async function getUserOrders(userId) {
  try {
    console.log(`getUserOrders: Fetching orders for user ${userId}`);
    
    if (!userId) {
      console.error('getUserOrders: No userId provided');
      return [];
    }
    
    // Check cache first
    const cachedOrders = orderCache.getUserOrders(userId);
    if (cachedOrders) {
      console.log(`getUserOrders: Returning ${cachedOrders.length} cached orders for user ${userId}`);
      return cachedOrders;
    }
    
    console.log(`getUserOrders: Querying Firestore orders collection`);
    
    // Always convert userId to string for consistency
    const userIdString = userId.toString();
    console.log(`getUserOrders: Using userIdString: ${userIdString}`);
    
    // Query orders collection
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userIdString),
      where('isTestOrder', '!=', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      _id: doc.id, // Keep _id for compatibility with existing code
      id: doc.id,  // Also include id for Firestore standard
      ...convertDocToObj(doc)
    }));
    
    console.log(`getUserOrders: Found ${orders.length} orders for user ${userIdString}`);
    
    // Cache the results
    if (orders.length > 0) {
      orderCache.setUserOrders(userId, orders);
    }
    
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw new Error('Failed to get orders');
  }
}

// Get order by ID
export async function getOrderById(orderId, userId) {
  try {
    // Check cache first
    const cachedOrder = orderCache.getOrder(orderId);
    if (cachedOrder && (!userId || cachedOrder.userId === userId.toString())) {
      return cachedOrder;
    }
    
    // Get order from Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const order = {
      _id: orderDoc.id, // Keep _id for compatibility
      id: orderDoc.id,  // Also include id for Firestore standard
      ...convertDocToObj(orderDoc)
    };
    
    // If userId is provided, check if it matches
    if (userId && order.userId !== userId.toString()) {
      throw new Error('Order not found for this user');
    }
    
    // Cache the order
    orderCache.setOrder(orderId, order);
    
    return order;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw new Error('Failed to get order');
  }
}

// Create a new order
export async function createOrder(orderData) {
  try {
    console.log('Creating order with data:', JSON.stringify(orderData));
    
    // Validate required fields
    const requiredFields = ['userId', 'items', 'shippingAddress', 'paymentMethod', 'totalAmount'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Ensure userId is a string
    if (orderData.userId && typeof orderData.userId !== 'string') {
      orderData.userId = String(orderData.userId);
    }
    
    // Prepare data for Firestore
    const orderToCreate = {
      ...orderData,
      isTestOrder: false, // Explicitly mark as a real customer order
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add the order to Firestore
    const ordersRef = getOrdersCollection();
    const docRef = await addDoc(ordersRef, prepareDataForFirestore(orderToCreate));
    console.log('Order created with ID:', docRef.id);
    
    // Get the created order
    const createdOrderDoc = await getDoc(docRef);
    const createdOrder = {
      _id: createdOrderDoc.id, // Keep _id for compatibility
      id: createdOrderDoc.id,  // Also include id for Firestore standard
      ...convertDocToObj(createdOrderDoc)
    };
    
    // Invalidate user orders cache
    orderCache.invalidateUserCache(orderData.userId);
    
    // Cache the new order
    orderCache.setOrder(docRef.id, createdOrder);
    
    // Emit socket events if socket.io is available
    if (global.io) {
      try {
        // Emit to the specific user
        global.io.to(`user-${orderData.userId}`).emit('order-created', createdOrder);
        
        // Emit to admin room
        global.io.to('admin-room').emit('new-order', createdOrder);
        
        console.log('Socket events emitted for new order');
      } catch (socketError) {
        console.error('Error emitting socket events:', socketError);
      }
    } else {
      console.log('Socket.io not available for emitting events');
    }
    
    return createdOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(orderId, status, userId = null) {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    // Get the order first to check if it exists and belongs to the user
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const order = convertDocToObj(orderDoc);
    
    // If userId is provided, check if it matches
    if (userId) {
      // Ensure userId is a string
      const userIdString = userId.toString();
      if (order.userId !== userIdString) {
        throw new Error('Order not found for this user');
      }
    }
    
    // Update the order status
    await updateDoc(orderRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Order ${orderId} status updated to ${status}`);
    
    // Get the updated order
    const updatedOrderDoc = await getDoc(orderRef);
    const updatedOrder = {
      _id: updatedOrderDoc.id, // Keep _id for compatibility
      id: updatedOrderDoc.id,  // Also include id for Firestore standard
      ...convertDocToObj(updatedOrderDoc)
    };
    
    // Invalidate caches
    orderCache.invalidateOrderCache(orderId);
    if (updatedOrder && updatedOrder.userId) {
      orderCache.invalidateUserCache(updatedOrder.userId);
    }
    
    // Emit socket events if socket.io is available
    if (global.io && updatedOrder) {
      try {
        // Emit to the specific user
        global.io.to(`user-${updatedOrder.userId}`).emit('order-updated', updatedOrder);
        
        // Emit to admin room
        global.io.to('admin-room').emit('order-status-changed', updatedOrder);
        
        console.log('Socket events emitted for order status update');
      } catch (socketError) {
        console.error('Error emitting socket events:', socketError);
      }
    } else {
      console.log('Socket.io not available for emitting events or order not found');
    }
    
    return updatedOrder;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Cancel order
export async function cancelOrder(orderId, userId) {
  try {
    // Ensure userId is a string
    const userIdString = userId.toString();
    
    // Get the order to check its status
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const order = convertDocToObj(orderDoc);
    
    // Check if the order belongs to the user
    if (order.userId !== userIdString) {
      throw new Error('Order not found for this user');
    }
    
    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      throw new Error('Cannot cancel order that has been shipped or delivered');
    }
    
    // Update the order status to cancelled
    await updateDoc(orderRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
    
    // Invalidate caches
    orderCache.invalidateOrderCache(orderId);
    orderCache.invalidateUserCache(userIdString);
    
    return {
      success: true,
      message: 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error(`Failed to cancel order: ${error.message}`);
  }
}

// Get order count by status
export async function getOrderCountsByStatus(userId) {
  try {
    // Ensure userId is a string
    const userIdString = userId.toString();
    
    // Get all orders for the user
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userIdString)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => convertDocToObj(doc));
    
    // Count orders by status
    const counts = {};
    orders.forEach(order => {
      const status = order.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting order counts:', error);
    throw new Error('Failed to get order counts');
  }
}

// Get all orders
export async function getAllOrders() {
  try {
    const ordersRef = getOrdersCollection();
    const querySnapshot = await getDocs(query(ordersRef, orderBy('createdAt', 'desc')));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}

// Get orders by user ID
export async function getOrdersByUserId(userId) {
  try {
    const ordersRef = getOrdersCollection();
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

// Update order
export async function updateOrder(orderId, updateData) {
  try {
    const orderRef = getOrderDoc(orderId);
    await updateDoc(orderRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { id: orderId, ...updateData };
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// Delete order
export async function deleteOrder(orderId) {
  try {
    const orderRef = getOrderDoc(orderId);
    await deleteDoc(orderRef);
    return { id: orderId };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// Get order counts by status
export async function getOrderCounts() {
  try {
    const ordersRef = getOrdersCollection();
    const querySnapshot = await getDocs(ordersRef);
    
    const counts = {
      total: querySnapshot.size,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status && counts[data.status] !== undefined) {
        counts[data.status]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting order counts:', error);
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
  }
} 