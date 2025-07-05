"use server";

import { stripe, STRIPE_CONFIG, isSubscriptionActive } from '@/lib/stripe';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { serializeFirebaseData } from '@/utils/firebaseHelpers';
import { toSerializableDate } from '@/utils/dateHelpers';

// Create checkout session for premium subscription
export const createCheckoutSession = async (userId, customerEmail) => {
  console.log('\n🛒 ===== CREATING STRIPE CHECKOUT SESSION =====');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('👤 User ID:', userId);
  console.log('📧 Customer Email:', customerEmail);
  console.log('🔧 Stripe Config:', {
    priceId: STRIPE_CONFIG.PREMIUM_PRICE_ID,
    currency: STRIPE_CONFIG.CURRENCY,
    premiumPrice: STRIPE_CONFIG.PREMIUM_PRICE
  });
  
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('🌐 Sending request to Stripe API...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/cancel`,
      customer_email: customerEmail,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      allow_promotion_codes: true,
      
      // Collect complete billing address for Romanian e-factura compliance
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log('✅ Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
      customerId: session.customer,
      mode: session.mode,
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription
    });
    
    console.log('🛒 ===== CHECKOUT SESSION CREATION COMPLETED =====\n');
    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('❌ Error creating checkout session:', {
      errorMessage: error.message,
      errorType: error.type,
      errorCode: error.code,
      requestId: error.requestId,
      userId: userId,
      customerEmail: customerEmail
    });
    console.log('🛒 ===== CHECKOUT SESSION CREATION FAILED =====\n');
    throw error;
  }
};

// Create customer portal session for managing subscription
export const createPortalSession = async (customerId) => {
  try {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Get user's subscription status
export const getUserSubscription = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const subscription = userData.subscription || {};

    // Serialize the subscription data to handle Firebase timestamps
    const serializedSubscription = serializeFirebaseData(subscription);

    return {
      isPremium: subscription.status && isSubscriptionActive(subscription.status),
      status: subscription.status || 'inactive',
      customerId: subscription.customerId || null,
      subscriptionId: subscription.subscriptionId || null,
      currentPeriodEnd: serializedSubscription.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
};

// Update user subscription in Firestore
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      subscription: {
        ...subscriptionData,
        updatedAt: serverTimestamp(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

// Handle subscription status change from webhook
export const handleSubscriptionChange = async (subscription) => {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    const isPremiumStatus = isSubscriptionActive(subscription.status);
    
    const subscriptionData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      isPremium: isPremiumStatus,
      currentPeriodStart: toSerializableDate(new Date(subscription.current_period_start * 1000)),
      currentPeriodEnd: toSerializableDate(new Date(subscription.current_period_end * 1000)),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId: subscription.items.data[0]?.price?.id,
    };

    await updateUserSubscription(userId, subscriptionData);
    
    console.log(`Updated subscription for user ${userId}:`, subscriptionData);
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: toSerializableDate(new Date(subscription.current_period_end * 1000)),
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Reactivate subscription
export const reactivateSubscription = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return {
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
}; 