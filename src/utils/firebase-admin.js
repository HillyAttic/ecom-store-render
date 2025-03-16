import admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    // Check if all required environment variables are available
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_DATABASE_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export the admin database instance
export const adminRtdb = admin.database();

// Helper functions for Realtime Database operations
export const rtdbHelpers = {
  // Create a document with auto-generated ID
  createDocument: async (collection, data) => {
    try {
      const ref = adminRtdb.ref(collection).push();
      await ref.set({
        ...data,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });
      return { id: ref.key };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },

  // Create a document with a specific ID
  setDocument: async (collection, id, data) => {
    try {
      const ref = adminRtdb.ref(`${collection}/${id}`);
      await ref.set({
        ...data,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });
      return { id };
    } catch (error) {
      console.error(`Error setting document ${id} in ${collection}:`, error);
      throw error;
    }
  },

  // Update a document
  updateDocument: async (collection, id, data) => {
    try {
      const ref = adminRtdb.ref(`${collection}/${id}`);
      await ref.update({
        ...data,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });
      return { id };
    } catch (error) {
      console.error(`Error updating document ${id} in ${collection}:`, error);
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (collection, id) => {
    try {
      const ref = adminRtdb.ref(`${collection}/${id}`);
      await ref.remove();
      return { id };
    } catch (error) {
      console.error(`Error deleting document ${id} in ${collection}:`, error);
      throw error;
    }
  },

  // Get a document by ID
  getDocument: async (collection, id) => {
    try {
      const ref = adminRtdb.ref(`${collection}/${id}`);
      const snapshot = await ref.once('value');
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
    try {
      let ref = adminRtdb.ref(collection);
      
      // Apply limit if provided
      if (options.limit) {
        ref = ref.limitToFirst(options.limit);
      }
      
      // Apply orderBy if provided
      if (options.orderBy) {
        ref = ref.orderByChild(options.orderBy);
      }
      
      // Apply where conditions if provided
      if (options.where) {
        for (const condition of options.where) {
          const [field, operator, value] = condition;
          
          if (operator === '==') {
            ref = ref.orderByChild(field).equalTo(value);
          } else if (operator === '>') {
            ref = ref.orderByChild(field).startAt(value + 0.000001);
          } else if (operator === '>=') {
            ref = ref.orderByChild(field).startAt(value);
          } else if (operator === '<') {
            ref = ref.orderByChild(field).endAt(value - 0.000001);
          } else if (operator === '<=') {
            ref = ref.orderByChild(field).endAt(value);
          }
        }
      }
      
      const snapshot = await ref.once('value');
      const results = [];
      
      snapshot.forEach(childSnapshot => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      return results;
    } catch (error) {
      console.error(`Error querying documents from ${collection}:`, error);
      throw error;
    }
  }
};

export default admin; 