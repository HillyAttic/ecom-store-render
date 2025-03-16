import { rtdbHelpers } from '@/utils/firebase';
import { productService } from './productService';

const COLLECTION_NAME = 'carts';

export const cartService = {
  // Get a user's cart
  getUserCart: async (userId) => {
    try {
      const queryOptions = {
        where: [['userId', '==', userId]],
        limit: 1
      };
      
      const carts = await rtdbHelpers.queryDocuments(COLLECTION_NAME, queryOptions);
      
      // If user doesn't have a cart yet, create one
      if (carts.length === 0) {
        const newCart = {
          userId,
          items: [],
          totalItems: 0,
          totalPrice: 0
        };
        
        const result = await rtdbHelpers.createDocument(COLLECTION_NAME, newCart);
        return { id: result.id, ...newCart };
      }
      
      return carts[0];
    } catch (error) {
      console.error(`Error getting cart for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Add an item to the cart
  addToCart: async (userId, productId, quantity = 1) => {
    try {
      // Get the user's cart
      const cart = await cartService.getUserCart(userId);
      
      // Get the product details
      const product = await productService.getProductById(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Check if the product is already in the cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity if the product is already in the cart
        updatedItems = [...cart.items];
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item if the product is not in the cart
        const newItem = {
          productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity
        };
        updatedItems = [...cart.items, newItem];
      }
      
      // Calculate new totals
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Update the cart
      const updatedCart = {
        items: updatedItems,
        totalItems,
        totalPrice
      };
      
      await rtdbHelpers.updateDocument(COLLECTION_NAME, cart.id, updatedCart);
      
      return { id: cart.id, ...updatedCart, userId };
    } catch (error) {
      console.error(`Error adding product ${productId} to cart for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Update item quantity in the cart
  updateCartItemQuantity: async (userId, productId, quantity) => {
    try {
      // Get the user's cart
      const cart = await cartService.getUserCart(userId);
      
      // Find the item in the cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex < 0) {
        throw new Error(`Product with ID ${productId} not found in the cart`);
      }
      
      let updatedItems;
      if (quantity <= 0) {
        // Remove the item if quantity is 0 or negative
        updatedItems = cart.items.filter(item => item.productId !== productId);
      } else {
        // Update the quantity
        updatedItems = [...cart.items];
        updatedItems[existingItemIndex].quantity = quantity;
      }
      
      // Calculate new totals
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Update the cart
      const updatedCart = {
        items: updatedItems,
        totalItems,
        totalPrice
      };
      
      await rtdbHelpers.updateDocument(COLLECTION_NAME, cart.id, updatedCart);
      
      return { id: cart.id, ...updatedCart, userId };
    } catch (error) {
      console.error(`Error updating quantity for product ${productId} in cart for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Remove an item from the cart
  removeFromCart: async (userId, productId) => {
    try {
      // Get the user's cart
      const cart = await cartService.getUserCart(userId);
      
      // Remove the item from the cart
      const updatedItems = cart.items.filter(item => item.productId !== productId);
      
      // Calculate new totals
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Update the cart
      const updatedCart = {
        items: updatedItems,
        totalItems,
        totalPrice
      };
      
      await rtdbHelpers.updateDocument(COLLECTION_NAME, cart.id, updatedCart);
      
      return { id: cart.id, ...updatedCart, userId };
    } catch (error) {
      console.error(`Error removing product ${productId} from cart for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Clear the cart
  clearCart: async (userId) => {
    try {
      // Get the user's cart
      const cart = await cartService.getUserCart(userId);
      
      // Clear the cart
      const updatedCart = {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
      
      await rtdbHelpers.updateDocument(COLLECTION_NAME, cart.id, updatedCart);
      
      return { id: cart.id, ...updatedCart, userId };
    } catch (error) {
      console.error(`Error clearing cart for user ${userId}:`, error);
      throw error;
    }
  }
}; 