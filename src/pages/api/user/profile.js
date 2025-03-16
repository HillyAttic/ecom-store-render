import { userService } from '@/services/userService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    // GET request - fetch user's profile
    if (req.method === 'GET') {
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't send sensitive information
      const { email, name, image } = user;
      
      return res.status(200).json({ id: userId, email, name, image });
    }
    
    // PUT request - update user's profile
    if (req.method === 'PUT') {
      const userData = req.body;
      
      // Don't allow changing email through this endpoint
      delete userData.email;
      
      // Validate required fields
      if (!userData.name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const result = await userService.updateUser(userId, userData);
      return res.status(200).json(result);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling profile request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 