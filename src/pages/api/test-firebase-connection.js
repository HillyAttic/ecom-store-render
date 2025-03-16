import { adminRtdb } from '@/utils/firebase-admin';

export default async function handler(req, res) {
  try {
    // Check if the database URL is configured
    const databaseURL = process.env.FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return res.status(500).json({ 
        error: 'Firebase database URL is not configured',
        status: 'error'
      });
    }

    // Try to connect to the database and read a simple path
    const testRef = adminRtdb.ref('test');
    const snapshot = await testRef.once('value');
    
    // Return success even if the path doesn't exist
    return res.status(200).json({ 
      message: 'Firebase Realtime Database connection successful',
      pathExists: snapshot.exists(),
      databaseURL: databaseURL,
      status: 'success'
    });
  } catch (error) {
    console.error('Firebase connection test error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      status: 'error'
    });
  }
} 