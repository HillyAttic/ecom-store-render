import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getOrderCountsByStatus } from "@/models/order";

export default async function handler(req, res) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const userId = session.user.id;
    
    // Handle GET request - Get order counts by status
    if (req.method === "GET") {
      const counts = await getOrderCountsByStatus(userId);
      return res.status(200).json({ success: true, data: counts });
    }
    
    // Handle unsupported methods
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Error in order counts API:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
} 