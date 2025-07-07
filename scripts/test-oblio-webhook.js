console.log('🧪 ===== OBLIO WEBHOOK DEBUG TEST =====\n');

// 1. Environment Variables Check (in NODE environment)
console.log('🔧 Current Environment Variables Status:');
console.log('---------------------------------------');

const requiredVars = [
  'OBLIO_ENABLED',
  'OBLIO_EMAIL', 
  'OBLIO_SECRET',
  'OBLIO_CIF',
  'OBLIO_SERIES'
];

let allVarsOK = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('EMAIL')) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allVarsOK = false;
  }
});

console.log('\n🎯 Oblio Configuration Analysis:');
console.log('-------------------------------');
console.log('Enabled:', process.env.OBLIO_ENABLED === 'true' ? '✅ YES' : '❌ NO');
console.log('Email:', process.env.OBLIO_EMAIL ? '✅ Set' : '❌ Missing');
console.log('Secret:', process.env.OBLIO_SECRET ? '✅ Set' : '❌ Missing');
console.log('CIF:', process.env.OBLIO_CIF ? '✅ Set' : '❌ Missing');
console.log('Series:', process.env.OBLIO_SERIES || '❌ Missing (will use default "YD")');

// 2. Instructions for .env.local
console.log('\n📝 Required .env.local Variables:');
console.log('--------------------------------');
console.log('Make sure your .env.local contains:');
console.log('');
console.log('OBLIO_EMAIL="webdynamicx@gmail.com"');
console.log('OBLIO_SECRET="38365aa6883b1063a7620c3de1e983ca67d9b78c"');
console.log('OBLIO_CIF="47916072"');
console.log('OBLIO_ENABLED=true     ← ADD THIS');
console.log('OBLIO_SERIES=YD        ← ADD THIS');

// 3. Vercel Environment Variables
console.log('\n🌐 Vercel Environment Variables Check:');
console.log('-------------------------------------');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project: ydestiny');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Make sure these are set:');
console.log('   OBLIO_ENABLED = true');
console.log('   OBLIO_EMAIL = webdynamicx@gmail.com');
console.log('   OBLIO_SECRET = 38365aa6883b1063a7620c3de1e983ca67d9b78c');
console.log('   OBLIO_CIF = 47916072');
console.log('   OBLIO_SERIES = YD');

// 4. Deployment and Testing
console.log('\n🚀 Deployment & Testing Steps:');
console.log('------------------------------');
console.log('1. ✅ Add missing variables to .env.local');
console.log('2. ✅ Add same variables to Vercel Dashboard');
console.log('3. 🚀 Deploy: vercel --prod');
console.log('4. 🧪 Make a test payment subscription');
console.log('5. 📊 Check logs immediately after payment');

// 5. How to check Vercel logs
console.log('\n📊 How to Check Vercel Logs:');
console.log('----------------------------');
console.log('Method 1 - Dashboard:');
console.log('   1. Go to https://vercel.com/dashboard');
console.log('   2. Click on your project');
console.log('   3. Go to "Functions" tab');
console.log('   4. Click on recent webhook calls');
console.log('   5. Look for "GENERATING OBLIO INVOICE" logs');
console.log('');
console.log('Method 2 - CLI:');
console.log('   vercel logs --follow');
console.log('');
console.log('Method 3 - Real-time monitoring:');
console.log('   vercel logs --follow | grep -i oblio');

// 6. What to look for in logs
console.log('\n🔍 What to Look for in Logs:');
console.log('----------------------------');
console.log('✅ SUCCESS indicators:');
console.log('   "GENERATING OBLIO INVOICE (PAYMENT CONFIRMED)"');
console.log('   "OBLIO_ENABLED: true"');
console.log('   "Invoice validation passed"');
console.log('   "Oblio invoice created successfully"');
console.log('');
console.log('❌ FAILURE indicators:');
console.log('   "OBLIO_ENABLED: NOT_SET" or "false"');
console.log('   "OBLIO INVOICE CREATION FAILED"');
console.log('   "Oblio is disabled, skipping invoice generation"');
console.log('   "SKIPPING Oblio invoice generation"');

// 7. Stripe webhook verification
console.log('\n🔗 Stripe Webhook Verification:');
console.log('-------------------------------');
console.log('Make sure webhook is configured in Stripe:');
console.log('URL: https://ydestiny.com/api/webhooks/stripe');
console.log('Events: invoice.payment_succeeded (required for Oblio)');
console.log('Dashboard: https://dashboard.stripe.com/webhooks');

console.log('\n' + '='.repeat(60));
console.log('🎯 NEXT ACTIONS:');
console.log('1. Update .env.local with missing OBLIO_ENABLED=true');
console.log('2. Update Vercel environment variables');
console.log('3. Deploy with: vercel --prod');
console.log('4. Test payment and monitor logs');
console.log('='.repeat(60)); 