import { rtdbHelpers } from '@/utils/firebase';

const COLLECTION_NAME = 'users';
const ADDRESS_COLLECTION = 'addresses';

export const userService = {
  // Get a user by ID
  getUserById: async (userId) => {
    try {
      const user = await rtdbHelpers.getDocument(COLLECTION_NAME, userId);
      return user;
    } catch (error) {
      console.error(`Error getting user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Get a user by email
  getUserByEmail: async (email) => {
    try {
      const queryOptions = {
        where: [['email', '==', email]],
        limit: 1
      };
      
      const users = await rtdbHelpers.queryDocuments(COLLECTION_NAME, queryOptions);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error(`Error getting user with email ${email}:`, error);
      throw error;
    }
  },
  
  // Create a new user
  createUser: async (userData) => {
    try {
      const result = await rtdbHelpers.createDocument(COLLECTION_NAME, userData);
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Update a user
  updateUser: async (userId, userData) => {
    try {
      const result = await rtdbHelpers.updateDocument(COLLECTION_NAME, userId, userData);
      return result;
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Delete a user
  deleteUser: async (userId) => {
    try {
      const result = await rtdbHelpers.deleteDocument(COLLECTION_NAME, userId);
      return result;
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      throw error;
    }
  },
  
  // Get all addresses for a user
  getUserAddresses: async (userId) => {
    try {
      const queryOptions = {
        where: [['userId', '==', userId]]
      };
      
      const addresses = await rtdbHelpers.queryDocuments(ADDRESS_COLLECTION, queryOptions);
      return addresses;
    } catch (error) {
      console.error(`Error getting addresses for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Get a specific address
  getAddressById: async (addressId) => {
    try {
      const address = await rtdbHelpers.getDocument(ADDRESS_COLLECTION, addressId);
      return address;
    } catch (error) {
      console.error(`Error getting address with ID ${addressId}:`, error);
      throw error;
    }
  },
  
  // Add a new address for a user
  addUserAddress: async (userId, addressData) => {
    try {
      const addressWithUserId = {
        ...addressData,
        userId
      };
      
      const result = await rtdbHelpers.createDocument(ADDRESS_COLLECTION, addressWithUserId);
      return result;
    } catch (error) {
      console.error(`Error adding address for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Update an address
  updateAddress: async (addressId, addressData) => {
    try {
      const result = await rtdbHelpers.updateDocument(ADDRESS_COLLECTION, addressId, addressData);
      return result;
    } catch (error) {
      console.error(`Error updating address with ID ${addressId}:`, error);
      throw error;
    }
  },
  
  // Delete an address
  deleteAddress: async (addressId) => {
    try {
      const result = await rtdbHelpers.deleteDocument(ADDRESS_COLLECTION, addressId);
      return result;
    } catch (error) {
      console.error(`Error deleting address with ID ${addressId}:`, error);
      throw error;
    }
  },
  
  // Set an address as default
  setDefaultAddress: async (userId, addressId) => {
    try {
      // First, get all user addresses
      const addresses = await userService.getUserAddresses(userId);
      
      // Update all addresses to not be default
      const updatePromises = addresses.map(address => {
        if (address.id === addressId) {
          return rtdbHelpers.updateDocument(ADDRESS_COLLECTION, address.id, { isDefault: true });
        } else if (address.isDefault) {
          return rtdbHelpers.updateDocument(ADDRESS_COLLECTION, address.id, { isDefault: false });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      return { success: true };
    } catch (error) {
      console.error(`Error setting default address ${addressId} for user ${userId}:`, error);
      throw error;
    }
  }
}; 