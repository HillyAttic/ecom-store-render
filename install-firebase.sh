#!/bin/bash

# Install Firebase dependencies
npm install firebase

# Create Firebase configuration file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local file with Firebase configuration placeholders"
  cat > .env.local << EOL
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

# Debug API Key
DEBUG_API_KEY=your-debug-api-key
EOL
  echo ".env.local file created. Please update it with your Firebase configuration."
else
  echo ".env.local file already exists. Please make sure it contains Firebase configuration."
fi

echo "Firebase dependencies installed successfully!"
echo "Please update your .env.local file with your Firebase configuration."
echo "You can find your Firebase configuration in the Firebase Console:"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Select your project"
echo "3. Go to Project Settings > General"
echo "4. Scroll down to 'Your apps' section"
echo "5. Copy the Firebase SDK configuration" 