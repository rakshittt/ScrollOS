import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { newsletterRules } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { name, condition, action, isActive } = body;

    const { id } = await params;
    const ruleId = parseInt(id);

    const updateData: any = { updatedAt: new Date() };
    
    if (name !== undefined) updateData.name = name;
    if (condition !== undefined) updateData.condition = condition;
    if (action !== undefined) updateData.action = action;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await db
      .update(newsletterRules)
      .set(updateData)
      .where(and(
        eq(newsletterRules.id, ruleId),
        eq(newsletterRules.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Rule not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const ruleId = parseInt(id);

    const result = await db
      .delete(newsletterRules)
      .where(and(
        eq(newsletterRules.id, ruleId),
        eq(newsletterRules.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Rule not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    );
  }
} 