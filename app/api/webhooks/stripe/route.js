import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleSubscriptionChange } from '@/actions/subscription';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log('Received Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'checkout.session.completed':
        // Handle successful checkout - FIRST payment confirmation
        const session = event.data.object;
        console.log('🎉 Checkout session completed:', session.id);
        
        try {
          // Get user ID from metadata
          const userId = session.metadata?.userId;
          if (userId) {
            // Update user's payment status immediately
            await updateDoc(doc(db, 'Users', userId), {
              'subscription.checkoutCompleted': true,
              'subscription.checkoutCompletedAt': new Date(),
              'subscription.stripeCustomerId': session.customer,
              'subscription.lastPaymentStatus': 'completed',
              'subscription.updatedAt': new Date()
            });
            
            console.log(`✅ Updated checkout status for user: ${userId}`);
          }
          
          // Retrieve and update subscription if exists
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            await handleSubscriptionChange(subscription);
          }
        } catch (error) {
          console.error('Error processing checkout completion:', error);
        }
        break;

      case 'invoice.payment_succeeded':
        // Handle successful payment - FINAL payment confirmation
        const invoice = event.data.object;
        console.log('💰 Payment succeeded for invoice:', invoice.id);
        
        try {
          // If this is a subscription invoice, update the subscription
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const userId = subscription.metadata?.userId;
            
            if (userId) {
              // Update payment success status
              await updateDoc(doc(db, 'Users', userId), {
                'subscription.lastPaymentStatus': 'succeeded',
                'subscription.lastPaymentDate': new Date(),
                'subscription.lastInvoiceId': invoice.id,
                'subscription.updatedAt': new Date()
              });
              
              console.log(`✅ Payment confirmed for user: ${userId}`);
            }
            
            await handleSubscriptionChange(subscription);
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
        }
        break;

      case 'invoice.payment_failed':
        // Handle failed payment
        const failedInvoice = event.data.object;
        console.log('❌ Payment failed for invoice:', failedInvoice.id);
        
        try {
          if (failedInvoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
            const userId = subscription.metadata?.userId;
            
            if (userId) {
              // Update payment failure status
              await updateDoc(doc(db, 'Users', userId), {
                'subscription.lastPaymentStatus': 'failed',
                'subscription.lastPaymentFailureDate': new Date(),
                'subscription.lastFailedInvoiceId': failedInvoice.id,
                'subscription.paymentFailureReason': failedInvoice.last_payment_error?.message || 'Unknown error',
                'subscription.updatedAt': new Date()
              });
              
              console.log(`❌ Payment failure recorded for user: ${userId}`);
              
              // TODO: Send email notification about payment failure
              // TODO: Implement retry logic or grace period
            }
          }
        } catch (error) {
          console.error('Error processing payment failure:', error);
        }
        break;

      case 'customer.subscription.trial_will_end':
        // Handle trial ending soon (if you add trials later)
        const trialSub = event.data.object;
        console.log('⏰ Trial ending soon for subscription:', trialSub.id);
        
        try {
          const userId = trialSub.metadata?.userId;
          if (userId) {
            await updateDoc(doc(db, 'Users', userId), {
              'subscription.trialEndingNotified': true,
              'subscription.trialEndsAt': new Date(trialSub.trial_end * 1000),
              'subscription.updatedAt': new Date()
            });
            
            // TODO: Send trial ending notification
            console.log(`⏰ Trial ending notification for user: ${userId}`);
          }
        } catch (error) {
          console.error('Error processing trial ending:', error);
        }
        break;

      case 'invoice.upcoming':
        // Handle upcoming invoice (renewal reminder)
        const upcomingInvoice = event.data.object;
        console.log('📅 Upcoming invoice for subscription:', upcomingInvoice.subscription);
        
        try {
          if (upcomingInvoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(upcomingInvoice.subscription);
            const userId = subscription.metadata?.userId;
            
            if (userId) {
              await updateDoc(doc(db, 'Users', userId), {
                'subscription.upcomingInvoiceAmount': upcomingInvoice.amount_due,
                'subscription.upcomingInvoiceDate': new Date(upcomingInvoice.period_end * 1000),
                'subscription.renewalReminderSent': true,
                'subscription.updatedAt': new Date()
              });
              
              // TODO: Send renewal reminder email
              console.log(`📅 Renewal reminder for user: ${userId}`);
            }
          }
        } catch (error) {
          console.error('Error processing upcoming invoice:', error);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 