import { cartService } from '@/services/cartService';
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
    
    // GET request - fetch user's cart
    if (req.method === 'GET') {
      const cart = await cartService.getUserCart(userId);
      return res.status(200).json(cart);
    }
    
    // POST request - add item to cart
    if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      const result = await cartService.addToCart(userId, productId, quantity);
      return res.status(200).json(result);
    }
    
    // PUT request - update item quantity
    if (req.method === 'PUT') {
      const { productId, quantity } = req.body;
      
      if (!productId || quantity === undefined) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }
      
      const result = await cartService.updateCartItemQuantity(userId, productId, quantity);
      return res.status(200).json(result);
    }
    
    // DELETE request - remove item from cart or clear cart
    if (req.method === 'DELETE') {
      const { productId, clearCart } = req.query;
      
      if (clearCart === 'true') {
        const result = await cartService.clearCart(userId);
        return res.status(200).json(result);
      }
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      const result = await cartService.removeFromCart(userId, productId);
      return res.status(200).json(result);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling cart request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 