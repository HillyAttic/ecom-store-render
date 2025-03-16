import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUserPreferences, updateUserPreferences } from "@/models/user";

export default async function handler(req, res) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const userId = session.user.id;
    
    // Handle GET request - Get user preferences
    if (req.method === "GET") {
      const preferences = await getUserPreferences(userId);
      return res.status(200).json({ success: true, data: preferences });
    }
    
    // Handle PUT request - Update user preferences
    if (req.method === "PUT") {
      const { 
        orderUpdates, 
        promotions, 
        accountActivity,
        dataCollection,
        personalizedRecommendations,
        cookies
      } = req.body;
      
      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No preference data provided" 
        });
      }
      
      // Create preferences object with only provided values
      const preferences = {};
      
      if (orderUpdates !== undefined) preferences.orderUpdates = Boolean(orderUpdates);
      if (promotions !== undefined) preferences.promotions = Boolean(promotions);
      if (accountActivity !== undefined) preferences.accountActivity = Boolean(accountActivity);
      if (dataCollection !== undefined) preferences.dataCollection = Boolean(dataCollection);
      if (personalizedRecommendations !== undefined) preferences.personalizedRecommendations = Boolean(personalizedRecommendations);
      if (cookies !== undefined) preferences.cookies = Boolean(cookies);
      
      const result = await updateUserPreferences(userId, preferences);
      
      return res.status(200).json(result);
    }
    
    // Handle unsupported methods
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Error in preferences API:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
} 