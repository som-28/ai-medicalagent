import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { PaymentTransactionsTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { upiTransactionId, amount, planType } = await req.json();

    if (!upiTransactionId || !amount || !planType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    // Check if transaction ID already exists
    const existingTransaction = await db
      .select()
      .from(PaymentTransactionsTable)
      .where(eq(PaymentTransactionsTable.upiTransactionId, upiTransactionId))
      .limit(1);

    if (existingTransaction.length > 0) {
      return NextResponse.json(
        { error: 'This transaction ID has already been submitted' },
        { status: 400 }
      );
    }

    // Insert payment transaction
    const result = await db.insert(PaymentTransactionsTable).values({
      userId: userEmail,
      clerkUserId: user.id,
      upiTransactionId,
      amount,
      status: 'pending',
      planType,
      paymentMethod: 'upi',
      createdAt: new Date().toISOString(),
    }).returning();

    console.log('UPI payment submitted:', result[0]);

    return NextResponse.json({
      success: true,
      transactionId: result[0].id,
      message: 'Payment submitted successfully. You will be upgraded once verified.',
    });
  } catch (error: any) {
    console.error('UPI payment submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit payment' },
      { status: 500 }
    );
  }
}
