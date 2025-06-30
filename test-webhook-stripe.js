const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testWebhookFlow() {
  console.log('🧪 ===== STRIPE WEBHOOK TEST FLOW =====\n');

  try {
    // 1. Creează un customer de test
    console.log('👤 Creating test customer...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test User',
      metadata: {
        userId: 'test-user-123'
      }
    });
    console.log('✅ Customer created:', customer.id);

    // 2. Creează un checkout session
    console.log('\n🛒 Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PREMIUM_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      customer: customer.id,
      metadata: {
        userId: 'test-user-123'
      }
    });
    console.log('✅ Checkout session created:', session.id);
    console.log('🔗 Payment URL:', session.url);

    console.log('\n📋 Test Instructions:');
    console.log('1. Deschide URL-ul de mai sus într-un browser');
    console.log('2. Folosește cardul de test: 4242 4242 4242 4242');
    console.log('3. Orice dată viitoare validă și orice CVC');
    console.log('4. Urmărește log-urile din webhook în consolă');

    // 3. Încearcă să triggerezi evenimente manual
    console.log('\n🎯 Manual Event Triggers:');
    console.log('Rulează aceste comenzi în alt terminal:');
    console.log(`stripe trigger checkout.session.completed --add checkout_session:metadata:userId=test-user-123`);
    console.log(`stripe trigger invoice.payment_succeeded --add invoice:customer=${customer.id}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Verifică configurația înainte de test
function checkConfig() {
  console.log('🔍 Checking configuration...\n');
  
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PREMIUM_PRICE_ID',
    'NEXT_PUBLIC_APP_URL',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ All required environment variables present');
  console.log('🎯 App URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('💳 Price ID:', process.env.STRIPE_PREMIUM_PRICE_ID);
  console.log('🔐 Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET.substring(0, 20) + '...');
  console.log('');
}

if (require.main === module) {
  checkConfig();
  testWebhookFlow();
}

module.exports = { testWebhookFlow, checkConfig }; 