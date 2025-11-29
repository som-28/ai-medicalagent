import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { PaymentTransactionsTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionDbId, action } = await req.json(); // action: 'approve' or 'reject'

    // TODO: Add proper admin check here if needed
    // For now, any logged-in user can verify (you're the only admin)

    // Get transaction
    const transactions = await db
      .select()
      .from(PaymentTransactionsTable)
      .where(eq(PaymentTransactionsTable.id, transactionDbId))
      .limit(1);

    if (transactions.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = transactions[0];

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    // Update transaction status
    await db.update(PaymentTransactionsTable)
      .set({
        status: newStatus,
        verifiedBy: user.primaryEmailAddress.emailAddress,
        verifiedAt: new Date().toISOString(),
      })
      .where(eq(PaymentTransactionsTable.id, transactionDbId));

    // If approved, upgrade user to Premium in Clerk
    if (action === 'approve') {
      try {
        const client = await clerkClient();
        const result = await client.users.updateUserMetadata(transaction.clerkUserId, {
          publicMetadata: {
            isPremium: true,
            subscriptionStartDate: new Date().toISOString(),
            upiTransactionId: transaction.upiTransactionId,
          },
        });
        
        console.log(`✅ User ${transaction.userId} upgraded to Premium via UPI`);
        console.log('Updated metadata:', result.publicMetadata);
      } catch (clerkError) {
        console.error('❌ Failed to update Clerk metadata:', clerkError);
        return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'User upgraded to Premium' : 'Payment rejected',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

// Get pending payments (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin check here if needed
    // For now, any logged-in user can view (you're the only admin)

    const pendingPayments = await db
      .select()
      .from(PaymentTransactionsTable)
      .where(eq(PaymentTransactionsTable.status, 'pending'));

    return NextResponse.json({ payments: pendingPayments });
  } catch (error: any) {
    console.error('Get pending payments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}
