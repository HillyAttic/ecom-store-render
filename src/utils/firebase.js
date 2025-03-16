import { initializeApp, getApps } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get, 
  update, 
  remove, 
  query as rtdbQuery, 
  orderByChild, 
  equalTo, 
  limitToFirst, 
  limitToLast, 
  startAt, 
  endAt, 
  onValue, 
  off, 
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';

// Keep Firestore imports for compatibility with existing code but don't initialize it
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query as firestoreQuery, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

// Import admin SDK for server-side operations
import admin from 'firebase-admin';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
let firebaseApp;
let db = null; // Firestore - initialized only if explicitly needed
let rtdb; // Realtime Database

if (!getApps().length) {
  console.log('Initializing Firebase...');
  firebaseApp = initializeApp(firebaseConfig);
} else {
  console.log('Firebase already initialized');
  firebaseApp = getApps()[0];
}

// Initialize Realtime Database (primary database)
try {
  rtdb = getDatabase(firebaseApp);
  console.log('Realtime Database initialized');
} catch (error) {
  console.error('Error initializing Realtime Database:', error);
}

// Initialize Firebase Admin SDK for server-side operations
let adminApp;
let adminRtdb;

// Only initialize admin SDK on the server side
if (typeof window === 'undefined') {
  try {
    // Check if admin SDK is already initialized
    if (!admin.apps.length) {
      // Initialize with service account if provided, otherwise use application default credentials
      if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString()
        );
        
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
      } else {
        adminApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
      }
      console.log('Firebase Admin SDK initialized');
    } else {
      adminApp = admin.app();
      console.log('Firebase Admin SDK already initialized');
    }
    
    // Initialize admin Realtime Database
    adminRtdb = admin.database();
    console.log('Admin Realtime Database initialized');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

// DO NOT initialize Firestore by default to avoid permission errors
// Firestore will only be initialized when explicitly needed
const initializeFirestore = () => {
  if (!db) {
    try {
      db = getFirestore(firebaseApp);
      console.log('Firestore initialized on demand');
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      throw error;
    }
  }
  return db;
};

// Simple in-memory cache for data
const cache = {
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

// Helper function to convert Firestore document to a plain object
export function convertDocToObj(doc) {
  const data = doc.data();
  
  // Convert Firestore Timestamps to JavaScript Dates
  Object.keys(data).forEach(key => {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate();
    }
  });
  
  return {
    id: doc.id,
    ...data
  };
}

// Helper function to convert JavaScript Date to Firestore Timestamp
export function convertDateToTimestamp(date) {
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  return date;
}

// Helper function to prepare data for Firestore
export function prepareDataForFirestore(data) {
  const newData = { ...data };
  
  // Convert dates to Firestore Timestamps
  Object.keys(newData).forEach(key => {
    if (newData[key] instanceof Date) {
      newData[key] = Timestamp.fromDate(newData[key]);
    }
  });
  
  return newData;
}

