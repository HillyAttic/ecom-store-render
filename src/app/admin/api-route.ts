import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect(new URL('/admin/login', 'http://localhost:3000'));
} 