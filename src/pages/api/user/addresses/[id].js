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
    
    const { id } = req.query;
    const userId = session.user.id;
    
    if (!id) {
      return res.status(400).json({ error: 'Address ID is required' });
    }
    
    // GET request - fetch a specific address
    if (req.method === 'GET') {
      const address = await userService.getAddressById(id);
      
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      // Check if the address belongs to the user
      if (address.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      return res.status(200).json(address);
    }
    
    // PUT request - update an address
    if (req.method === 'PUT') {
      const address = await userService.getAddressById(id);
      
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      // Check if the address belongs to the user
      if (address.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const addressData = req.body;
      
      // Don't allow changing the user ID
      delete addressData.userId;
      
      // Validate required fields
      if (!addressData.street || !addressData.city || !addressData.country) {
        return res.status(400).json({ error: 'Street, city, and country are required' });
      }
      
      const result = await userService.updateAddress(id, addressData);
      
      // If this address is being set as default, update other addresses
      if (addressData.isDefault) {
        await userService.setDefaultAddress(userId, id);
      }
      
      return res.status(200).json(result);
    }
    
    // PATCH request - set as default address
    if (req.method === 'PATCH') {
      const address = await userService.getAddressById(id);
      
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      // Check if the address belongs to the user
      if (address.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { isDefault } = req.body;
      
      if (isDefault === true) {
        const result = await userService.setDefaultAddress(userId, id);
        return res.status(200).json(result);
      }
      
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    // DELETE request - delete an address
    if (req.method === 'DELETE') {
      const address = await userService.getAddressById(id);
      
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      // Check if the address belongs to the user
      if (address.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const result = await userService.deleteAddress(id);
      
      // If this was the default address, set another address as default if available
      if (address.isDefault) {
        const addresses = await userService.getUserAddresses(userId);
        if (addresses.length > 0) {
          await userService.setDefaultAddress(userId, addresses[0].id);
        }
      }
      
      return res.status(200).json(result);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling address request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 