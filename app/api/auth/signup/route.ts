import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { message: emailValidation.error },
        { status: 400 }
      );
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          message: 'Password does not meet requirements',
          details: passwordValidation.errors.join(', ')
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    try {
      const [user] = await db.insert(users).values({
        email: email.toLowerCase().trim(),
        name: name?.trim() || email.split('@')[0],
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return NextResponse.json(
        { 
          message: 'Account created successfully',
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