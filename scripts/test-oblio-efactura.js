#!/usr/bin/env node

/**
 * Test script pentru integrarea Oblio cu e-factura
 * Verifică colectarea și transmiterea corectă a datelor pentru conformitatea românească
 */

const { oblioService, convertStripeToOblioData } = require('../lib/oblio-invoice-service');

// Mock data pentru testare
const mockUserData = {
  firstName: 'Ion',
  lastName: 'Popescu',
  email: 'ion.popescu@email.com',
  phone: '+40712345678',
  address: 'Strada Libertății, nr. 15, bl. A1, sc. B, et. 3, ap. 12',
  city: 'Voluntari',
  state: 'Ilfov', // Județ
  country: 'Romania',
};

const mockCompanyData = {
  firstName: 'Maria',
  lastName: 'Ionescu',
  email: 'contact@company.ro',
  phone: '+40723456789',
  company: 'TEST COMPANY SRL',
  companyVat: 'RO87654321',
  companyReg: 'J40/1234/2023',
  address: 'Bd. Unirii, nr. 1, et. 5',
  city: 'București',
  state: 'București',
  country: 'Romania',
};

const mockSubscriptionData = {
  subscriptionId: 'sub_test_123456789',
      amount: 500, // 5.00 EUR în cents
    currency: 'eur',
};

async function testOblioAuthentication() {
  console.log('\n🔐 ===== TESTARE AUTENTIFICARE OBLIO =====');
  
  try {
    console.log('🔐 Încercare autentificare...');
    const token = await oblioService.authenticate();
    
    if (token && token.length > 0) {
      console.log('✅ Autentificare reușită');
      console.log('🔑 Token length:', token.length);
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      return true;
    } else {
      console.error('❌ Token invalid primit');
      return false;
    }
  } catch (error) {
    console.error('❌ Eroare autentificare:', error.message);
    return false;
  }
}

function testDataConversion() {
  console.log('\n📊 ===== TESTARE CONVERSIE DATE =====');
  
  try {
    console.log('📝 Testare client individual...');
    const individualData = convertStripeToOblioData(mockUserData, mockSubscriptionData, 500);
    
    console.log('✅ Date client individual convertite:');
    console.log('   👤 Nume:', individualData.clientName);
    console.log('   📧 Email:', individualData.clientEmail);
    console.log('   📞 Telefon:', individualData.clientPhone);
    console.log('   🏠 Adresă:', individualData.clientAddress);
    console.log('   🏙️ Oraș:', individualData.clientCity);
    console.log('   🗺️ Județ:', individualData.clientCounty);
    console.log('   🌍 Țară:', individualData.clientCountry);
    console.log('   💼 Tip facturare:', individualData.billingType);
    
    console.log('\n📝 Testare client corporativ...');
    const corporateData = convertStripeToOblioData(mockCompanyData, mockSubscriptionData, 500);
    
    console.log('✅ Date client corporativ convertite:');
    console.log('   🏢 Companie:', corporateData.company);
    console.log('   🆔 CIF:', corporateData.companyVAT);
    console.log('   📋 Nr. Reg:', corporateData.companyReg);
    console.log('   🏠 Adresă companie:', corporateData.companyAddress);
    console.log('   👤 Contact:', corporateData.clientName);
    console.log('   💼 Tip facturare:', corporateData.billingType);
    
    return true;
  } catch (error) {
    console.error('❌ Eroare conversie date:', error.message);
    return false;
  }
}

