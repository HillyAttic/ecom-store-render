import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { adminRtdb, rtdbHelpers } from "@/utils/firebase-admin";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          console.error('User has no email address');
          return false;
        }
        
        // Check if user exists in Firebase
        const usersRef = adminRtdb.ref('users');
        const userQuery = usersRef.orderByChild('email').equalTo(user.email);
        const snapshot = await userQuery.once('value');
        
        if (!snapshot.exists()) {
          // Create new user in Firebase if they don't exist
          await rtdbHelpers.createDocument('users', {
            name: user.name || 'Anonymous User',
            email: user.email,
            image: user.image || null,
            emailVerified: user.emailVerified || null
          });
          console.log(`Created new user in Firebase: ${user.email}`);
        } else {
          console.log(`User already exists in Firebase: ${user.email}`);
        }
        
        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        // Still allow sign in even if Firebase operation fails
        // This prevents users from being locked out if Firebase is temporarily unavailable
        return true;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user?.email) {
          // Get user from Firebase
          const usersRef = adminRtdb.ref('users');
          const userQuery = usersRef.orderByChild('email').equalTo(session.user.email);
          const snapshot = await userQuery.once('value');
          
          if (snapshot.exists()) {
            let firebaseUser = null;
            let userId = null;
            
            snapshot.forEach(childSnapshot => {
              firebaseUser = childSnapshot.val();
              userId = childSnapshot.key;
            });
            
            if (firebaseUser && userId) {
              // Add Firebase user ID to the session
              session.user.id = userId;
              
              // Update user's image if it has changed
              if (session.user.image && session.user.image !== firebaseUser.image) {
                await rtdbHelpers.updateDocument('users', userId, {
                  image: session.user.image
                });
              }
            }
          } else {
            console.warn(`User ${session.user.email} not found in Firebase during session callback`);
          }
        }
        
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async jwt({ token, user, account }) {
      // Add user ID to the token when it's first created
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key",
  session: {
    strategy: "jwt", // Use JWT instead of database strategy since we're using Firebase
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default NextAuth(authOptions); 