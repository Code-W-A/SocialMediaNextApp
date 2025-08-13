import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_CONFIG } from '@/lib/stripe';
import { currentUser } from '@/lib/firebaseAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  console.log('\n🛒 ===== API: CREATE CHECKOUT SESSION =====');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  let user = null;
  let customerEmail = null;
  
  try {
    user = await currentUser();
    
    if (!user) {
      console.log('❌ Unauthorized request - no user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('👤 User authenticated:', {
      userId: user.id,
      email: user.email
    });

    const body = await request.json();
    customerEmail = body.customerEmail;
    
    console.log('📦 Request body:', {
      customerEmail: customerEmail,
      userEmail: user.email,
      finalEmail: customerEmail || user.email
    });

    // Determine trial eligibility (ULTRA SAFE: only if user has no prior subscription/trial)
    let trialDaysToOffer = 0; // default no trial
    try {
      const userRef = doc(db, 'Users', user.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() || {};
        const sub = data.subscription || {};

        const hasAnySubscriptionRecord = Boolean(
          sub.subscriptionId || sub.status || sub.customerId || data.subscriptionActive !== undefined
        );
        const hadTrialBefore = Boolean(sub.trialEnd);
        const status = (sub.status || '').toLowerCase();
        const validActiveStatuses = ['active', 'trialing', 'past_due'];
        const hasActivePremium = validActiveStatuses.includes(status);

        const eligibleForTrial = !hasAnySubscriptionRecord && !hadTrialBefore && !hasActivePremium;

        if (eligibleForTrial) {
          trialDaysToOffer = 7; // set to 3-7 as desired; currently 7 days
        }
      } else {
        // No user doc yet → first-time checkout, allow trial
        trialDaysToOffer = 7;
      }
    } catch (e) {
      console.warn('⚠️ Could not determine trial eligibility, defaulting to no trial. Error:', e?.message || e);
    }

    // Create checkout session
    console.log('🌐 Creating Stripe checkout session...');
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
      
      // Collect complete billing address for Romanian e-factura compliance
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      
      subscription_data: {
        metadata: {
          userId: user.id,
          userEmail: user.email,
        },
        ...(trialDaysToOffer > 0
          ? { trial_period_days: trialDaysToOffer }
          : {}),
      },
    });

    console.log('✅ Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
      customerId: session.customer,
      mode: session.mode,
      paymentStatus: session.payment_status
    });
    
    console.log('🛒 ===== API: CHECKOUT SESSION SUCCESS =====\n');
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', {
      errorMessage: error.message,
      errorType: error.type,
      errorCode: error.code,
      requestId: error.requestId,
      userId: user?.id || 'N/A',
      customerEmail: customerEmail || user?.email || 'N/A'
    });
    console.log('🛒 ===== API: CHECKOUT SESSION FAILED =====\n');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 