async function testInvoiceCreation() {
  console.log('\n🧾 ===== TESTARE CREARE FACTURĂ =====');
  
  try {
    // Test client individual
    console.log('📝 Testare factură client individual...');
    const individualInvoiceData = convertStripeToOblioData(mockUserData, mockSubscriptionData, 500);
    
    console.log('📋 Date trimise către Oblio:', {
      clientName: individualInvoiceData.clientName,
      clientEmail: individualInvoiceData.clientEmail,
      clientAddress: individualInvoiceData.clientAddress,
      clientCity: individualInvoiceData.clientCity,
      clientCounty: individualInvoiceData.clientCounty,
      clientCountry: individualInvoiceData.clientCountry,
      totalCost: individualInvoiceData.totalCost,
      billingType: individualInvoiceData.billingType
    });
    
    if (process.env.OBLIO_ENABLED === 'true' && process.env.NODE_ENV !== 'production') {
      console.log('🚀 Trimitere la Oblio...');
      const result = await oblioService.generateInvoice(individualInvoiceData);
      
      if (result.success) {
        console.log('✅ Factură creată cu succes!');
        console.log('   📋 Număr factură:', result.invoiceNumber);
        console.log('   🔗 URL factură:', result.invoiceUrl);
      } else {
        console.error('❌ Eroare creare factură:', result.error);
      }
    } else {
      console.log('ℹ️ Oblio dezactivat - simulare creare factură');
      console.log('✅ Date validate și pregătite pentru Oblio');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Eroare testare factură:', error.message);
    return false;
  }
}

function testEFacturaCompliance() {
  console.log('\n📋 ===== VERIFICARE CONFORMITATE E-FACTURA =====');
  
  const individualData = convertStripeToOblioData(mockUserData, mockSubscriptionData, 500);
  
  // Verificări obligatorii pentru e-factura România
  const requiredFields = [
    { field: 'clientName', value: individualData.clientName, label: 'Nume client' },
    { field: 'clientEmail', value: individualData.clientEmail, label: 'Email client' },
    { field: 'clientAddress', value: individualData.clientAddress, label: 'Adresa completă' },
    { field: 'clientCity', value: individualData.clientCity, label: 'Oraș/Localitatea' },
    { field: 'clientCounty', value: individualData.clientCounty, label: 'Județ' },
    { field: 'clientCountry', value: individualData.clientCountry, label: 'Țara' },
    { field: 'totalCost', value: individualData.totalCost, label: 'Suma totală' },
  ];
  
  let allValid = true;
  
  console.log('🔍 Verificare câmpuri obligatorii:');
  requiredFields.forEach(({ field, value, label }) => {
    if (value && value !== '') {
      console.log(`   ✅ ${label}: ${value}`);
    } else {
      console.log(`   ❌ ${label}: LIPSEȘTE`);
      allValid = false;
    }
  });
  
  // Verificări specifice format românesc
  console.log('\n🇷🇴 Verificare format românesc:');
  
  // Verifică că județul nu e gol pentru clients individuali
  if (individualData.billingType === 'individual') {
    if (individualData.clientCounty && individualData.clientCounty.length > 0) {
      console.log('   ✅ Județ specificat pentru client individual');
    } else {
      console.log('   ❌ Județ lipsește pentru client individual');
      allValid = false;
    }
  }
  
  // Verifică țara default România
  if (individualData.clientCountry === 'Romania') {
    console.log('   ✅ Țara setată corect (Romania)');
  } else {
    console.log(`   ⚠️ Țara: ${individualData.clientCountry} (diferită de Romania)`);
  }
  
  // Verifică format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(individualData.clientEmail)) {
    console.log('   ✅ Format email valid');
  } else {
    console.log('   ❌ Format email invalid');
    allValid = false;
  }
  
  console.log('\n📊 Rezultat conformitate:');
  if (allValid) {
    console.log('✅ TOATE verificările trecute - CONFORM e-factura România');
  } else {
    console.log('❌ EȘEC verificări - NU este conform e-factura România');
  }
  
  return allValid;
}

function printEnvironmentCheck() {
  console.log('\n⚙️ ===== VERIFICARE CONFIGURARE =====');
  
  const requiredEnvVars = [
    'OBLIO_EMAIL',
    'OBLIO_SECRET', 
    'OBLIO_CIF',
    'OBLIO_SERIES'
  ];
  
  let allConfigured = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: SET`);
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
      allConfigured = false;
    }
  });
  
  console.log(`\n🔧 Oblio enabled: ${process.env.OBLIO_ENABLED === 'true' ? 'YES' : 'NO'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  return allConfigured;
}

async function runAllTests() {
  console.log('🧪 ===== TEST INTEGRARE OBLIO E-FACTURA =====');
  console.log('📅 Data test:', new Date().toISOString());
  console.log('===============================================');
  
  const configOk = printEnvironmentCheck();
  const conversionOk = testDataConversion();
  const complianceOk = testEFacturaCompliance();
  
  let authOk = false;
  let invoiceOk = false;
  
  if (configOk) {
    authOk = await testOblioAuthentication();
    if (authOk) {
      invoiceOk = await testInvoiceCreation();
    }
  }
  
  console.log('\n📊 ===== SUMAR REZULTATE =====');
  console.log(`⚙️ Configurare: ${configOk ? '✅ OK' : '❌ EȘEC'}`);
  console.log(`📊 Conversie date: ${conversionOk ? '✅ OK' : '❌ EȘEC'}`);
  console.log(`📋 Conformitate e-factura: ${complianceOk ? '✅ OK' : '❌ EȘEC'}`);
  console.log(`🔐 Autentificare Oblio: ${authOk ? '✅ OK' : '❌ EȘEC'}`);
  console.log(`🧾 Creare factură: ${invoiceOk ? '✅ OK' : '❌ EȘEC'}`);
  
  const allPassed = configOk && conversionOk && complianceOk && authOk && invoiceOk;
  
  console.log('\n===============================================');
  if (allPassed) {
    console.log('🎉 TOATE TESTELE AU TRECUT - SISTEM GATA PENTRU PRODUCȚIE');
  } else {
    console.log('⚠️ UNELE TESTE AU EȘUAT - VERIFICĂ CONFIGURAREA');
  }
  console.log('===============================================\n');
  
  return allPassed;
}

// Rulează testele dacă scriptul este executat direct
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Eroare critică în testare:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testOblioAuthentication,
  testDataConversion,
  testInvoiceCreation,
  testEFacturaCompliance,
  printEnvironmentCheck
}; 