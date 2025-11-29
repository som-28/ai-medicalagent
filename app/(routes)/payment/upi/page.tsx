'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { IconCheck, IconCopy, IconSparkles } from '@tabler/icons-react';
import Image from 'next/image';

export default function UPIPaymentPage() {
  const { user } = useUser();
  const router = useRouter();
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Your team member's UPI ID - UPDATE THIS
  const UPI_ID = 'somuuu23@okhdfcbank';
  const AMOUNT = 299;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter UPI Transaction ID');
      return;
    }

    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payment/upi-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiTransactionId: transactionId.trim(),
          amount: AMOUNT * 100, // Convert to paise
          planType: 'premium',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment submitted! You will be upgraded to Premium once verified.');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <IconSparkles size={16} />
            Upgrade to Premium
          </div>
          <h1 className="mb-2 text-3xl font-bold">Pay via UPI</h1>
          <p className="text-muted-foreground">
            Scan QR code or pay manually using UPI ID
          </p>
        </div>

        <div className="space-y-6">
          {/* Payment Card */}
          <div className="rounded-3xl border bg-card p-8">
            <div className="mb-6 text-center">
              <p className="mb-2 text-5xl font-bold">₹{AMOUNT}</p>
              <p className="text-sm text-muted-foreground">Premium Plan - Monthly</p>
            </div>

            {/* QR Code Section */}
            <div className="mb-6 rounded-2xl border bg-muted/50 p-6">
              <h3 className="mb-4 text-center font-semibold">Scan QR Code to Pay</h3>
              <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl bg-white p-2">
                <Image
                  src="/UPI qr.jpg"
                  alt="UPI QR Code"
                  width={256}
                  height={256}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or pay manually</span>
              </div>
            </div>

            {/* UPI ID */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">UPI ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={UPI_ID}
                  readOnly
                  className="flex-1 rounded-lg border bg-muted px-4 py-3 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(UPI_ID)}
                  className="shrink-0"
                >
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </Button>
              </div>
            </div>

            {/* Transaction ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                UPI Transaction ID / UTR Number
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-3"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Find this in your UPI app after payment (e.g., 123456789012)
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border bg-blue-50 p-6 dark:bg-blue-950">
            <h3 className="mb-3 font-semibold">Payment Instructions:</h3>
            <ol className="space-y-2 text-sm">
              <li>1. Pay ₹{AMOUNT} to the UPI ID above or scan the QR code</li>
              <li>2. Copy the Transaction ID from your payment app</li>
              <li>3. Paste it above and click Submit</li>
              <li>4. You'll be upgraded to Premium once we verify the payment</li>
            </ol>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !transactionId.trim()}
            size="lg"
            className="w-full rounded-xl"
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </Button>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
