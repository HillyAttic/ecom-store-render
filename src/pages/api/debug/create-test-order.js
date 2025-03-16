import { orderService } from '@/services/orderService';

// Rate limiting for debug endpoints
const rateLimit = {
  windowMs: 60000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  clients: new Map(), // IP -> {count, timestamp}
  
  check(ip) {
    const now = Date.now();
    const clientData = this.clients.get(ip) || { count: 0, timestamp: now };
    
    // Reset count if window has passed
    if (now - clientData.timestamp > this.windowMs) {
      clientData.count = 0;
      clientData.timestamp = now;
    }
    
    // Check if limit exceeded
    if (clientData.count >= this.maxRequests) {
      return false;
    }
    
    // Increment count
    clientData.count++;
    this.clients.set(ip, clientData);
    
    return true;
  },
  
  // Clean up old entries
  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.clients.entries()) {
      if (now - data.timestamp > this.windowMs) {
        this.clients.delete(ip);
      }
    }
  }
};

// Clean up rate limit data every 5 minutes
setInterval(() => rateLimit.cleanup(), 300000);

export default async function handler(req, res) {
  try {
    // Only allow in development or with proper authorization in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${process.env.DEBUG_API_KEY}`) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized access to debug endpoint' 
        });
      }
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    // Apply rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!rateLimit.check(clientIp)) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests, please try again later' 
      });
    }
    
    // Get user ID from request body or use a default test user ID
    const { userId = 'test-user-id' } = req.body;
    
    console.log(`API: Creating test order for user ${userId}`);
    
    // Create a test order with sample data
    const testOrder = {
      userId: String(userId), // Ensure userId is a string
      isTestOrder: true, // Explicitly mark as a test order
      items: [
        {
          productId: 'test-product-1',
          name: 'Test Product 1',
          price: 1999,
          quantity: 2,
          image: '/images/products/test-product-1.jpg'
        },
        {
          productId: 'test-product-2',
          name: 'Test Product 2',
          price: 2499,
          quantity: 1,
          image: '/images/products/test-product-2.jpg'
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        addressLine1: '123 Test Street',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phone: '555-123-4567'
      },
      paymentMethod: 'credit_card',
      paymentDetails: {
        cardLast4: '4242',
        cardBrand: 'visa'
      },
      totalAmount: 6497, // 2 * 1999 + 1 * 2499
      status: 'pending'
    };
    
    // Create the order using orderService
    const createdOrder = await orderService.createOrder(testOrder);
    console.log(`API: Test order created with ID: ${createdOrder.id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Test order created successfully',
      data: createdOrder
    });
  } catch (error) {
    console.error('API: Error creating test order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test order',
      error: error.message
    });
  }
} 