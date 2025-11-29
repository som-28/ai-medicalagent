'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface PaymentTransaction {
  id: number;
  userId: string;
  clerkUserId: string;
  upiTransactionId: string;
  amount: number;
  status: string;
  planType: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user } = useUser();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch('/api/payment/verify-upi');
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.payments || []);
      } else {
        toast.error(data.error || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (transactionId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/payment/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionDbId: transactionId,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchPendingPayments(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Failed to process payment');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Pending UPI Payments</h1>

        {payments.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border bg-card p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">User Email</p>
                    <p className="font-semibold">{payment.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{payment.upiTransactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">₹{payment.amount / 100}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => handleVerify(payment.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve & Upgrade User
                  </Button>
                  <Button
                    onClick={() => handleVerify(payment.id, 'reject')}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
