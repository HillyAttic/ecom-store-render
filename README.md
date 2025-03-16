# E-commerce Store with Firebase Firestore

This is an e-commerce store application built with Next.js, Firebase Firestore, and Socket.io for real-time updates.

## Features

- User authentication with NextAuth
- Real-time order updates with Firebase Firestore and Socket.io
- Product catalog with search and filtering
- Shopping cart and wishlist functionality
- Order management system
- Admin dashboard for managing products and orders

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Firebase account

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Firestore Database
   - Go to Firestore Database in the Firebase Console
   - Click "Create Database"
   - Start in production mode
   - Choose a location close to your users
5. Set up Authentication
   - Go to Authentication in the Firebase Console
   - Enable Email/Password and Google authentication methods
6. Get your Firebase configuration
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the Firebase SDK configuration

### Local Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd ecom-store
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # Google OAuth (for NextAuth)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Debug API Key
   DEBUG_API_KEY=your-debug-api-key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3004](http://localhost:3004) in your browser

### Firestore Data Structure

The application uses the following collections in Firestore:

- **users**: User profiles and authentication data
- **orders**: Order information including items, shipping details, and status
- **products**: Product catalog with details, pricing, and inventory
- **addresses**: User shipping addresses
- **preferences**: User preferences and settings

### Firebase Security Rules

Add these security rules to your Firestore database for proper access control:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        request.auth.token.admin == true
      );
    }
    
    // Allow all authenticated users to read products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow users to read and write their own addresses
    match /addresses/{addressId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read and write their own preferences
    match /preferences/{userId} {
      allow read, write: if request.auth != null && userId == request.auth.uid;
    }
  }
}
```

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy

### Firebase Hosting Deployment

1. Install Firebase CLI
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting
   ```bash
   firebase init hosting
   ```

4. Build the Next.js application
   ```bash
   npm run build
   ```

5. Deploy to Firebase Hosting
   ```bash
   firebase deploy --only hosting
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
