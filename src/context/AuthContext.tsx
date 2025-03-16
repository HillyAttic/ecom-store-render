"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

// Define user interface
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Preferences {
  orderUpdates?: boolean;
  promotions?: boolean;
  accountActivity?: boolean;
  dataCollection?: boolean;
  personalizedRecommendations?: boolean;
  cookies?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

type AuthContextType = {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider?: string, options?: any) => Promise<any>;
  signOut: (options?: any) => Promise<any>;
  getUserProfile: () => Promise<any>;
  updateUserProfile: (profileData: { name?: string; phone?: string }) => Promise<any>;
  getUserAddresses: () => Promise<Address[]>;
  addUserAddress: (address: Omit<Address, '_id'>) => Promise<any>;
  updateUserAddress: (addressId: string, address: Omit<Address, '_id'>) => Promise<any>;
  deleteUserAddress: (addressId: string) => Promise<any>;
  getUserPreferences: () => Promise<Preferences>;
  updateUserPreferences: (preferences: Partial<Preferences>) => Promise<any>;
  getUserOrders: () => Promise<Order[]>;
  getOrderById: (orderId: string) => Promise<Order>;
  createOrder: (orderData: Omit<Order, '_id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<any>;
  cancelOrder: (orderId: string) => Promise<any>;
  getOrderCounts: () => Promise<Record<Order['status'], number>>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "unauthenticated",
  signIn: () => Promise.resolve(null),
  signOut: () => Promise.resolve(null),
  getUserProfile: () => Promise.resolve(null),
  updateUserProfile: () => Promise.resolve(null),
  getUserAddresses: () => Promise.resolve([]),
  addUserAddress: () => Promise.resolve(null),
  updateUserAddress: () => Promise.resolve(null),
  deleteUserAddress: () => Promise.resolve(null),
  getUserPreferences: () => Promise.resolve({}),
  updateUserPreferences: () => Promise.resolve(null),
  getUserOrders: () => Promise.resolve([]),
  getOrderById: () => Promise.resolve({} as Order),
  createOrder: () => Promise.resolve(null),
  updateOrderStatus: () => Promise.resolve(null),
  cancelOrder: () => Promise.resolve(null),
  getOrderCounts: () => Promise.resolve({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // Get user profile data
  const getUserProfile = async () => {
    try {
      if (!session) return null;
      
      const response = await fetch('/api/user/profile');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get user profile');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData: { name?: string; phone?: string }) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Get user addresses
  const getUserAddresses = async (): Promise<Address[]> => {
    try {
      if (!session) return [];
      
      const response = await fetch('/api/user/addresses');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get addresses');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error getting addresses:', error);
      return [];
    }
  };

  // Add user address
  const addUserAddress = async (address: Omit<Address, '_id'>) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to add address');
      }
      
      return result;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  };

  // Update user address
  const updateUserAddress = async (addressId: string, address: Omit<Address, '_id'>) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update address');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  // Delete user address
  const deleteUserAddress = async (addressId: string) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete address');
      }
      
      return result;
      } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };

  // Get user preferences
  const getUserPreferences = async (): Promise<Preferences> => {
    try {
      if (!session) return {};
      
      const response = await fetch('/api/user/preferences');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get preferences');
      }
      
      return result.data || {};
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {};
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: Partial<Preferences>) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update preferences');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  // Get user orders
  const getUserOrders = async (): Promise<Order[]> => {
    try {
      if (!session) {
        console.log("AuthContext.getUserOrders: No session found, returning empty orders array");
        return [];
      }
      
      console.log("AuthContext.getUserOrders: Fetching orders with session:", session.user?.email);
      console.log("AuthContext.getUserOrders: User ID:", session.user?.id);
      
      const response = await fetch('/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          // Add explicit authorization header with session token if available
          ...(session?.user && { 'Authorization': `Bearer ${session.user.email}` })
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AuthContext.getUserOrders: Error response from /api/orders: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to get orders: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("AuthContext.getUserOrders: API response:", result);
      
      if (!result.success) {
        console.error("AuthContext.getUserOrders: API returned success: false", result.message);
        throw new Error(result.message || 'Failed to get orders');
      }
      
      // Ensure data is an array
      const orders = Array.isArray(result.data) ? result.data : [];
      console.log(`AuthContext.getUserOrders: Successfully fetched ${orders.length} orders`);
      
      // Log the first order for debugging
      if (orders.length > 0) {
        console.log("AuthContext.getUserOrders: First order sample:", {
          id: orders[0].id,
          userId: orders[0].userId,
          status: orders[0].status,
          itemCount: orders[0].items?.length || 0
        });
      }
      
      return orders;
    } catch (error) {
      console.error('AuthContext.getUserOrders: Error getting orders:', error);
      // Don't use showNotification here as it's not defined in this context
      return [];
    }
  };

  // Get order by ID
  const getOrderById = async (orderId: string): Promise<Order> => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get order');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  };

  // Create order
  const createOrder = async (orderData: Omit<Order, '_id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create order');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update order status');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string): Promise<any> => {
    try {
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to cancel order');
      }
      
      return result;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };

  // Get order counts by status
  const getOrderCounts = async (): Promise<Record<Order['status'], number>> => {
    try {
      if (!session) return {} as Record<Order['status'], number>;
      
      const response = await fetch('/api/orders/counts');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get order counts');
      }
      
      return result.data || {};
    } catch (error) {
      console.error('Error getting order counts:', error);
      return {} as Record<Order['status'], number>;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      status, 
      signIn, 
      signOut,
      getUserProfile,
      updateUserProfile,
      getUserAddresses,
      addUserAddress,
      updateUserAddress,
      deleteUserAddress,
      getUserPreferences,
      updateUserPreferences,
      getUserOrders,
      getOrderById,
      createOrder,
      updateOrderStatus,
      cancelOrder,
      getOrderCounts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 