import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { handleSubscriptionChange } from '@/actions/subscription';
import { validateSubscriptionWebhookData } from '@/utils/premiumHelpers';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Oblio invoice generation is handled by dedicated API at /api/oblio/generate-invoice

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
        // Initial subscription setup - DON'T generate invoice here to avoid duplicates
        const session = event.data.object;
        console.log('\n🛒 ===== CHECKOUT SESSION COMPLETED =====');
        console.log('🛒 Session ID:', session.id);
        console.log('💵 Amount Total:', session.amount_total);
        console.log('💴 Currency:', session.currency);
        console.log('💳 Payment Status:', session.payment_status);
        console.log('🔗 Subscription ID:', session.subscription);
        console.log('👤 Customer ID:', session.customer);
        console.log('📧 Customer Email:', session.customer_details?.email);
        console.log('📅 Created:', new Date(session.created * 1000));

        try {
          if (session.subscription) {
            console.log('💡 Subscription-based checkout detected');
            
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            console.log('📋 Subscription Details:', {
              id: subscription.id,
              status: subscription.status,
              userId: subscription.metadata?.userId,
              priceId: subscription.items?.data?.[0]?.price?.id,
              amount: subscription.items?.data?.[0]?.price?.unit_amount,
              currency: subscription.currency
            });

            // Process subscription change (for user status updates)
            console.log('🔄 Processing subscription change...');
            await handleSubscriptionChange(subscription);
            console.log('✅ Subscription change processed successfully');
                  
            console.log('ℹ️ Oblio invoice will be generated when payment is confirmed (invoice.payment_succeeded)');
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

              // 🧾 OBLIO INVOICE GENERATION - VIA DEDICATED API
              console.log('\n🏭 ===== CALLING OBLIO INVOICE API =====');
              console.log('📅 Timestamp:', new Date().toISOString());
              
              try {
                if (invoice.status === 'paid' && invoice.amount_paid > 0) {
                  console.log('✅ Payment confirmed - calling Oblio API');
                  
                  // Get user data for invoice
                  const userData = userDoc.data();
                  
                  // Get Stripe customer details WITH billing address
                  const stripeCustomer = await stripe.customers.retrieve(invoice.customer);
                  
                  // Get billing address from customer or payment method
                  let billingAddress = stripeCustomer.address;
                  
                  if (!billingAddress) {
                    try {
                      const paymentMethods = await stripe.paymentMethods.list({
                        customer: invoice.customer,
                        type: 'card',
                        limit: 1
                      });
                      if (paymentMethods.data.length > 0) {
                        billingAddress = paymentMethods.data[0].billing_details?.address;
                      }
                    } catch (pmError) {
                      console.log('ℹ️ Could not retrieve payment method billing address:', pmError.message);
                    }
                  }
                  
                  console.log('📍 Customer billing details:', {
                    name: stripeCustomer.name,
                    email: stripeCustomer.email,
                    phone: stripeCustomer.phone,
                    hasAddress: !!billingAddress
                  });
                  
                  // Prepare data for Oblio API call
                  const oblioApiPayload = {
                    source: 'stripe_webhook',
                    userId: userId,
                    stripeData: {
                      invoiceId: invoice.id,
                      customerId: invoice.customer,
                      subscriptionId: subscription.id,
                      amount: invoice.amount_paid,
                      currency: invoice.currency,
                      paymentStatus: invoice.status
                    },
                    customerData: {
                      name: stripeCustomer.name || `${userData.firstName} ${userData.lastName}`,
                      email: stripeCustomer.email || userData.email,
                      phone: stripeCustomer.phone || userData.phone,
                      address: billingAddress || {
                        line1: userData.address || '',
                        city: userData.city || '',
                        state: userData.state || '',
                        country: userData.country || 'Romania'
                      },
                      company: userData.company,
                      companyVat: userData.companyVat,
                      companyReg: userData.companyReg
                    },
                    metadata: {
                      priceId: subscription.items?.data?.[0]?.price?.id,
                      planName: 'Premium Monthly'
                    }
                  };
                  
                  console.log('📋 Calling Oblio API with payload:', {
                    source: oblioApiPayload.source,
                    userId: oblioApiPayload.userId,
                    amount: oblioApiPayload.stripeData.amount,
                    currency: oblioApiPayload.stripeData.currency,
                    customerEmail: oblioApiPayload.customerData.email
                  });
                  
                  // Call the dedicated Oblio API
                  const headers = new Headers({
                    'Content-Type': 'application/json'
                  });

                  // Get the base URL for internal API call
                  const baseUrl = process.env.VERCEL_URL 
                    ? `https://${process.env.VERCEL_URL}` 
                    : 'http://localhost:3000';

                  const oblioApiResponse = await fetch(`${baseUrl}/api/oblio/generate-invoice`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(oblioApiPayload)
                  });
                  
                  const oblioResult = await oblioApiResponse.json();
                  
                  console.log('📊 Oblio API response:', {
                    success: oblioResult.success,
                    status: oblioApiResponse.status,
                    hasInvoiceNumber: !!oblioResult.invoice?.number,
                    duplicate: oblioResult.duplicate || false
                  });
                  
                  if (oblioResult.success) {
                    console.log('✅ Oblio invoice generated via API!', {
                      invoiceNumber: oblioResult.invoice.number,
                      source: oblioResult.source,
                      duplicate: oblioResult.duplicate
                    });
                  } else {
                    console.error('❌ Oblio API call failed:', {
                      error: oblioResult.error,
                      details: oblioResult.details,
                      retryable: oblioResult.retryable
                    });
                    // Don't fail the webhook if Oblio fails - just log the error
                  }
                  
                } else {
                  console.log('⚠️ Skipping Oblio invoice - payment not completed or zero amount');
                }
              } catch (oblioError) {
                console.error('💥 Error calling Oblio API:', oblioError.message);
                console.error('📊 Full error:', oblioError);
                // Don't fail the webhook if Oblio fails - premium system should still work
              }
              console.log('📋 ===== OBLIO API CALL COMPLETED =====');
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