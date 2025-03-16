import { rtdbHelpers } from '@/utils/firebase-admin';

// Get user by ID
export async function getUserById(userId) {
  try {
    return await rtdbHelpers.getDocument('users', userId);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('Failed to get user');
  }
}

// Get user profile data
export async function getUserProfile(userId) {
  try {
    const user = await rtdbHelpers.getDocument('users', userId);
    if (!user) return null;
    
    // Return only profile fields
    const { name, email, image, phone, address, preferences } = user;
    return { name, email, image, phone, address, preferences };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}

// Update user profile
export async function updateUserProfile(userId, profileData) {
  try {
    // Validate profile data
    const { name, phone } = profileData;
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    
    await rtdbHelpers.updateDocument('users', userId, updateData);
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
}

// Add or update user address
export async function updateUserAddress(userId, addressData) {
  try {
    // Validate address data
    const { street, city, state, zipCode, country, isDefault } = addressData;
    
    if (!street || !city || !state || !zipCode || !country) {
      throw new Error('All address fields are required');
    }
    
    // Create address object
    const address = {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    };
    
    // Get current user data
    const user = await rtdbHelpers.getDocument('users', userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Initialize addresses array if it doesn't exist
    const addresses = user.addresses || [];
    
    // If address has an ID, update existing address
    if (addressData.id) {
      const addressIndex = addresses.findIndex(addr => addr.id === addressData.id);
      
      if (addressIndex === -1) {
        throw new Error('Address not found');
      }
      
      // If setting as default, unset other default addresses
      if (isDefault) {
        addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      // Update the address
      addresses[addressIndex] = { ...addresses[addressIndex], ...address };
    } 
    // Add new address
    else {
      // Generate a unique ID for the new address
      const addressId = Date.now().toString();
      
      // If setting as default or first address, unset other default addresses
      if (isDefault) {
        addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      // Add the new address
      addresses.push({ id: addressId, ...address });
    }
    
    // Update the user with the new addresses array
    await rtdbHelpers.updateDocument('users', userId, { addresses });
    
    return { success: true, message: 'Address updated successfully' };
  } catch (error) {
    console.error('Error updating user address:', error);
    throw new Error(`Failed to update address: ${error.message}`);
  }
}

// Delete user address
export async function deleteUserAddress(userId, addressId) {
  try {
    // Get current user data
    const user = await rtdbHelpers.getDocument('users', userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Initialize addresses array if it doesn't exist
    const addresses = user.addresses || [];
    
    // Filter out the address to delete
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    
    // Update the user with the new addresses array
    await rtdbHelpers.updateDocument('users', userId, { addresses: updatedAddresses });
    
    return { success: true, message: 'Address deleted successfully' };
  } catch (error) {
    console.error('Error deleting user address:', error);
    throw new Error('Failed to delete address');
  }
}

// Update user preferences
export async function updateUserPreferences(userId, preferences) {
  try {
    await rtdbHelpers.updateDocument('users', userId, { preferences });
    
    return { success: true, message: 'Preferences updated successfully' };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update preferences');
  }
}

// Get user addresses
export async function getUserAddresses(userId) {
  try {
    const user = await rtdbHelpers.getDocument('users', userId);
    
    return user?.addresses || [];
  } catch (error) {
    console.error('Error getting user addresses:', error);
    throw new Error('Failed to get addresses');
  }
}

// Get user preferences
export async function getUserPreferences(userId) {
  try {
    const user = await rtdbHelpers.getDocument('users', userId);
    
    return user?.preferences || {};
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw new Error('Failed to get preferences');
  }
} 