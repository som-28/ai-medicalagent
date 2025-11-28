'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        toast.success('Test SMS sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      toast.error('Network error');
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Test Twilio SMS</h1>
      
      <div className="space-y-4 rounded-lg border p-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone Number (Indian format)
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter without +91 (it will be added automatically)
          </p>
        </div>

        <Button 
          onClick={handleTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Test SMS'}
        </Button>
      </div>

      {result && (
        <div className="mt-6 rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Result:</h2>
          <pre className="overflow-auto rounded bg-muted p-4 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 rounded-lg bg-yellow-50 p-6 dark:bg-yellow-950">
        <h3 className="mb-2 font-semibold">Common Issues:</h3>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>Twilio trial accounts can only send to verified phone numbers</li>
          <li>Verify your phone number in Twilio Console first</li>
          <li>Check that your Twilio number supports SMS in your region</li>
          <li>Some countries require phone number verification</li>
        </ul>
      </div>
    </div>
  );
}
