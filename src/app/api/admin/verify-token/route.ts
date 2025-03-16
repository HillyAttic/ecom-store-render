import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No authentication token found'
      }, { status: 401 });
    }

    // Verify token with Firebase Admin SDK
    const { valid, uid } = await verifyToken(token);

    if (!valid) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true,
      uid: uid
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ 
      authenticated: false,
      message: 'Server error during authentication'
    }, { status: 500 });
  }
} 