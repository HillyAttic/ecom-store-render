import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { adminRtdb } from "@/utils/firebase-admin";

export default async function handler(req, res) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // In a real app, you would check if the user is an admin
    // For now, we'll assume all authenticated users can access admin endpoints
    // const isAdmin = session.user.role === 'admin';
    // if (!isAdmin) {
    //   return res.status(403).json({ success: false, message: "Forbidden" });
    // }
    
    // Handle GET request - Get all orders
    if (req.method === "GET") {
      // Get all orders
      console.log("Fetching all orders from Firebase RTDB...");
      const ordersRef = adminRtdb.ref('orders');
      const ordersSnapshot = await ordersRef.orderByChild('createdAt').once('value');
      
      const orders = [];
      // Get user information for each order
      if (ordersSnapshot.exists()) {
        // Log the snapshot data structure for debugging
        console.log("Orders snapshot exists, processing orders...");
        const ordersData = ordersSnapshot.val();
        
        // Process each order and ensure it has an ID
        for (const [orderId, orderData] of Object.entries(ordersData || {})) {
          let userName = '';
          let userEmail = '';
          
          console.log(`Processing order ${orderId}`, orderData ? 'data exists' : 'missing data');
          
          // Skip records without data or with test flag
          if (!orderData || orderData.isTestOrder) {
            continue;
          }
          
          // Get user information if userId exists
          if (orderData.userId) {
            const userRef = adminRtdb.ref(`users/${orderData.userId}`);
            const userSnapshot = await userRef.once('value');
            
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              userName = `${userData.name || ''} ${userData.lastName || ''}`;
              userEmail = userData.email || '';
            }
          }
          
          // Ensure both id and _id are present
          const normalizedOrder = {
            ...orderData,
            id: orderData.id || orderId,
            _id: orderData._id || orderId,
            orderId: orderData.orderId || orderId, // Add orderId as well for compatibility
            userName,
            userEmail
          };
          
          console.log(`Processed order: ${normalizedOrder._id} (${normalizedOrder.status})`);
          orders.push(normalizedOrder);
        }
      } else {
        console.log("Orders snapshot doesn't exist or is empty");
      }
      
      // Sort orders by createdAt in descending order
      orders.sort((a, b) => {
        // Use timestamp values if available, otherwise use 0
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime; // Descending order (newest first)
      });
      
      console.log(`Returning ${orders.length} orders to admin dashboard`);
      return res.status(200).json({ success: true, data: orders });
    }
    
    // Handle unsupported methods
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Error in admin orders API:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
} 