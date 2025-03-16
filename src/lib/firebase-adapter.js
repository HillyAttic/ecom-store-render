import { adminDb } from '@/utils/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * A simple Firebase adapter for NextAuth.js
 * Based on the MongoDB adapter but adapted for Firestore
 */
export function FirebaseAdapter() {
  const Users = adminDb.collection('users');
  const Sessions = adminDb.collection('sessions');
  const Accounts = adminDb.collection('accounts');
  const VerificationTokens = adminDb.collection('verification_tokens');

  return {
    async createUser(user) {
      const userData = {
        ...user,
        emailVerified: user.emailVerified ? Timestamp.fromDate(user.emailVerified) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await Users.add(userData);
      const newUser = await docRef.get();
      
      return {
        id: docRef.id,
        ...newUser.data(),
        emailVerified: newUser.data().emailVerified?.toDate() || null,
      };
    },
    
    async getUser(id) {
      const userDoc = await Users.doc(id).get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        ...userData,
        emailVerified: userData.emailVerified?.toDate() || null,
      };
    },
    
    async getUserByEmail(email) {
      const usersSnapshot = await Users.where('email', '==', email).limit(1).get();
      if (usersSnapshot.empty) return null;
      
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        id: userDoc.id,
        ...userData,
        emailVerified: userData.emailVerified?.toDate() || null,
      };
    },
    
    async getUserByAccount({ provider, providerAccountId }) {
      const accountsSnapshot = await Accounts
        .where('provider', '==', provider)
        .where('providerAccountId', '==', providerAccountId)
        .limit(1)
        .get();
      
      if (accountsSnapshot.empty) return null;
      
      const accountDoc = accountsSnapshot.docs[0];
      const userDoc = await Users.doc(accountDoc.data().userId).get();
      
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        ...userData,
        emailVerified: userData.emailVerified?.toDate() || null,
      };
    },
    
    async updateUser(user) {
      const userData = {
        ...user,
        emailVerified: user.emailVerified ? Timestamp.fromDate(user.emailVerified) : null,
        updatedAt: Timestamp.now(),
      };
      
      // Remove id from the data as it's the document ID
      const { id, ...userDataWithoutId } = userData;
      
      await Users.doc(id).update(userDataWithoutId);
      const updatedUserDoc = await Users.doc(id).get();
      const updatedUserData = updatedUserDoc.data();
      
      return {
        id: updatedUserDoc.id,
        ...updatedUserData,
        emailVerified: updatedUserData.emailVerified?.toDate() || null,
      };
    },
    
    async deleteUser(userId) {
      // Delete user's sessions
      const sessionsSnapshot = await Sessions.where('userId', '==', userId).get();
      const sessionDeletions = sessionsSnapshot.docs.map(doc => doc.ref.delete());
      
      // Delete user's accounts
      const accountsSnapshot = await Accounts.where('userId', '==', userId).get();
      const accountDeletions = accountsSnapshot.docs.map(doc => doc.ref.delete());
      
      // Delete the user
      const userDeletion = Users.doc(userId).delete();
      
      await Promise.all([...sessionDeletions, ...accountDeletions, userDeletion]);
    },
    
    async linkAccount(account) {
      const accountData = {
        ...account,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await Accounts.add(accountData);
      return {
        id: docRef.id,
        ...accountData,
      };
    },
    
    async unlinkAccount({ provider, providerAccountId }) {
      const accountsSnapshot = await Accounts
        .where('provider', '==', provider)
        .where('providerAccountId', '==', providerAccountId)
        .limit(1)
        .get();
      
      if (!accountsSnapshot.empty) {
        await accountsSnapshot.docs[0].ref.delete();
      }
    },
    
    async createSession(session) {
      const sessionData = {
        ...session,
        expires: Timestamp.fromDate(session.expires),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await Sessions.add(sessionData);
      const newSession = await docRef.get();
      const newSessionData = newSession.data();
      
      return {
        id: docRef.id,
        ...newSessionData,
        expires: newSessionData.expires.toDate(),
      };
    },
    
    async getSessionAndUser(sessionToken) {
      const sessionsSnapshot = await Sessions
        .where('sessionToken', '==', sessionToken)
        .limit(1)
        .get();
      
      if (sessionsSnapshot.empty) return null;
      
      const sessionDoc = sessionsSnapshot.docs[0];
      const sessionData = sessionDoc.data();
      
      const userDoc = await Users.doc(sessionData.userId).get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      
      return {
        session: {
          id: sessionDoc.id,
          ...sessionData,
          expires: sessionData.expires.toDate(),
        },
        user: {
          id: userDoc.id,
          ...userData,
          emailVerified: userData.emailVerified?.toDate() || null,
        },
      };
    },
    
    async updateSession(session) {
      const { id, ...sessionData } = session;
      
      const sessionUpdate = {
        ...sessionData,
        expires: sessionData.expires ? Timestamp.fromDate(sessionData.expires) : null,
        updatedAt: Timestamp.now(),
      };
      
      const sessionsSnapshot = await Sessions
        .where('sessionToken', '==', session.sessionToken)
        .limit(1)
        .get();
      
      if (sessionsSnapshot.empty) return null;
      
      const sessionDoc = sessionsSnapshot.docs[0];
      await sessionDoc.ref.update(sessionUpdate);
      
      const updatedSessionDoc = await sessionDoc.ref.get();
      const updatedSessionData = updatedSessionDoc.data();
      
      return {
        id: updatedSessionDoc.id,
        ...updatedSessionData,
        expires: updatedSessionData.expires.toDate(),
      };
    },
    
    async deleteSession(sessionToken) {
      const sessionsSnapshot = await Sessions
        .where('sessionToken', '==', sessionToken)
        .limit(1)
        .get();
      
      if (!sessionsSnapshot.empty) {
        await sessionsSnapshot.docs[0].ref.delete();
      }
    },
    
    async createVerificationToken(verificationToken) {
      const verificationTokenData = {
        ...verificationToken,
        expires: Timestamp.fromDate(verificationToken.expires),
        createdAt: Timestamp.now(),
      };
      
      await VerificationTokens.add(verificationTokenData);
      return verificationToken;
    },
    
    async useVerificationToken({ identifier, token }) {
      const verificationTokensSnapshot = await VerificationTokens
        .where('identifier', '==', identifier)
        .where('token', '==', token)
        .limit(1)
        .get();
      
      if (verificationTokensSnapshot.empty) return null;
      
      const verificationTokenDoc = verificationTokensSnapshot.docs[0];
      const verificationTokenData = verificationTokenDoc.data();
      
      // Delete the verification token
      await verificationTokenDoc.ref.delete();
      
      return {
        ...verificationTokenData,
        expires: verificationTokenData.expires.toDate(),
      };
    },
  };
} 