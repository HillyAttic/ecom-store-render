import { userService } from '@/services/userService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    // GET request - fetch user's addresses
    if (req.method === 'GET') {
      const addresses = await userService.getUserAddresses(userId);
      return res.status(200).json(addresses);
    }
    
    // POST request - add a new address
    if (req.method === 'POST') {
      const addressData = req.body;
      
      // Validate required fields
      if (!addressData.street || !addressData.city || !addressData.country) {
        return res.status(400).json({ error: 'Street, city, and country are required' });
      }
      
      // Check if this is the first address and set it as default if so
      const existingAddresses = await userService.getUserAddresses(userId);
      if (existingAddresses.length === 0) {
        addressData.isDefault = true;
      }
      
      const result = await userService.addUserAddress(userId, addressData);
      return res.status(201).json(result);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling address request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 