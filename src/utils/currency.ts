// Currency conversion utility

// Current exchange rate (as of implementation time)
// In a production app, you might fetch this from an API
const USD_TO_INR_RATE = 83.5;

/**
 * Convert USD to INR
 * @param usdAmount - Amount in USD
 * @returns Amount in INR (rounded to 2 decimal places)
 */
export const usdToInr = (usdAmount: number): number => {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount)) {
    console.error('Invalid USD amount:', usdAmount);
    return 0;
  }
  return Number((usdAmount * USD_TO_INR_RATE).toFixed(2));
};

/**
 * Convert INR to USD
 * @param inrAmount - Amount in INR
 * @returns Amount in USD (rounded to 2 decimal places)
 */
export const inrToUsd = (inrAmount: number): number => {
  if (typeof inrAmount !== 'number' || isNaN(inrAmount)) {
    console.error('Invalid INR amount:', inrAmount);
    return 0;
  }
  return Number((inrAmount / USD_TO_INR_RATE).toFixed(2));
};

/**
 * Format currency for display
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.error('Invalid amount:', amount);
    return '₹0.00';
  }
  return `₹${amount.toFixed(2)}`;
};

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
  if (!originalPrice || originalPrice <= 0 || !discountedPrice || discountedPrice <= 0) {
    return 0;
  }
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Ensure price is a valid number
 * @param price - Price to validate
 * @returns Validated price as number
 */
export const validatePrice = (price: any): number => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price;
  }
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  console.error('Invalid price value:', price);
  return 0;
};

/**
 * Process price for display and storage
 * @param price - Price to process
 * @returns Processed price
 */
export const processPrice = (price: number): number => {
  return validatePrice(price);
}; 