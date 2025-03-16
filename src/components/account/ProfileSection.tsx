"use client";

import { useState } from 'react';
import { Edit2, Save, X, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
}

interface ProfileSectionProps {
  userData: UserData;
}

const ProfileSection = ({ userData }: ProfileSectionProps) => {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<UserData & { 
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({
    ...userData,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  }>({});

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setErrors(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: undefined
        }
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Validate name fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone (optional, but if provided must be valid)
    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    // Validate address fields if they exist
    if (formData.address) {
      if (formData.address.street && !formData.address.street.trim()) {
        newErrors.address = { ...newErrors.address, street: 'Street address is required' };
      }
      
      if (formData.address.city && !formData.address.city.trim()) {
        newErrors.address = { ...newErrors.address, city: 'City is required' };
      }
      
      if (formData.address.state && !formData.address.state.trim()) {
        newErrors.address = { ...newErrors.address, state: 'State is required' };
      }
      
      if (formData.address.zipCode && !formData.address.zipCode.trim()) {
        newErrors.address = { ...newErrors.address, zipCode: 'ZIP code is required' };
      }
      
      if (formData.address.country && !formData.address.country.trim()) {
        newErrors.address = { ...newErrors.address, country: 'Country is required' };
      }
    }
    
    // Validate password fields if they are shown
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    // Remove password fields before saving user data
    const { currentPassword, newPassword, confirmPassword, ...updatedUserData } = formData;
    
    // Use the updateUserProfile function from AuthContext
    updateUserProfile(updatedUserData);
    
    // Exit edit mode
    setIsEditing(false);
    setShowPasswordFields(false);
  };
  
  const handleCancel = () => {
    // Reset form data and exit edit mode
    setFormData({
      ...userData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setIsEditing(false);
    setShowPasswordFields(false);
  };
  
  return (
    <div suppressHydrationWarning>
      <div className="flex justify-between items-center mb-6" suppressHydrationWarning>
        <h2 className="text-xl font-semibold text-gray-900" suppressHydrationWarning>Personal Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center text-blue-600 hover:text-blue-800"
            suppressHydrationWarning
          >
            <Edit2 size={16} className="mr-1" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3" suppressHydrationWarning>
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-800"
              suppressHydrationWarning
            >
              <X size={16} className="mr-1" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center text-blue-600 hover:text-blue-800"
              suppressHydrationWarning
            >
              <Save size={16} className="mr-1" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-6" suppressHydrationWarning>
        {/* Personal Information Section */}
        <div suppressHydrationWarning>
          <h3 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
            {/* First Name */}
            <div suppressHydrationWarning>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-gray-700 mb-1"
                suppressHydrationWarning
              >
                First Name
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    suppressHydrationWarning
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.firstName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800" suppressHydrationWarning>{userData.firstName}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div suppressHydrationWarning>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-gray-700 mb-1"
                suppressHydrationWarning
              >
                Last Name
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    suppressHydrationWarning
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.lastName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800" suppressHydrationWarning>{userData.lastName}</p>
              )}
            </div>
            
            {/* Email */}
            <div suppressHydrationWarning>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
                suppressHydrationWarning
              >
                Email Address
              </label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    suppressHydrationWarning
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.email}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800" suppressHydrationWarning>{userData.email}</p>
              )}
            </div>
            
            {/* Phone Number */}
            <div suppressHydrationWarning>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gray-700 mb-1"
                suppressHydrationWarning
              >
                Phone Number
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    suppressHydrationWarning
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800" suppressHydrationWarning>{userData.phone}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Address Section */}
        <div suppressHydrationWarning>
          <h3 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>Shipping Address</h3>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
              {/* Street Address */}
              <div className="md:col-span-2" suppressHydrationWarning>
                <label 
                  htmlFor="street" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  suppressHydrationWarning
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="address.street"
                  value={formData.address?.street}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address?.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  suppressHydrationWarning
                />
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.address.street}</p>
                )}
              </div>
              
              {/* City */}
              <div suppressHydrationWarning>
                <label 
                  htmlFor="city" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  suppressHydrationWarning
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formData.address?.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address?.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  suppressHydrationWarning
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.address.city}</p>
                )}
              </div>
              
              {/* State */}
              <div suppressHydrationWarning>
                <label 
                  htmlFor="state" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  suppressHydrationWarning
                >
                  State / Province / Region
                </label>
                <input
                  type="text"
                  id="state"
                  name="address.state"
                  value={formData.address?.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address?.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  suppressHydrationWarning
                />
                {errors.address?.state && (
                  <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.address.state}</p>
                )}
              </div>
              
              {/* ZIP Code */}
              <div suppressHydrationWarning>
                <label 
                  htmlFor="zipCode" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  suppressHydrationWarning
                >
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={formData.address?.zipCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address?.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  suppressHydrationWarning
                />
                {errors.address?.zipCode && (
                  <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.address.zipCode}</p>
                )}
              </div>
              
              {/* Country */}
              <div suppressHydrationWarning>
                <label 
                  htmlFor="country" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  suppressHydrationWarning
                >
                  Country
                </label>
                <select
                  id="country"
                  name="address.country"
                  value={formData.address?.country}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address?.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                  suppressHydrationWarning
                >
                  <option value="">Select a country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                  {/* Add more countries as needed */}
                </select>
                {errors.address?.country && (
                  <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.address.country}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4" suppressHydrationWarning>
              <p className="text-gray-800" suppressHydrationWarning>
                {userData.address?.street}<br />
                {userData.address?.city}, {userData.address?.state} {userData.address?.zipCode}<br />
                {userData.address?.country}
              </p>
            </div>
          )}
        </div>
        
        {/* Password Section */}
        {isEditing && (
          <div suppressHydrationWarning>
            <div className="flex justify-between items-center mb-4" suppressHydrationWarning>
              <h3 className="text-lg font-medium text-gray-900" suppressHydrationWarning>Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                suppressHydrationWarning
              >
                {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
              </button>
            </div>
            
            {showPasswordFields && (
              <div className="space-y-4" suppressHydrationWarning>
                {/* Current Password */}
                <div suppressHydrationWarning>
                  <label 
                    htmlFor="currentPassword" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    Current Password
                  </label>
                  <div className="relative" suppressHydrationWarning>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      suppressHydrationWarning
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.currentPassword}</p>
                  )}
                </div>
                
                {/* New Password */}
                <div suppressHydrationWarning>
                  <label 
                    htmlFor="newPassword" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    New Password
                  </label>
                  <div className="relative" suppressHydrationWarning>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      suppressHydrationWarning
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword ? (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.newPassword}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500" suppressHydrationWarning>
                      Password must be at least 8 characters long
                    </p>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div suppressHydrationWarning>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    Confirm New Password
                  </label>
                  <div className="relative" suppressHydrationWarning>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      suppressHydrationWarning
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600" suppressHydrationWarning>{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection; 