/**
 * Debug script pentru Stripe Webhooks și Oblio
 * Rulează cu: node scripts/debug-stripe-oblio.js
 */

// Verifică variabilele de mediu
console.log('\n🔧 ===== ENVIRONMENT VARIABLES CHECK =====');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('⚡ Vercel Environment:', process.env.VERCEL_ENV || 'LOCAL');

console.log('\n📡 STRIPE CONFIGURATION:');
console.log('🔑 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ SET' : '❌ MISSING');
console.log('🔐 STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ SET' : '❌ MISSING');
console.log('🌐 STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? '✅ SET' : '❌ MISSING');

console.log('\n🏭 OBLIO CONFIGURATION (ALWAYS ENABLED):');
console.log('📧 OBLIO_EMAIL:', process.env.OBLIO_EMAIL ? `✅ ${process.env.OBLIO_EMAIL.substring(0, 10)}...` : '❌ NOT_SET');
console.log('🔐 OBLIO_SECRET:', process.env.OBLIO_SECRET ? `✅ ${process.env.OBLIO_SECRET.substring(0, 10)}...` : '❌ NOT_SET');
console.log('🏢 OBLIO_CIF:', process.env.OBLIO_CIF || '❌ NOT_SET');
console.log('📄 OBLIO_SERIES:', process.env.OBLIO_SERIES || '❌ NOT_SET');

console.log('\n🔥 FIREBASE CONFIGURATION:');
console.log('🔑 Firebase Config Present:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ YES' : '❌ NO');

// Verifică configurația completă Oblio (fără OBLIO_ENABLED)
const oblioComplete = process.env.OBLIO_EMAIL && 
                     process.env.OBLIO_SECRET && 
                     process.env.OBLIO_CIF && 
                     process.env.OBLIO_SERIES;

console.log('\n📊 OBLIO STATUS:');
console.log('🟢 Oblio is ALWAYS ENABLED (no toggle required)');
console.log('🎯 Oblio Configuration Complete:', oblioComplete ? '✅ YES' : '❌ NO');

if (!oblioComplete) {
  console.log('\n❌ MISSING OBLIO VARIABLES:');
  if (!process.env.OBLIO_EMAIL) console.log('   - OBLIO_EMAIL');
  if (!process.env.OBLIO_SECRET) console.log('   - OBLIO_SECRET');
  if (!process.env.OBLIO_CIF) console.log('   - OBLIO_CIF');
  if (!process.env.OBLIO_SERIES) console.log('   - OBLIO_SERIES');
}

// Testează conexiunea la Stripe
async function testStripeConnection() {
  console.log('\n🧪 ===== TESTING STRIPE CONNECTION =====');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ Cannot test Stripe - STRIPE_SECRET_KEY missing');
    return;
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Testează conexiunea
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful');
    console.log('🏢 Account ID:', account.id);
    console.log('📧 Account Email:', account.email);
    console.log('🌍 Country:', account.country);
    console.log('💳 Charges Enabled:', account.charges_enabled);
    console.log('💰 Payouts Enabled:', account.payouts_enabled);

    // Listează webhook endpoints
    console.log('\n📡 WEBHOOK ENDPOINTS:');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log('❌ NO WEBHOOK ENDPOINTS CONFIGURED!');
      console.log('   You need to add a webhook endpoint in Stripe Dashboard:');
      console.log('   URL: https://your-domain.vercel.app/api/webhooks/stripe');
      console.log('   Events: customer.subscription.*, checkout.session.completed, invoice.*');
    } else {
      webhooks.data.forEach((webhook, index) => {
        console.log(`\n📍 Webhook ${index + 1}:`);
        console.log('   URL:', webhook.url);
        console.log('   Status:', webhook.status);
        console.log('   Events:', webhook.enabled_events.slice(0, 5).join(', ') + 
                    (webhook.enabled_events.length > 5 ? '...' : ''));
        
        const hasRequiredEvents = [
          'customer.subscription.created',
          'customer.subscription.updated', 
          'invoice.payment_succeeded',
          'checkout.session.completed'
        ].every(event => webhook.enabled_events.includes(event));
        
        console.log('   Has Required Events:', hasRequiredEvents ? '✅ YES' : '❌ NO');
      });
    }

  } catch (error) {
    console.log('❌ Stripe connection failed:', error.message);
  }
}

// Testează ultimele webhooks
async function testRecentWebhooks() {
  console.log('\n📊 ===== RECENT WEBHOOK EVENTS =====');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ Cannot check webhooks - STRIPE_SECRET_KEY missing');
    return;
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Ultimele 10 evenimente
    const events = await stripe.events.list({ 
      limit: 10,
      types: [
        'checkout.session.completed',
        'invoice.payment_succeeded', 
        'customer.subscription.created',
        'customer.subscription.updated'
      ]
    });

    console.log(`📈 Found ${events.data.length} recent relevant events:`);
    
    events.data.forEach((event, index) => {
      console.log(`\n📋 Event ${index + 1}:`);
      console.log('   Type:', event.type);
      console.log('   Created:', new Date(event.created * 1000).toISOString());
      console.log('   ID:', event.id);
      
      if (event.type === 'checkout.session.completed') {
        console.log('   Amount:', event.data.object.amount_total);
        console.log('   Currency:', event.data.object.currency);
        console.log('   Customer:', event.data.object.customer);
      }
      
      if (event.type === 'invoice.payment_succeeded') {
        console.log('   Amount Paid:', event.data.object.amount_paid);
        console.log('   Currency:', event.data.object.currency);
        console.log('   Subscription:', event.data.object.subscription);
      }
    });

    if (events.data.length === 0) {
      console.log('⚠️  No recent payment events found.');
      console.log('   This could mean:');
      console.log('   1. No payments have been made recently');
      console.log('   2. Webhook events are not being generated');
      console.log('   3. Different event types are being used');
    }

  } catch (error) {
    console.log('❌ Failed to fetch webhook events:', error.message);
  }
}

// Rulează testele
async function runAllTests() {
  console.log('🚀 STRIPE & OBLIO DEBUG SCRIPT');
  console.log('===============================');
  
  await testStripeConnection();
  await testRecentWebhooks();
  
  console.log('\n✅ DEBUG SCRIPT COMPLETED');
  console.log('📝 Next steps if invoices are not generating:');
  console.log('   1. Ensure all Oblio environment variables are set in Vercel');
  console.log('   2. Check webhook endpoint is configured in Stripe Dashboard');
  console.log('   3. Make a test payment and check Vercel logs immediately');
  console.log('   4. Run: vercel logs --follow | grep -i oblio');
}

// Rulează dacă este executat direct
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 