import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We'll handle token verification in the API routes since middleware
// can't directly use Firebase Admin due to Edge runtime limitations

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, /users, etc.)
  const path = request.nextUrl.pathname;

  // TEMPORARILY DISABLED - Remove this comment to re-enable authentication
  /*
  // If it's an admin path but not the login page
  if (path.startsWith('/admin') && path !== '/admin/login') {
    // Check if user is authenticated by looking for the token in cookies
    const token = request.cookies.get('adminToken')?.value;
    
    // If there's no token, redirect to the login page
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If it's the admin login page and user is already authenticated
  if (path === '/admin/login') {
    const token = request.cookies.get('adminToken')?.value;
    
    // If there's a token, redirect to the dashboard
    if (token) {
      const dashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  */

  // If it's an admin path but not the login page
  if (path.startsWith('/admin') && path !== '/admin/login') {
    // Check if user is authenticated by looking for the token in cookies
    const token = request.cookies.get('adminToken')?.value;
    
    // If there's no token, redirect to the login page
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // We can't verify the token here because Firebase Admin SDK
    // can't run in Edge runtime. We'll verify in the API/page components.
  }

  // If it's the admin login page and user is already authenticated
  if (path === '/admin/login') {
    const token = request.cookies.get('adminToken')?.value;
    
    // If there's a token, redirect to the dashboard
    if (token) {
      const dashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // If the path is /adimin (typo), redirect to /admin
  if (path.startsWith('/adimin')) {
    const correctPath = path.replace('/adimin', '/admin');
    const redirectUrl = new URL(correctPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/adimin/:path*', // Include the typo path for redirection
  ],
}; 