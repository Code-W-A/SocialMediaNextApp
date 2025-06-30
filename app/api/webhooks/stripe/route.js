import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleSubscriptionChange } from '@/actions/subscription';
import { validateSubscriptionWebhookData } from '@/utils/premiumHelpers';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  console.log('\n🔔 ===== STRIPE WEBHOOK RECEIVED =====');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔐 Signature present:', !!signature);
  console.log('📝 Body length:', body.length);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('🔑 Webhook secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
    console.error('🔐 Signature:', signature?.substring(0, 50) + '...');
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log('\n🎯 Event Details:');
  console.log('📋 Event Type:', event.type);
  console.log('🆔 Event ID:', event.id);
  console.log('📦 Event Data Keys:', Object.keys(event.data.object));

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Validate subscription data before processing
        if (!validateSubscriptionWebhookData(event.data.object)) {
          console.error('Invalid subscription webhook data received');
          return NextResponse.json(
            { error: 'Invalid subscription data' },
            { status: 400 }
          );
        }
        await handleSubscriptionChange(event.data.object);
        break;

      case 'checkout.session.completed':
        // Handle successful checkout - FIRST payment confirmation
        const session = event.data.object;
        console.log('\n🎉 ===== CHECKOUT SESSION COMPLETED =====');
        console.log('🛒 Session ID:', session.id);
        console.log('👤 Customer ID:', session.customer);
        console.log('💰 Amount Total:', session.amount_total);
        console.log('💵 Currency:', session.currency);
        console.log('📋 Payment Status:', session.payment_status);
        console.log('🔗 Subscription ID:', session.subscription);
        console.log('📊 Metadata:', session.metadata);
        
        try {
          // Get user ID from metadata
          const userId = session.metadata?.userId;
          console.log('🔍 Extracted User ID:', userId);
          
          if (userId) {
            console.log('📝 Writing to Firestore...');
            const firestoreData = {
              'subscription.checkoutCompleted': true,
              'subscription.checkoutCompletedAt': new Date(),
              'subscription.stripeCustomerId': session.customer,
              'subscription.lastPaymentStatus': 'completed',
              'subscription.updatedAt': new Date()
            };
            console.log('📦 Firestore Data:', firestoreData);
            
            // Update user's payment status immediately
            await updateDoc(doc(db, 'Users', userId), firestoreData);
            
            console.log('✅ Successfully updated checkout status for user:', userId);
            
            // Verify the update by reading back
            const userDoc = await getDoc(doc(db, 'Users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('🔄 Verification - User subscription data:', userData.subscription);
            } else {
              console.error('❌ User document not found after update!');
            }
          } else {
            console.error('❌ No userId found in session metadata!');
          }
          
          // Retrieve and update subscription if exists
          if (session.subscription) {
            console.log('🔄 Processing subscription:', session.subscription);
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            console.log('📋 Subscription details:', {
              id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000),
              metadata: subscription.metadata
            });
            await handleSubscriptionChange(subscription);
            console.log('✅ Subscription change handled');
          } else {
            console.log('ℹ️ No subscription attached to this session');
          }
        } catch (error) {
          console.error('❌ Error processing checkout completion:', error);
          console.error('📊 Error stack:', error.stack);
        }
        break;

      case 'invoice.payment_succeeded':
        // Handle successful payment - FINAL payment confirmation
        const invoice = event.data.object;
        console.log('\n💰 ===== PAYMENT SUCCEEDED =====');
        console.log('🧾 Invoice ID:', invoice.id);
        console.log('💵 Amount Paid:', invoice.amount_paid);
        console.log('💴 Currency:', invoice.currency);
        console.log('🔗 Subscription ID:', invoice.subscription);
        console.log('👤 Customer ID:', invoice.customer);
        console.log('📅 Period Start:', new Date(invoice.period_start * 1000));
        console.log('📅 Period End:', new Date(invoice.period_end * 1000));
        console.log('💳 Payment Status:', invoice.status);
        
        try {
          // If this is a subscription invoice, update the subscription
          if (invoice.subscription) {
            console.log('🔄 Retrieving subscription details...');
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const userId = subscription.metadata?.userId;
            
            console.log('🔍 Extracted User ID from subscription:', userId);
            console.log('📋 Subscription Status:', subscription.status);
            
            if (userId) {
              console.log('📝 Updating payment success in Firestore...');
              const firestoreData = {
                'subscription.lastPaymentStatus': 'succeeded',
                'subscription.lastPaymentDate': new Date(),
                'subscription.lastInvoiceId': invoice.id,
                'subscription.updatedAt': new Date()
              };
              console.log('📦 Payment Success Data:', firestoreData);
              
              // Update payment success status
              await updateDoc(doc(db, 'Users', userId), firestoreData);
              
              console.log('✅ Payment confirmed and saved for user:', userId);
              
              // Verify the update
              const userDoc = await getDoc(doc(db, 'Users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('🔄 Verification - Updated subscription data:', userData.subscription);
              }
            } else {
              console.error('❌ No userId found in subscription metadata!');
            }
            
            console.log('🔄 Processing subscription change...');
            await handleSubscriptionChange(subscription);
            console.log('✅ Subscription change processed successfully');
          } else {
            console.log('ℹ️ Invoice not associated with a subscription');
          }
        } catch (error) {
          console.error('❌ Error processing payment success:', error);
          console.error('📊 Error stack:', error.stack);
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
        console.log(`⚠️ Unhandled event type: ${event.type}`);
        console.log('📦 Event data keys:', Object.keys(event.data.object));
    }

    console.log('\n✅ ===== WEBHOOK PROCESSED SUCCESSFULLY =====');
    console.log('🎯 Event:', event.type);
    console.log('⏰ Processing time:', Date.now() - new Date(event.created * 1000).getTime(), 'ms');
    console.log('=====================================\n');

    return NextResponse.json({ 
      received: true, 
      eventType: event.type,
      eventId: event.id,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('\n❌ ===== WEBHOOK PROCESSING FAILED =====');
    console.error('🔥 Error:', error.message);
    console.error('📊 Stack:', error.stack);
    console.error('🎯 Event Type:', event?.type);
    console.error('🆔 Event ID:', event?.id);
    console.error('========================================\n');
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        eventType: event?.type,
        eventId: event?.id,
        errorMessage: error.message
      },
      { status: 500 }
    );
  }
} 