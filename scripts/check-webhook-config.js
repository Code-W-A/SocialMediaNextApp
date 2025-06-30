#!/usr/bin/env node

// Quick script to check current webhook configuration
// Run with: node scripts/check-webhook-config.js

const path = require('path');

console.log('🔍 YDestiny Stripe Webhook Configuration Check\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('✓ NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Not set');
console.log('✓ STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Not set');
console.log('✓ STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not set');

// Construct webhook URL
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ydestiny.com';
const webhookUrl = `${baseUrl}/api/webhooks/stripe`;

console.log('\n🔗 Webhook Configuration:');
console.log('📍 Webhook URL:', webhookUrl);
console.log('📁 Webhook File:', 'app/api/webhooks/stripe/route.js');

console.log('\n📋 Required Events in Stripe Dashboard:');
const requiredEvents = [
  '✅ checkout.session.completed',
  '✅ customer.subscription.created',
  '✅ customer.subscription.updated', 
  '✅ customer.subscription.deleted',
  '✅ invoice.payment_succeeded',
  '✅ invoice.payment_failed',
  '🟡 customer.subscription.trial_will_end',
  '🟡 invoice.upcoming'
];

requiredEvents.forEach(event => {
  console.log('  ', event);
});

console.log('\n🎯 Configuration Summary:');
console.log('📊 Total Webhook Endpoints: 1');
console.log('📨 Critical Events: 6');
console.log('📨 Optional Events: 2');

console.log('\n🔧 Next Steps:');
console.log('1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks');
console.log('2. Add/Edit webhook with URL:', webhookUrl);
console.log('3. Select the 8 events listed above');
console.log('4. Copy the signing secret to STRIPE_WEBHOOK_SECRET');

console.log('\n✅ Configuration check completed!');

// Check if webhook file exists
const fs = require('fs');
const webhookPath = path.join(process.cwd(), 'app/api/webhooks/stripe/route.js');

if (fs.existsSync(webhookPath)) {
  console.log('📁 Webhook file exists: ✅');
} else {
  console.log('📁 Webhook file exists: ❌');
}

console.log('\n' + '='.repeat(50)); 