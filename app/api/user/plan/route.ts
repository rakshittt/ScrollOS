import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET: All features are free
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'All features are free for everyone.' });
}

// POST: All features are free
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'All features are free for everyone.' });
} 