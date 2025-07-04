import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { email, password, name, plan } = await req.json();

    if (!email || !password || !plan) {
      return NextResponse.json(
        { message: 'Email, password, and plan are required' },
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

    // Declare Dodo env variables at the top
    const DODO_PRODUCT_ID = process.env.DODO_PRODUCT_ID;
    const DODO_PRODUCT_ID_PRO = process.env.DODO_PRODUCT_ID_PRO;
    const DODO_PRODUCT_ID_PRO_PLUS = process.env.DODO_PRODUCT_ID_PRO_PLUS;
    const DODO_RETURN_URL = process.env.DODO_RETURN_URL;
    if (!DODO_RETURN_URL) {
      return NextResponse.json({ message: 'Dodo Payments environment variables missing' }, { status: 500 });
    }

    // Create user
    try {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const [user] = await db.insert(users).values({
        email: email.toLowerCase().trim(),
        name: name?.trim() || email.split('@')[0],
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        plan: plan,
        planTrialEndsAt: trialEnds,
        planExpiresAt: null,
      }).returning();

      // Generate Dodo Payments static checkout link (no backend fetch)
      const baseUrl = 'https://checkout.dodopayments.com/buy/';
      let productId = DODO_PRODUCT_ID;
      if (plan === 'pro' && DODO_PRODUCT_ID_PRO) {
        productId = DODO_PRODUCT_ID_PRO;
      } else if (plan === 'pro_plus' && DODO_PRODUCT_ID_PRO_PLUS) {
        productId = DODO_PRODUCT_ID_PRO_PLUS;
      }
      // Construct redirect_url with userId and plan for callback
      const redirectUrl = encodeURIComponent(`${DODO_RETURN_URL}?userId=${user.id}&plan=${plan}`);
      const checkoutUrl = `${baseUrl}${productId}?redirect_url=${redirectUrl}&email=${encodeURIComponent(user.email)}`;
      return NextResponse.json({ checkout_url: checkoutUrl }, { status: 201 });
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