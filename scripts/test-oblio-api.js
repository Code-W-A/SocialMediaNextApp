/**
 * Script pentru testarea API-ului dedicat Oblio
 * Rulează cu: node scripts/test-oblio-api.js
 */

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const TEST_USER_ID = 'EN3fAkBQpGTA2tphpVUKpEt0dWI2'; // Înlocuiește cu ID-ul tău

async function testOblioApi() {
  console.log('🧪 ===== TEST OBLIO DEDICATED API =====');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('👤 Test User ID:', TEST_USER_ID);
  
  // Test 1: Simulare webhook Stripe
  console.log('\n📋 Test 1: Stripe Webhook Simulation');
  try {
    const webhookPayload = {
      source: 'stripe_webhook',
      userId: TEST_USER_ID,
      stripeData: {
        invoiceId: `in_test_${Date.now()}`,
        customerId: 'cus_test123',
        subscriptionId: 'sub_test456',
        amount: 1999, // €19.99
        currency: 'eur',
        paymentStatus: 'paid'
      },
      customerData: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+40700000000',
        address: {
          line1: 'Strada Victoriei 123',
          city: 'București',
          state: 'București',
          country: 'Romania'
        }
      },
      metadata: {
        priceId: 'price_premium_monthly',
        planName: 'Premium Monthly'
      }
    };

    const response = await fetch(`${BASE_URL}/api/oblio/generate-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response:', {
      success: result.success,
      source: result.source,
      duplicate: result.duplicate,
      invoiceNumber: result.invoice?.number,
      error: result.error
    });

    if (result.success) {
      console.log('✅ SUCCESS - Webhook simulation generated invoice!');
      console.log('📄 Invoice:', result.invoice.number);
      console.log('🔗 URL:', result.invoice.url);
    } else {
      console.log('❌ FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Manual invoice generation
  console.log('\n📋 Test 2: Manual Invoice Generation');
  try {
    const manualPayload = {
      source: 'manual',
      userId: TEST_USER_ID,
      stripeData: {
        amount: 2999, // €29.99
        currency: 'eur',
        paymentStatus: 'paid'
      },
      customerData: {
        name: 'Manual Test Client',
        email: 'manual@example.com',
        phone: '+40701234567',
        address: {
          line1: 'Bulevardul Unirii 45',
          city: 'Cluj-Napoca',
          state: 'Cluj',
          country: 'Romania'
        }
      },
      metadata: {
        reference: 'MANUAL_TEST_' + Date.now()
      }
    };

    const response = await fetch(`${BASE_URL}/api/oblio/generate-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manualPayload)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SUCCESS - Manual invoice generated!');
      console.log('📄 Invoice:', result.invoice.number);
      console.log('💰 Amount:', result.invoice.amount / 100, result.invoice.currency.toUpperCase());
    } else {
      console.log('❌ FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  // Test 3: Corporate client
  console.log('\n📋 Test 3: Corporate Client');
  try {
    const corporatePayload = {
      source: 'admin',
      userId: TEST_USER_ID,
      stripeData: {
        amount: 4999, // 49.99 RON
        currency: 'ron',
        paymentStatus: 'paid'
      },
      customerData: {
        name: 'Corporate Client',
        email: 'corporate@example.com',
        phone: '+40722333444',
        address: {
          line1: 'Calea Victoriei 200',
          city: 'București',
          state: 'București',
          country: 'Romania'
        },
        company: 'Test Company SRL',
        companyVat: 'RO12345678',
        companyReg: 'J40/123/2023'
      },
      metadata: {
        reference: 'CORPORATE_TEST'
      }
    };

    const response = await fetch(`${BASE_URL}/api/oblio/generate-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(corporatePayload)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SUCCESS - Corporate invoice generated!');
      console.log('📄 Invoice:', result.invoice.number);
      console.log('🏢 Billing Type:', result.invoice.billingType);
    } else {
      console.log('❌ FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n🎯 ===== TEST COMPLETED =====');
}

async function showApiInfo() {
  console.log('📋 ===== API INFO =====');
  
  try {
    const response = await fetch(`${BASE_URL}/api/oblio/generate-invoice`);
    const info = await response.json();
    
    console.log('📖 API Name:', info.name);
    console.log('🔧 Version:', info.version);
    console.log('📊 Sources:', info.sources.join(', '));
    console.log('⚡ Features:', info.features.join(', '));
  } catch (error) {
    console.error('❌ Could not fetch API info:', error.message);
  }
}

// Helper function for custom tests
async function testWithCustomData(payload) {
  console.log('\n🧪 Custom test with payload:', {
    source: payload.source,
    userId: payload.userId,
    amount: payload.stripeData.amount,
    currency: payload.stripeData.currency
  });
  
  try {
    const response = await fetch(`${BASE_URL}/api/oblio/generate-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
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

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--info')) {
    await showApiInfo();
    return;
  }
  
  // Run all tests
  await testOblioApi();
  
  console.log('\n💡 Avantajele API-ului dedicat:');
  console.log('   ✅ Separarea responsabilităților');
  console.log('   ✅ Testare independentă de webhook Stripe');
  console.log('   ✅ Retry/Recovery pentru facturi eșuate');
  console.log('   ✅ Generare manuală din admin panel');
  console.log('   ✅ Debugging mai simplu');
  console.log('   ✅ Prevenirea duplicatelor');
  console.log('   ✅ Audit trail complet');
}

// Export pentru utilizare în alte scripturi
module.exports = {
  testOblioApi,
  testWithCustomData,
  showApiInfo
};

// Rulează dacă este executat direct
if (require.main === module) {
  main().catch(console.error);
} 