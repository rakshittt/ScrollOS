import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResets } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }
    // Find reset token
    const reset = await db.query.passwordResets.findFirst({ where: eq(passwordResets.token, token) });
    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
    // Update user password
    const hashed = await bcrypt.hash(password, 10);
    await db.update(users).set({ password: hashed }).where(eq(users.id, reset.userId));
    // Delete the reset token
    await db.delete(passwordResets).where(eq(passwordResets.id, reset.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 