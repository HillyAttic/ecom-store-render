import { updateOrderStatus } from '@/models/order';

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
    
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID and status are required' 
      });
    }
    
    console.log(`Debug API: Testing update order status for order ${orderId} to ${status}`);
    
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error in debug update order API:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to update order: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 