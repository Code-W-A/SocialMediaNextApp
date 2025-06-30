// Test script pentru verificarea configurației Stripe complete
console.log('🔍 Verificare configurație completă Stripe & Firebase...\n');

// Verifică variabilele Firebase
console.log('🔥 Firebase Configuration:');
const firebaseVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

firebaseVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${envVar}: LIPSEȘTE!`);
  }
});

// Verifică variabilele Stripe
console.log('\n💳 Stripe Configuration:');
const stripeVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PREMIUM_PRICE_ID',
  'PRICE_ID'
];

let stripeOK = true;

stripeVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    if (envVar === 'STRIPE_SECRET_KEY') {
      console.log(`✅ ${envVar}: sk_live_***`);
    } else if (envVar === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') {
      console.log(`✅ ${envVar}: pk_live_***`);
    } else if (envVar === 'STRIPE_WEBHOOK_SECRET') {
      // Verifică dacă webhook secret-ul are formatul corect
      if (value.startsWith('whsec_')) {
        console.log(`✅ ${envVar}: whsec_*** (FORMAT CORECT)`);
      } else if (value.startsWith('we_')) {
        console.log(`⚠️  ${envVar}: we_*** (FORMAT SUSPECT - ar trebui să înceapă cu 'whsec_')`);
        stripeOK = false;
      } else {
        console.log(`❌ ${envVar}: ${value.substring(0, 10)}... (FORMAT INVALID)`);
        stripeOK = false;
      }
    } else {
      console.log(`✅ ${envVar}: ${value}`);
    }
  } else {
    console.log(`❌ ${envVar}: LIPSEȘTE!`);
    stripeOK = false;
  }
});

// Verifică variabila de APP URL
console.log('\n🌐 App Configuration:');
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (appUrl) {
  console.log(`✅ NEXT_PUBLIC_APP_URL: ${appUrl}`);
} else {
  console.log(`❌ NEXT_PUBLIC_APP_URL: LIPSEȘTE!`);
  stripeOK = false;
}

// Afișează URL-uri Stripe
if (appUrl) {
  console.log(`\n🔗 URL-uri Stripe configurate:`);
  console.log(`   Success: ${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`);
  console.log(`   Cancel: ${appUrl}/premium`);
  console.log(`   Webhook: ${appUrl}/api/webhooks/stripe`);
}

// Verifică chei Live vs Test
console.log('\n⚠️  IMPORTANT:');
const secretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (secretKey && publishableKey) {
  if (secretKey.includes('_live_') && publishableKey.includes('_live_')) {
    console.log('🔴 FOLOSEȘTI CHEI LIVE STRIPE - PERFECT PENTRU PRODUCȚIE!');
    console.log('   - Toate plățile vor fi REALE');
    console.log('   - Asigură-te că webhook-ul este configurat corect în Stripe Dashboard');
  } else if (secretKey.includes('_test_') && publishableKey.includes('_test_')) {
    console.log('🟡 FOLOSEȘTI CHEI TEST STRIPE - PERFECT PENTRU DEVELOPMENT');
    console.log('   - Folosește carduri de test pentru testare');
  } else {
    console.log('🔴 ATENȚIE: Chei mixed (test/live) - VERIFICĂ CONFIGURAȚIA!');
    stripeOK = false;
  }
}

// Rezultat final
console.log('\n' + '='.repeat(50));
if (stripeOK) {
  console.log('🎉 CONFIGURAȚIA PARE CORECTĂ!');
  console.log('✅ Poți testa sistemul de plăți acum.');
  
  if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET.startsWith('we_')) {
    console.log('\n⚠️  ATENȚIE WEBHOOK: Secretul începe cu "we_" în loc de "whsec_"');
    console.log('   Verifică în Stripe Dashboard dacă este corect.');
  }
} else {
  console.log('❌ PROBLEME IDENTIFICATE - Verifică variabilele de mai sus');
}

module.exports = {}; 