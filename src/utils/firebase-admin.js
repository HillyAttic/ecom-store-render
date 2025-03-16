import * as admin from 'firebase-admin';

// Check if Firebase Admin has already been initialized
let firebaseAdmin;

if (!admin.apps.length) {
  try {
    // Check for required environment variables
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_DATABASE_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
      // In development or when variables are missing, create a mock admin
      console.warn('Using development Firebase configuration');
      firebaseAdmin = {
        firestore: () => ({
          collection: () => ({
            doc: () => ({
              get: async () => ({ exists: false, data: () => ({}) }),
              set: async () => ({}),
              update: async () => ({}),
              delete: async () => ({})
            }),
            add: async () => ({ id: 'mock-id' }),
            where: () => ({
              get: async () => ({ empty: true, docs: [] }),
              orderBy: () => ({
                get: async () => ({ empty: true, docs: [] })
              })
            }),
            orderBy: () => ({
              get: async () => ({ empty: true, docs: [] }),
              limit: () => ({
                get: async () => ({ empty: true, docs: [] })
              })
            }),
            limit: () => ({
              get: async () => ({ empty: true, docs: [] })
            })
          })
        }),
        auth: () => ({
          verifyIdToken: async () => ({ uid: 'mock-uid' }),
          createCustomToken: async () => 'mock-token'
        }),
        app: () => ({
          name: 'mock-app',
          options: {
            projectId: 'mock-project-id',
            databaseURL: 'https://mock-db.firebaseio.com'
          }
        }),
        apps: [true],
        database: () => ({
          ref: () => ({
            push: () => ({
              key: 'mock-key',
              set: async () => ({})
            }),
            set: async () => ({}),
            update: async () => ({}),
            remove: async () => ({}),
            once: async () => ({
              exists: () => false,
              val: () => ({}),
              forEach: () => ({})
            })
          })
        })
      };
    } else {
      // Initialize with actual credentials
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;
        
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Provide a mock implementation for build/development
    firebaseAdmin = {
      firestore: () => ({
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => ({}),
            update: async () => ({}),
            delete: async () => ({})
          }),
          add: async () => ({ id: 'mock-id' }),
          where: () => ({
            get: async () => ({ empty: true, docs: [] })
          }),
          orderBy: () => ({
            get: async () => ({ empty: true, docs: [] })
          }),
          limit: () => ({
            get: async () => ({ empty: true, docs: [] })
          })
        })
      }),
      auth: () => ({
        verifyIdToken: async () => ({ uid: 'mock-uid' }),
        createCustomToken: async () => 'mock-token'
      }),
      app: () => ({
        name: 'mock-app',
        options: {
          projectId: 'mock-project-id',
          databaseURL: 'https://mock-db.firebaseio.com'
        }
      }),
      apps: [true],
      database: () => ({
        ref: () => ({
          push: () => ({
            key: 'mock-key',
            set: async () => ({})
          }),
          set: async () => ({}),
          update: async () => ({}),
          remove: async () => ({}),
          once: async () => ({
            exists: () => false,
            val: () => ({}),
            forEach: () => ({})
          })
        })
      })
    };
  }
}

// Ensure admin.database exists in the mocked version
if (!admin.database && firebaseAdmin && firebaseAdmin.database) {
  admin.database = () => firebaseAdmin.database();
}

export default firebaseAdmin;
export const firestore = firebaseAdmin.firestore ? firebaseAdmin.firestore() : null;
export const auth = firebaseAdmin.auth ? firebaseAdmin.auth() : null;

// Export the admin database instance
export const adminRtdb = firebaseAdmin.database ? firebaseAdmin.database() : {
  ref: () => ({
    push: () => ({
      key: 'mock-key',
      set: async () => ({})
    }),
    set: async () => ({}),
    update: async () => ({}),
    remove: async () => ({}),
    once: async () => ({
      exists: () => false,
      val: () => ({}),
      forEach: () => ({})
    })
  })
};

// Create mock ServerValue for build
const ServerValue = admin.database?.ServerValue || { TIMESTAMP: Date.now() };

// Helper functions for Realtime Database operations
export const rtdbHelpers = {
  // Create a document with auto-generated ID
  createDocument: async (collection, data) => {
    try {
      const ref = adminRtdb.ref(collection).push();
      await ref.set({
        ...data,
        createdAt: ServerValue.TIMESTAMP,
        updatedAt: ServerValue.TIMESTAMP
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
        updatedAt: ServerValue.TIMESTAMP
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
        updatedAt: ServerValue.TIMESTAMP
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