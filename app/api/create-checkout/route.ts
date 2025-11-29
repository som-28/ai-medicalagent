import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planName } = await req.json();

    if (!priceId || !planName) {
      return NextResponse.json({ error: 'Missing priceId or planName' }, { status: 400 });
    }

    // For demo purposes, we'll simulate a successful checkout
    // In production, integrate with Stripe:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${req.headers.get('origin')}/pricing?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        planName,
      },
    });

    return NextResponse.json({ url: session.url });
    */

    // Demo mode - return success
    return NextResponse.json({ 
      url: `${req.headers.get('origin')}/dashboard?payment=success&plan=${planName}`,
      demo: true,
      message: 'Demo mode - In production, this would redirect to Stripe checkout'
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
