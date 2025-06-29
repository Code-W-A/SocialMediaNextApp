import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_CONFIG } from '@/lib/stripe';
import { currentUser } from '@/lib/firebaseAuth';

export async function POST(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerEmail } = body;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: customerEmail || user.email,
      metadata: {
        userId: user.id,
        userEmail: user.email,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          userId: user.id,
          userEmail: user.email,
        },
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 