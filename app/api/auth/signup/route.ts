import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    try {
      const [user] = await db.insert(users).values({
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return NextResponse.json(
        { 
          message: 'User created successfully',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database error during user creation:', dbError);
      return NextResponse.json(
        { message: 'Error creating user account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in signup:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 