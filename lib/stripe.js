import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Product and Price IDs
export const STRIPE_CONFIG = {
  PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID || process.env.PRICE_ID || 'price_1R00DkClBW08h64jdSd6WWkE',
  PREMIUM_PRODUCT_ID: process.env.STRIPE_PREMIUM_PRODUCT_ID || 'prod_premium',
  CURRENCY: 'eur',
  PREMIUM_PRICE: 500, // 5.00 EUR in cents
};

// Subscription status types
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  UNPAID: 'unpaid',
};

// Check if subscription is active
export const isSubscriptionActive = (status) => {
  return [
    SUBSCRIPTION_STATUS.ACTIVE,
    SUBSCRIPTION_STATUS.TRIALING
  ].includes(status);
}; 