/**
 * Script pentru verificarea configurației Stripe webhooks și evenimente
 * Rulează cu: node scripts/check-stripe-events.js
 */

// Verifică dacă avem Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('❌ STRIPE_SECRET_KEY nu e setat!');
  console.log('💡 Setează STRIPE_SECRET_KEY în .env.local pentru testare locală');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkWebhookConfiguration() {
  console.log('🔍 ===== VERIFICARE CONFIGURAȚIE STRIPE WEBHOOKS =====');
  
  try {
    // Lista toate webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    console.log(`📡 Găsite ${webhooks.data.length} webhook endpoints:`);
    
    if (webhooks.data.length === 0) {
      console.log('❌ NU SUNT WEBHOOK-URI CONFIGURATE!');
      console.log('💡 Mergi în Stripe Dashboard → Developers → Webhooks și adaugă endpoint-ul');
      return;
    }
    
    webhooks.data.forEach((webhook, index) => {
      console.log(`\n📍 Webhook ${index + 1}:`);
      console.log('   🔗 URL:', webhook.url);
      console.log('   📊 Status:', webhook.status);
      console.log('   🌍 Mode:', webhook.livemode ? 'LIVE' : 'TEST');
      console.log('   📅 Created:', new Date(webhook.created * 1000).toLocaleDateString());
      
      // Verifică evenimente cruciale pentru Oblio
      const crucialEvents = [
        'checkout.session.completed',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.subscription.created',
        'customer.subscription.updated'
      ];
      
      console.log('   🎯 Evenimente configurate:');
      crucialEvents.forEach(event => {
        const isConfigured = webhook.enabled_events.includes(event);
        const icon = isConfigured ? '✅' : '❌';
        console.log(`      ${icon} ${event}`);
      });
      
      // Verifică dacă avem invoice.payment_succeeded
      const hasInvoicePaymentSucceeded = webhook.enabled_events.includes('invoice.payment_succeeded');
      if (!hasInvoicePaymentSucceeded) {
        console.log('   🚨 PROBLEMĂ: invoice.payment_succeeded NU e configurat!');
        console.log('   💡 Asta explică de ce nu se generează facturile Oblio!');
      }
      
      console.log(`   📋 Total evenimente: ${webhook.enabled_events.length}`);
      
      // Verifică dacă webhook-ul e pentru aplicația ta
      const appUrl = process.env.VERCEL_URL || 'localhost';
      if (webhook.url.includes(appUrl) || webhook.url.includes('vercel.app')) {
        console.log('   ✅ Acest webhook pare să fie pentru aplicația ta');
      }
    });
    
  } catch (error) {
    console.error('❌ Eroare la verificarea webhook-urilor:', error.message);
  }
}

async function checkRecentEvents() {
  console.log('\n📊 ===== VERIFICARE EVENIMENTE RECENTE =====');
  
  try {
    // Verifică ultimele evenimente relevante
    const relevantEvents = [
      'checkout.session.completed',
      'invoice.payment_succeeded', 
      'invoice.payment_failed',
      'customer.subscription.created'
    ];
    
    for (const eventType of relevantEvents) {
      try {
        const events = await stripe.events.list({ 
          type: eventType,
          limit: 3
        });
        
        console.log(`\n🎯 ${eventType}:`);
        if (events.data.length === 0) {
          console.log('   📭 Nu sunt evenimente recente');
        } else {
          events.data.forEach((event, i) => {
            console.log(`   ${i + 1}. ${event.id} - ${new Date(event.created * 1000).toLocaleString()}`);
            
            if (eventType === 'invoice.payment_failed') {
              const invoice = event.data.object;
              console.log(`      💰 Amount: ${invoice.amount_due}${invoice.currency}`);
              console.log(`      ❌ Reason: ${invoice.last_payment_error?.message || 'Unknown'}`);
            }
            
            if (eventType === 'invoice.payment_succeeded') {
              const invoice = event.data.object;
              console.log(`      💰 Amount: ${invoice.amount_paid}${invoice.currency}`);
              console.log(`      ✅ Payment successful`);
            }
          });
        }
      } catch (err) {
        console.log(`   ❌ Eroare pentru ${eventType}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Eroare la verificarea evenimentelor:', error.message);
  }
}

async function checkLatestPayment() {
  console.log('\n💳 ===== VERIFICARE ULTIMA PLATĂ =====');
  
  try {
    // Verifică ultimele plăți
    const paymentIntents = await stripe.paymentIntents.list({ limit: 3 });
    
    if (paymentIntents.data.length === 0) {
      console.log('📭 Nu sunt plăți recente');
      return;
    }
    
    paymentIntents.data.forEach((payment, i) => {
      console.log(`\n💳 Plata ${i + 1}:`);
      console.log(`   🆔 ID: ${payment.id}`);
      console.log(`   💰 Amount: ${payment.amount}${payment.currency}`);
      console.log(`   📊 Status: ${payment.status}`);
      console.log(`   📅 Created: ${new Date(payment.created * 1000).toLocaleString()}`);
      
      if (payment.last_payment_error) {
        console.log(`   ❌ Error: ${payment.last_payment_error.message}`);
      }
      
      if (payment.invoice) {
        console.log(`   🧾 Invoice: ${payment.invoice}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Eroare la verificarea plăților:', error.message);
  }
}

async function suggestFix() {
  console.log('\n🔧 ===== SOLUȚII RECOMANDATE =====');
  
  console.log('1. 🎯 Verifică webhook events în Stripe Dashboard:');
  console.log('   - Mergi la Developers → Webhooks');
  console.log('   - Click pe endpoint-ul tău');
  console.log('   - Verifică că "invoice.payment_succeeded" e bifat');
  
  console.log('\n2. 🧪 Testează cu cardul de test Stripe:');
  console.log('   - Card: 4242424242424242');
  console.log('   - Data: 12/25, CVC: 123');
  
  console.log('\n3. 📊 Monitorizează în timp real:');
  console.log('   - Vercel logs în timp real');
  console.log('   - Stripe Dashboard → Events');
  
  console.log('\n4. 🔍 Verifică de ce plațile eșuează:');
  console.log('   - Stripe Dashboard → Payments');
  console.log('   - Caută ultima plată eșuată');
  console.log('   - Vezi motivul exact');
}

async function main() {
  await checkWebhookConfiguration();
  await checkRecentEvents();
  await checkLatestPayment();
  await suggestFix();
  
  console.log('\n✅ ===== VERIFICARE COMPLETĂ =====');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  checkWebhookConfiguration, 
  checkRecentEvents, 
  checkLatestPayment 
}; 