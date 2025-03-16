import { Server } from 'socket.io';
import { 
  db, 
  collection, 
  firestoreQuery as query, 
  where, 
  onSnapshot, 
  adminRtdbHelpers
} from '@/utils/firebase';

// Global variable to store the Socket.io server instance
let io;

// Utility to check if a user is connected to a specific room
const isUserConnected = (userId) => {
  if (!io) return false;
  
  const room = `user-${userId}`;
  const roomClients = io.sockets.adapter.rooms.get(room);
  return roomClients && roomClients.size > 0;
};

// Function to safely create Firestore queries
const safeCreateQuery = (userId) => {
  try {
    if (!db) {
      console.warn('Firestore database is not initialized');
      return null;
    }
    
    // Make sure db is actually a Firestore instance
    if (!db.collection && !db.type) {
      console.error('Invalid Firestore database instance:', db);
      return null;
    }
    
    const ordersRef = collection(db, 'orders');
    return query(
      ordersRef,
      where('userId', '==', userId.toString())
    );
  } catch (error) {
    console.error('Error creating Firestore query:', error);
    return null;
  }
};

// Function to handle Firestore order updates with safety checks
const createOrderListener = (socket, userId) => {
  try {
    // Skip if Firestore isn't available
    if (!db) {
      console.warn('Firestore database not available for order listener');
      return () => {}; // Return no-op unsubscribe function
    }
    
    const q = safeCreateQuery(userId);
    if (!q) {
      console.warn('Could not create valid Firestore query');
      return () => {}; // Return no-op unsubscribe function
    }
    
    // Create the listener with error handling
    return onSnapshot(
      q, 
      (snapshot) => {
        try {
          snapshot.docChanges().forEach((change) => {
            const orderData = {
              _id: change.doc.id,
              id: change.doc.id,
              ...change.doc.data()
            };
            
            // Convert Firestore timestamps to dates
            if (orderData.createdAt && typeof orderData.createdAt.toDate === 'function') {
              orderData.createdAt = orderData.createdAt.toDate();
            }
            if (orderData.updatedAt && typeof orderData.updatedAt.toDate === 'function') {
              orderData.updatedAt = orderData.updatedAt.toDate();
            }
            
            if (change.type === 'added') {
              // New order created
              socket.emit('order-created', orderData);
            } else if (change.type === 'modified') {
              // Order updated
              socket.emit('order-updated', orderData);
            }
          });
        } catch (innerError) {
          console.error('Error processing snapshot changes:', innerError);
        }
      },
      (error) => {
        console.error('Firestore snapshot error:', error);
      }
    );
  } catch (error) {
    console.error('Failed to set up order listener:', error);
    return () => {}; // Return no-op unsubscribe function
  }
};

// Function to create a listener for all orders (admin)
const createAdminOrderListener = (socket) => {
  try {
    // Skip if Firestore isn't available
    if (!db) {
      console.warn('Firestore database not available for admin order listener');
      return () => {}; // Return no-op unsubscribe function
    }
    
    // Check if we have a proper Firestore instance
    if (!db.collection && !db.type) {
      console.error('Invalid Firestore database instance:', db);
      return () => {};
    }
    
    try {
      const ordersRef = collection(db, 'orders');
      
      // Create the listener with error handling
      return onSnapshot(
        ordersRef, 
        (snapshot) => {
          try {
            snapshot.docChanges().forEach((change) => {
              const orderData = {
                _id: change.doc.id,
                id: change.doc.id,
                ...change.doc.data()
              };
              
              // Convert Firestore timestamps to dates
              if (orderData.createdAt && typeof orderData.createdAt.toDate === 'function') {
                orderData.createdAt = orderData.createdAt.toDate();
              }
              if (orderData.updatedAt && typeof orderData.updatedAt.toDate === 'function') {
                orderData.updatedAt = orderData.updatedAt.toDate();
              }
              
              if (change.type === 'added') {
                // New order created
                io.to('admin-room').emit('new-order', orderData);
              } else if (change.type === 'modified') {
                // Order updated
                io.to('admin-room').emit('order-status-changed', orderData);
              }
            });
          } catch (innerError) {
            console.error('Error processing admin snapshot changes:', innerError);
          }
        },
        (error) => {
          console.error('Firestore admin snapshot error:', error);
        }
      );
    } catch (collectionError) {
      console.error('Error creating collection reference:', collectionError);
      return () => {};
    }
  } catch (error) {
    console.error('Failed to set up admin order listener:', error);
    return () => {}; // Return no-op unsubscribe function
  }
};

