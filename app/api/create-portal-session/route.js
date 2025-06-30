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

    let portalSession;
    
    try {
      // Try to create customer portal session
      portalSession = await stripe.billingPortal.sessions.create({
        customer: userData.subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      });
    } catch (error) {
      // If no configuration exists, create a default one
      if (error.code === 'invalid_request_error' && error.message.includes('No configuration provided')) {
        console.log('🔧 Creating default portal configuration...');
        
        try {
          // Create a default portal configuration
          const configuration = await stripe.billingPortal.configurations.create({
            business_profile: {
              headline: 'Gestionează-ți abonamentul YDestiny',
              privacy_policy_url: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
              terms_of_service_url: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
            },
            features: {
              customer_update: {
                allowed_updates: ['email', 'address', 'name', 'phone'],
                enabled: true,
              },
              invoice_history: {
                enabled: true,
              },
              payment_method_update: {
                enabled: true,
              },
              subscription_cancel: {
                enabled: true,
                mode: 'at_period_end',
                proration_behavior: 'none',
              },
              subscription_pause: {
                enabled: false,
              },
              subscription_update: {
                enabled: true,
                default_allowed_updates: ['price'],
                proration_behavior: 'create_prorations',
              },
            },
            default_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
          });
          
          console.log('✅ Portal configuration created successfully:', configuration.id);
          
          // Now create the portal session with the new configuration
          portalSession = await stripe.billingPortal.sessions.create({
            customer: userData.subscription.customerId,
            configuration: configuration.id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
          });
          
        } catch (configError) {
          console.error('❌ Error creating portal configuration:', configError);
          throw configError;
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json({ 
      url: portalSession.url 
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 