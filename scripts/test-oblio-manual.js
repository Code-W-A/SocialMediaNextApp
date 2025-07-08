/**
 * Script pentru testarea manuală a generării facturilor Oblio
 * Rulează cu: node scripts/test-oblio-manual.js
 */

// Configurare
const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';
const TEST_USER_ID = 'EN3fAkBQpGTA2tphpVUKpEt0dWI2'; // Înlocuiește cu ID-ul tău din Firebase

async function testOblioGeneration() {
  console.log('🧪 ===== TEST MANUAL OBLIO INVOICE GENERATION =====');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('👤 Test User ID:', TEST_USER_ID);
  
  // Test 1: Client individual cu EUR
  console.log('\n📋 Test 1: Client Individual - EUR');
  try {
    const response1 = await fetch(`${BASE_URL}/api/test/oblio-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        amount: 1999, // €19.99
        currency: 'eur',
        testType: 'individual'
      })
    });

    const result1 = await response1.json();
    
    if (result1.success) {
      console.log('✅ SUCCESS - Individual invoice generated!');
      console.log('📄 Invoice Number:', result1.invoice.number);
      console.log('🔗 Invoice URL:', result1.invoice.url);
      console.log('👤 Customer:', result1.invoice.customer);
      console.log('💰 Amount:', result1.invoice.amount / 100, result1.invoice.currency.toUpperCase());
    } else {
      console.log('❌ FAILED:', result1.error);
      console.log('📊 Details:', result1.details);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Client corporativ cu RON
  console.log('\n📋 Test 2: Client Corporate - RON');
  try {
    const response2 = await fetch(`${BASE_URL}/api/test/oblio-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        amount: 4999, // 49.99 RON
        currency: 'ron',
        testType: 'corporate'
      })
    });

    const result2 = await response2.json();
    
    if (result2.success) {
      console.log('✅ SUCCESS - Corporate invoice generated!');
      console.log('📄 Invoice Number:', result2.invoice.number);
      console.log('🔗 Invoice URL:', result2.invoice.url);
      console.log('🏢 Billing Type:', result2.invoice.billingType);
      console.log('💰 Amount:', result2.invoice.amount / 100, result2.invoice.currency.toUpperCase());
    } else {
      console.log('❌ FAILED:', result2.error);
      console.log('📊 Details:', result2.details);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n🎯 ===== TEST COMPLETED =====');
  console.log('💡 Verifică în Oblio dashboard dacă facturile au fost create');
  console.log('📧 Verifică email-ul pentru facturile trimise automat');
}

// Helper function pentru testare cu user ID custom
async function testWithCustomUser(userId, amount = 1999, currency = 'eur', testType = 'individual') {
  console.log(`\n🧪 Testing with custom user: ${userId}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/test/oblio-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        currency,
        testType
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SUCCESS!');
      console.log('📄 Invoice:', result.invoice.number);
      console.log('🔗 URL:', result.invoice.url);
      return result;
    } else {
      console.log('❌ FAILED:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Verifică și afișează informații despre endpoint
async function showEndpointInfo() {
  console.log('📋 ===== ENDPOINT INFO =====');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test/oblio-invoice`);
    const info = await response.json();
    
    console.log('📖 Usage:');
    console.log(JSON.stringify(info.usage, null, 2));
    console.log('\n🔧 Examples:');
    console.log(JSON.stringify(info.examples, null, 2));
  } catch (error) {
    console.error('❌ Could not fetch endpoint info:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--info')) {
    await showEndpointInfo();
    return;
  }
  
  if (args.includes('--custom')) {
    const userId = args[args.indexOf('--custom') + 1];
    if (!userId) {
      console.error('❌ Please provide userId after --custom');
      return;
    }
    await testWithCustomUser(userId);
    return;
  }
  
  // Run default tests
  await testOblioGeneration();
}

// Export pentru utilizare în alte scripturi
module.exports = {
  testOblioGeneration,
  testWithCustomUser,
  showEndpointInfo
};

// Rulează dacă este executat direct
if (require.main === module) {
  main().catch(console.error);
} 