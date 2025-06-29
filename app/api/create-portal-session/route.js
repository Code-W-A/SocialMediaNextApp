import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@/lib/firebaseAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID from Firestore
    const userDoc = await getDoc(doc(db, 'Users', user.id));
    const userData = userDoc.data();
    
    if (!userData?.subscription?.customerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.subscription.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
    });

    return NextResponse.json({ 
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 