export default function handler(req, res) {
  // Check for connection status check request
  if (req.query.check === 'status') {
    const status = {
      initialized: !!io,
      activeConnections: io ? io.engine.clientsCount : 0,
      timestamp: new Date().toISOString()
    };
    
    // If user ID is provided, check if they're connected
    if (req.query.userId) {
      status.userConnected = isUserConnected(req.query.userId);
    }
    
    res.json(status);
    return;
  }

  // Check if Socket.io server is already initialized
  if (io) {
    console.log('Socket.io server already initialized');
    res.end('Socket.io server already running');
    return;
  }

  console.log('Initializing Socket.io server...');

  // Initialize Socket.io server with CORS configuration and performance optimizations
  io = new Server(res.socket.server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com' 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Performance optimizations
    transports: ['websocket'], // Use only websocket transport for better performance
    pingInterval: 30000, // Increase ping interval to reduce traffic
    pingTimeout: 60000, // Increase timeout
    connectTimeout: 10000, // Reduce connection timeout
    maxHttpBufferSize: 1e6, // 1MB max buffer size
    perMessageDeflate: {
      threshold: 1024 // Only compress messages larger than 1KB
    }
  });

  // Make io accessible globally
  res.socket.server.io = io;
  global.io = io;
  
  console.log('Socket.io server initialized and available globally');

  // Listen for socket connections
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle user joining their specific room
    socket.on('join-user-room', (userId) => {
      if (userId) {
        // Leave any previous rooms to avoid memory leaks
        socket.rooms.forEach(room => {
          if (room !== socket.id && room.startsWith('user-')) {
            socket.leave(room);
          }
        });
        
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
        
        // Create a listener for this user's orders with better error handling
        try {
          const unsubscribe = createOrderListener(socket, userId);
          
          // Store the unsubscribe function in the socket object
          socket.firebaseListeners = socket.firebaseListeners || {};
          
          // Clean up any existing listener for this user
          if (socket.firebaseListeners[userId]) {
            try {
              socket.firebaseListeners[userId]();
            } catch (error) {
              console.error(`Error cleaning up previous listener for user ${userId}:`, error);
            }
          }
          
          // Store the new listener
          socket.firebaseListeners[userId] = unsubscribe;
        } catch (error) {
          console.error(`Error setting up order listener for user ${userId}:`, error);
        }
      }
    });

    // Handle admin joining admin room
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
      
      // Create a listener for all orders with better error handling
      try {
        const unsubscribe = createAdminOrderListener(socket);
        
        // Store the unsubscribe function in the socket object
        socket.firebaseListeners = socket.firebaseListeners || {};
        
        // Clean up any existing admin listener
        if (socket.firebaseListeners['admin']) {
          try {
            socket.firebaseListeners['admin']();
          } catch (error) {
            console.error('Error cleaning up previous admin listener:', error);
          }
        }
        
        // Store the new listener
        socket.firebaseListeners['admin'] = unsubscribe;
      } catch (error) {
        console.error('Error setting up admin order listener:', error);
      }
    });

    // Handle admin test events
    socket.on('admin-test-event', (event) => {
      console.log('Received admin test event:', event);
      
      if (event.type === 'order-status-changed' && event.data) {
        try {
          const { data } = event;
          
          // Validate the test data
          if (!data._id || !data.userId) {
            console.error('Invalid test event data:', data);
            return;
          }
          
          console.log(`Admin test event: Broadcasting order status change for order ${data._id}`);
          
          // Broadcast to the user's room
          io.to(`user-${data.userId}`).emit('order-updated', data);
          
          // Also broadcast to admin room (to other admin windows)
          io.to('admin-room').emit('order-status-changed', data);
          
          console.log('Test event broadcast complete');
        } catch (error) {
          console.error('Error processing admin test event:', error);
        }
      }
    });

    // Handle admin order updates (new handler)
    socket.on('admin-order-update', (orderData) => {
      console.log('Received admin order update:', JSON.stringify(orderData));
      
      try {
        // Validate the order data
        if (!orderData._id) {
          console.error('Invalid order update data - missing order ID:', orderData);
          return;
        }
        
        // Ensure we have both id and _id formats for compatibility
        const enhancedData = {
          ...orderData,
          id: orderData.id || orderData._id, // Ensure id is present
          _id: orderData._id || orderData.id  // Ensure _id is present
        };
        
        console.log(`Admin order update: Broadcasting status change for order ${enhancedData._id} to status ${enhancedData.status}`);
        
        // Broadcast to the user's room if userId is available
        if (enhancedData.userId) {
          console.log(`Emitting to user-${enhancedData.userId} room`);
          io.to(`user-${enhancedData.userId}`).emit('order-updated', enhancedData);
          
          // Log whether the user is actually connected
          const userRoom = `user-${enhancedData.userId}`;
          const roomClients = io.sockets.adapter.rooms.get(userRoom);
          console.log(`User room ${userRoom} has ${roomClients ? roomClients.size : 0} clients connected`);
        }
        
        // Always broadcast to admin room (to other admin windows)
        io.to('admin-room').emit('order-status-changed', enhancedData);
        
        // Log admin room connections
        const adminRoom = 'admin-room';
        const adminClients = io.sockets.adapter.rooms.get(adminRoom);
        console.log(`Admin room has ${adminClients ? adminClients.size : 0} clients connected`);
        
        console.log('Order update broadcast complete');
      } catch (error) {
        console.error('Error processing admin order update:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
      
      // Clean up all Firebase listeners
      if (socket.firebaseListeners) {
        Object.entries(socket.firebaseListeners).forEach(([key, unsubscribe]) => {
          try {
            if (typeof unsubscribe === 'function') {
              unsubscribe();
              console.log(`Successfully unsubscribed listener for ${key}`);
            }
          } catch (error) {
            console.error(`Error unsubscribing listener for ${key}:`, error);
          }
        });
        socket.firebaseListeners = {};
      }
    });
  });

  res.end('Socket.io server initialized');
}

// Export the io instance and utilities for use in other files
export { io, isUserConnected }; 