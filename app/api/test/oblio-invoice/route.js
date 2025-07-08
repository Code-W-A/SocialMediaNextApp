import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { oblioService, convertStripeToOblioData } from '@/lib/oblioService';

/**
 * TEST ENDPOINT pentru generarea facturilor Oblio
 * POST /api/test/oblio-invoice
 * 
 * Body:
 * {
 *   "userId": "user_id_din_firebase", // OBLIGATORIU
 *   "amount": 1999, // Optional - default 1999 (€19.99)
 *   "currency": "eur", // Optional - default "eur"
 *   "testType": "individual" | "corporate" // Optional - default "individual"
 * }
 */
export async function POST(request) {
  try {
    console.log('\n🧪 ===== TEST OBLIO INVOICE GENERATION =====');
    console.log('📅 Timestamp:', new Date().toISOString());

    const body = await request.json();
    const { 
      userId, 
      amount = 1999, // €19.99 default
      currency = 'eur',
      testType = 'individual'
    } = body;

    // Validare userId
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Test parameters:', {
      userId,
      amount,
      currency,
      testType
    });

    // Verifică dacă userul există
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    console.log('👤 User found:', {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      hasCompany: !!userData.company
    });

    // Simulează datele de la Stripe - exact ca în webhook real
    const mockStripeInvoice = {
      id: `in_test_${Date.now()}`,
      amount_paid: amount, // în cenți
      currency: currency,
      status: 'paid',
      customer: `cus_test_${userId.substring(0, 8)}`,
      subscription: `sub_test_${Date.now()}`
    };

    const mockStripeCustomer = {
      name: `${userData.firstName || 'Test'} ${userData.lastName || 'User'}`,
      email: userData.email,
      phone: userData.phone || '+40700000000',
      address: testType === 'corporate' ? {
        line1: userData.address || 'Strada Test 123',
        city: userData.city || 'București',
        state: userData.state || 'București', 
        country: userData.country || 'Romania'
      } : {
        line1: 'Strada Victoriei 45',
        city: 'Cluj-Napoca',
        state: 'Cluj',
        country: 'Romania'
      }
    };

    console.log('📊 Mock Stripe data:', {
      invoice: mockStripeInvoice,
      customer: {
        name: mockStripeCustomer.name,
        email: mockStripeCustomer.email,
        address: mockStripeCustomer.address
      }
    });

    // Simulează exact aceeași logică ca în webhook
    console.log('\n🏭 ===== GENERATING OBLIO INVOICE (TEST MODE) =====');
    
    if (mockStripeInvoice.status === 'paid' && mockStripeInvoice.amount_paid > 0) {
      console.log('✅ Payment confirmed - generating Oblio invoice');
      
      // Prepare customer data cu adresă completă
      const customerData = {
        firstName: userData.firstName || mockStripeCustomer.name?.split(' ')[0] || 'Client',
        lastName: userData.lastName || mockStripeCustomer.name?.split(' ').slice(1).join(' ') || 'Test',
        email: mockStripeCustomer.email || userData.email,
        phone: mockStripeCustomer.phone || userData.phone || '+40700000000',
        address: mockStripeCustomer.address?.line1 || userData.address || 'Adresă Test',
        city: mockStripeCustomer.address?.city || userData.city || 'București',
        state: mockStripeCustomer.address?.state || userData.state || 'București',
        country: mockStripeCustomer.address?.country || userData.country || 'Romania',
        company: testType === 'corporate' ? (userData.company || 'Test SRL') : '',
        companyVat: testType === 'corporate' ? (userData.companyVat || 'RO12345678') : '',
        companyReg: testType === 'corporate' ? (userData.companyReg || 'J40/123/2023') : '',
      };
      
      const subscriptionData = {
        subscriptionId: mockStripeInvoice.subscription,
        priceId: currency === 'eur' ? 'price_premium_monthly_eur' : 'price_premium_monthly',
        amount: mockStripeInvoice.amount_paid,
        currency: mockStripeInvoice.currency,
      };
      
      // Convert to Oblio format
      console.log('🔄 Converting data to Oblio format...');
      const oblioInvoiceData = convertStripeToOblioData(customerData, subscriptionData, mockStripeInvoice.amount_paid);
      
      console.log('📋 Oblio Invoice Data:', {
        clientName: oblioInvoiceData.clientName,
        clientEmail: oblioInvoiceData.clientEmail,
        address: oblioInvoiceData.clientAddress,
        city: oblioInvoiceData.clientCity,
        county: oblioInvoiceData.clientCounty,
        country: oblioInvoiceData.clientCountry,
        totalCost: oblioInvoiceData.totalCost,
        currency: oblioInvoiceData.currency,
        billingType: oblioInvoiceData.billingType,
        company: oblioInvoiceData.company || 'N/A'
      });
      
      console.log('🚀 Generating Oblio invoice...');
      const oblioResult = await oblioService.generateInvoice(oblioInvoiceData);
      
      if (oblioResult.success) {
        console.log('✅ Oblio invoice created successfully!', {
          invoiceNumber: oblioResult.invoiceNumber,
          invoiceUrl: oblioResult.invoiceUrl
        });
        
        // Save Oblio invoice details to user record (ca în webhook real)
        await updateDoc(doc(db, 'Users', userId), {
          'subscription.lastOblioInvoiceNumber': oblioResult.invoiceNumber,
          'subscription.lastOblioInvoiceUrl': oblioResult.invoiceUrl,
          'subscription.lastOblioInvoiceDate': new Date(),
          'subscription.lastTestInvoiceGenerated': new Date(), // Marcaj că e test
          'subscription.updatedAt': new Date()
        });
        
        console.log('💾 Oblio invoice details saved to Firestore');
        
        return NextResponse.json({
          success: true,
          message: 'Test Oblio invoice generated successfully!',
          invoice: {
            number: oblioResult.invoiceNumber,
            url: oblioResult.invoiceUrl,
            amount: amount,
            currency: currency,
            customer: oblioInvoiceData.clientEmail,
            testMode: true,
            billingType: oblioInvoiceData.billingType,
            timestamp: new Date().toISOString()
          },
          mockData: {
            stripeInvoice: mockStripeInvoice,
            stripeCustomer: mockStripeCustomer,
            oblioData: oblioInvoiceData
          }
        });
      } else {
        console.error('❌ Oblio invoice creation failed:', oblioResult.error);
        
        return NextResponse.json({
          success: false,
          error: 'Oblio invoice creation failed',
          details: oblioResult.error,
          testMode: true
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment data',
        testMode: true
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error in test Oblio invoice generation:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      testMode: true
    }, { status: 500 });
  }
}

// GET endpoint pentru informații despre test
export async function GET() {
  return NextResponse.json({
    message: 'Oblio Invoice Test Endpoint',
    usage: {
      method: 'POST',
      url: '/api/test/oblio-invoice',
      body: {
        userId: 'string (required) - Firebase user ID',
        amount: 'number (optional) - Amount in cents, default 1999',
        currency: 'string (optional) - Currency code, default "eur"',
        testType: 'string (optional) - "individual" or "corporate", default "individual"'
      }
    },
    examples: {
      individual: {
        userId: 'your_firebase_user_id',
        amount: 1999,
        currency: 'eur',
        testType: 'individual'
      },
      corporate: {
        userId: 'your_firebase_user_id', 
        amount: 2999,
        currency: 'ron',
        testType: 'corporate'
      }
    }
  });
} 