// Helper functions for Realtime Database (client-side)
const rtdbHelpers = {
  // Create a new document with auto-generated ID
  createDocument: async (collection, data) => {
    const collectionRef = ref(rtdb, collection);
    const newDocRef = push(collectionRef);
    
    await set(newDocRef, {
      ...data,
      createdAt: rtdbServerTimestamp(),
      updatedAt: rtdbServerTimestamp()
    });
    
    return {
      id: newDocRef.key,
      ...data
    };
  },
  
  // Create or update a document with a specific ID
  setDocument: async (collection, id, data) => {
    const docRef = ref(rtdb, `${collection}/${id}`);
    
    await set(docRef, {
      ...data,
      updatedAt: rtdbServerTimestamp()
    });
    
    return { id };
  },
  
  // Update a document (partial update)
  updateDocument: async (collection, id, data) => {
    const docRef = ref(rtdb, `${collection}/${id}`);
    
    await update(docRef, {
      ...data,
      updatedAt: rtdbServerTimestamp()
    });
    
    return { id };
  },
  
  // Delete a document
  deleteDocument: async (collection, id) => {
    const docRef = ref(rtdb, `${collection}/${id}`);
    await remove(docRef);
    return { id };
  },
  
  // Get a document by ID
  getDocument: async (collection, id) => {
    const docRef = ref(rtdb, `${collection}/${id}`);
    const snapshot = await get(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.key,
      ...snapshot.val()
    };
  },
  
  // Query documents
  queryDocuments: async (collection, options = {}) => {
    let queryRef = ref(rtdb, collection);
    
    // Build the query based on options
    if (options.orderBy) {
      queryRef = rtdbQuery(queryRef, orderByChild(options.orderBy));
    }
    
    if (options.where) {
      for (const condition of options.where) {
        const [field, operator, value] = condition;
        
        if (operator === '==') {
          queryRef = rtdbQuery(queryRef, orderByChild(field), equalTo(value));
        } else if (operator === '>') {
          queryRef = rtdbQuery(queryRef, orderByChild(field), startAt(value + 0.000001));
        } else if (operator === '>=') {
          queryRef = rtdbQuery(queryRef, orderByChild(field), startAt(value));
        } else if (operator === '<') {
          queryRef = rtdbQuery(queryRef, orderByChild(field), endAt(value - 0.000001));
        } else if (operator === '<=') {
          queryRef = rtdbQuery(queryRef, orderByChild(field), endAt(value));
        }
      }
    }
    
    if (options.limit) {
      queryRef = rtdbQuery(queryRef, limitToFirst(options.limit));
    }
    
    const snapshot = await get(queryRef);
    const results = [];
    
    snapshot.forEach(childSnapshot => {
      results.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    return results;
  },
  
  // Subscribe to a document
  subscribeToDocument: (collection, id, callback) => {
    const docRef = ref(rtdb, `${collection}/${id}`);
    
    const unsubscribe = onValue(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      
      callback({
        id: snapshot.key,
        ...snapshot.val()
      });
    });
    
    return unsubscribe;
  },
  
  // Subscribe to a query
  subscribeToQuery: (collection, options = {}, callback) => {
    let queryRef = ref(rtdb, collection);
    
    // Build the query based on options
    if (options.orderBy) {
      queryRef = rtdbQuery(queryRef, orderByChild(options.orderBy));
    }
    
    if (options.where) {
      for (const condition of options.where) {
        const [field, operator, value] = condition;
        
        if (operator === '==') {
          queryRef = rtdbQuery(queryRef, orderByChild(field), equalTo(value));
        }
      }
    }
    
    if (options.limit) {
      queryRef = rtdbQuery(queryRef, limitToFirst(options.limit));
    }
    
    const unsubscribe = onValue(queryRef, (snapshot) => {
      const results = [];
      
      snapshot.forEach(childSnapshot => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      callback(results);
    });
    
    return () => off(queryRef);
  }
};

// Helper functions for Realtime Database (server-side with admin SDK)
const adminRtdbHelpers = {
  // Create a new document with auto-generated ID
  createDocument: async (collection, data) => {
    // Only run on server side
    if (typeof window !== 'undefined' || !adminRtdb) {
      console.warn('Admin SDK can only be used on the server side');
      return rtdbHelpers.createDocument(collection, data);
    }
    
    try {
      const collectionRef = adminRtdb.ref(collection);
      const newDocRef = collectionRef.push();
      
      const now = admin.database.ServerValue.TIMESTAMP;
      await newDocRef.set({
        ...data,
        createdAt: now,
        updatedAt: now
      });
      
      // Get the created document to return with server timestamps
      const snapshot = await newDocRef.once('value');
      
      return {
        id: newDocRef.key,
        ...snapshot.val()
      };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },
  
  // Create or update a document with a specific ID
  setDocument: async (collection, id, data) => {
    // Only run on server side
    if (typeof window !== 'undefined' || !adminRtdb) {
      console.warn('Admin SDK can only be used on the server side');
      return rtdbHelpers.setDocument(collection, id, data);
    }
    
    try {
      const docRef = adminRtdb.ref(`${collection}/${id}`);
      
      const now = admin.database.ServerValue.TIMESTAMP;
      await docRef.set({
        ...data,
        updatedAt: now
      });
      
      return { id };
    } catch (error) {
      console.error(`Error setting document ${id} in ${collection}:`, error);
      throw error;
    }
  },
  
  // Update a document (partial update)
  updateDocument: async (collection, id, data) => {
    // Only run on server side
    if (typeof window !== 'undefined' || !adminRtdb) {
      console.warn('Admin SDK can only be used on the server side');
      return rtdbHelpers.updateDocument(collection, id, data);
    }
    
    try {
      console.log(`adminRtdbHelpers.updateDocument: Starting update for ${collection}/${id}`);
      console.log(`adminRtdbHelpers.updateDocument: Update data:`, JSON.stringify(data));
      
      // Verify the document exists first
      const docRef = adminRtdb.ref(`${collection}/${id}`);
      const snapshot = await docRef.once('value');
      
      if (!snapshot.exists()) {
        console.error(`adminRtdbHelpers.updateDocument: Document ${id} not found in ${collection}`);
        throw new Error(`Document ${id} not found in ${collection}`);
      }
      
      console.log(`adminRtdbHelpers.updateDocument: Document exists, proceeding with update`);
      
      const now = admin.database.ServerValue.TIMESTAMP;
      const updatePayload = {
        ...data,
        updatedAt: now
      };
      
      console.log(`adminRtdbHelpers.updateDocument: Final update payload:`, JSON.stringify(updatePayload));
      
      await docRef.update(updatePayload);
      
      console.log(`adminRtdbHelpers.updateDocument: Update successful for ${collection}/${id}`);
      
      // Verify the update by fetching the document again
      const updatedSnapshot = await docRef.once('value');
      console.log(`adminRtdbHelpers.updateDocument: Document after update:`, 
        JSON.stringify({
          id: updatedSnapshot.key,
          ...updatedSnapshot.val()
        })
      );
      
      return { id };
    } catch (error) {
      console.error(`Error updating document ${id} in ${collection}:`, error);
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument: async (collection, id) => {
    // Only run on server side
    if (typeof window !== 'undefined' || !adminRtdb) {
      console.warn('Admin SDK can only be used on the server side');
      return rtdbHelpers.deleteDocument(collection, id);
    }
    
    try {
      const docRef = adminRtdb.ref(`${collection}/${id}`);
      await docRef.remove();
      return { id };
    } catch (error) {
      console.error(`Error deleting document ${id} in ${collection}:`, error);
      throw error;
    }
  },
  
  // Get a document by ID
  getDocument: async (collection, id) => {
    // Only run on server side
    if (typeof window !== 'undefined' || !adminRtdb) {
      console.warn('Admin SDK can only be used on the server side');
      return rtdbHelpers.getDocument(collection, id);
    }
    
    try {
      const docRef = adminRtdb.ref(`${collection}/${id}`);
      const snapshot = await docRef.once('value');
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.key,
        ...snapshot.val()
      };
    } catch (error) {
      console.error(`Error getting document ${id} from ${collection}:`, error);
      throw error;
    }
  },
  
  // Query documents
  queryDocuments: async (collection, options = {}) => {
    // Only run on server side
    if (typeof window !== 'undefined' || !adminRtdb) {
      console.warn('Admin SDK can only be used on the server side');
      return rtdbHelpers.queryDocuments(collection, options);
    }
    
    try {
      let queryRef = adminRtdb.ref(collection);
      
      // Apply ordering
      if (options.orderBy) {
        queryRef = queryRef.orderByChild(options.orderBy);
      }
      
      // Apply filters
      if (options.where) {
        for (const condition of options.where) {
          const [field, operator, value] = condition;
          
          if (operator === '==') {
            queryRef = queryRef.orderByChild(field).equalTo(value);
          } else if (operator === '>') {
            queryRef = queryRef.orderByChild(field).startAt(value + 0.000001);
          } else if (operator === '>=') {
            queryRef = queryRef.orderByChild(field).startAt(value);
          } else if (operator === '<') {
            queryRef = queryRef.orderByChild(field).endAt(value - 0.000001);
          } else if (operator === '<=') {
            queryRef = queryRef.orderByChild(field).endAt(value);
          }
        }
      }
      
      // Apply limit
      if (options.limit) {
        if (options.direction === 'desc') {
          queryRef = queryRef.limitToLast(options.limit);
        } else {
          queryRef = queryRef.limitToFirst(options.limit);
        }
      }
      
      const snapshot = await queryRef.once('value');
      const results = [];
      
      snapshot.forEach(childSnapshot => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Handle descending order if specified
      if (options.direction === 'desc') {
        results.reverse();
      }
      
      return results;
    } catch (error) {
      console.error(`Error querying documents from ${collection}:`, error);
      throw error;
    }
  }
};

// Export Firestore instance and Firebase app
export { 
  db, 
  rtdb, 
  firebaseApp, 
  cache, 
  serverTimestamp, 
  rtdbServerTimestamp, 
  rtdbHelpers, 
  adminRtdbHelpers, 
  initializeFirestore 
};

// Export Firestore functions for convenience
export { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  firestoreQuery, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp
}; 

// Export Realtime Database functions
export {
  ref,
  set,
  push,
  get,
  update,
  remove,
  rtdbQuery,
  orderByChild,
  equalTo,
  limitToFirst,
  limitToLast,
  startAt,
  endAt,
  onValue,
  off
};