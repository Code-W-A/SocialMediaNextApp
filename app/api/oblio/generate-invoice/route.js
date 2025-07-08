import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { oblioService, convertStripeToOblioData } from '@/lib/oblioService';

/**
 * API DEDICAT pentru generarea facturilor Oblio
 * POST /api/oblio/generate-invoice
 * 
 * Poate fi apelat din:
 * - Webhook Stripe (automat)
 * - Manual pentru retry/recovery  
 * - Admin panel pentru generare manuală
 * - Alte sisteme externe
 * 
 * Body:
 * {
 *   "source": "stripe_webhook" | "manual" | "admin" | "recovery",
 *   "userId": "firebase_user_id",
 *   "stripeData": {
 *     "invoiceId": "in_stripe_invoice_id",
 *     "customerId": "cus_stripe_customer_id", 
 *     "subscriptionId": "sub_stripe_subscription_id",
 *     "amount": 1999,
 *     "currency": "eur",
 *     "paymentStatus": "paid"
 *   },
 *   "customerData": {
 *     "name": "Client Name",
 *     "email": "client@email.com",
 *     "phone": "+40700000000",
 *     "address": {
 *       "line1": "Strada Victoriei 123",
 *       "city": "București", 
 *       "state": "București",
 *       "country": "Romania"
 *     },
 *     "company": "Company SRL", // Optional for corporate
 *     "companyVat": "RO12345678", // Optional
 *     "companyReg": "J40/123/2023" // Optional
 *   },
 *   "metadata": {
 *     "priceId": "price_premium_monthly",
 *     "planName": "Premium Monthly",
 *     "reference": "custom_reference" // Optional
 *   }
 * }
 */
export async function POST(request) {
  try {
    console.log('\n🧾 ===== OBLIO INVOICE GENERATION API =====');
    console.log('📅 Timestamp:', new Date().toISOString());

    const body = await request.json();
    const { 
      source = 'unknown',
      userId,
      stripeData,
      customerData,
      metadata = {}
    } = body;

    console.log('🎯 Invoice generation request:', {
      source,
      userId,
      amount: stripeData?.amount,
      currency: stripeData?.currency,
      customerEmail: customerData?.email
    });

    // Validări de bază
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!stripeData || !customerData) {
      return NextResponse.json(
        { error: 'stripeData and customerData are required' },
        { status: 400 }
      );
    }

    if (!stripeData.amount || stripeData.amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Verifică dacă userul există în Firebase
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found in Firebase' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    console.log('👤 User found:', {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      hasSubscription: !!userData.subscription
    });

    // Verifică dacă factura nu e deja generată (pentru webhook duplicates)
    if (source === 'stripe_webhook' && stripeData.invoiceId) {
      const existingInvoice = userData.subscription?.oblioInvoices?.find(
        inv => inv.stripeInvoiceId === stripeData.invoiceId
      );
      
      if (existingInvoice) {
        console.log('⚠️ Invoice already generated for this Stripe invoice:', stripeData.invoiceId);
        return NextResponse.json({
          success: true,
          message: 'Invoice already exists',
          invoice: existingInvoice,
          duplicate: true
        });
      }
    }

    console.log('\n🔄 ===== PREPARING OBLIO DATA =====');

    // Pregătește datele pentru Oblio (combinând datele din request cu userData)
    const oblioCustomerData = {
      firstName: userData.firstName || customerData.name?.split(' ')[0] || 'Client',
      lastName: userData.lastName || customerData.name?.split(' ').slice(1).join(' ') || 'YDestiny',
      email: customerData.email || userData.email,
      phone: customerData.phone || userData.phone || '',
      address: customerData.address?.line1 || userData.address || '',
      city: customerData.address?.city || userData.city || '',
      state: customerData.address?.state || userData.state || userData.county || '',
      country: customerData.address?.country || userData.country || 'Romania',
      company: customerData.company || userData.company || '',
      companyVat: customerData.companyVat || userData.companyVat || '',
      companyReg: customerData.companyReg || userData.companyReg || '',
    };

    const oblioSubscriptionData = {
      subscriptionId: stripeData.subscriptionId || `manual_${Date.now()}`,
      priceId: metadata.priceId || 'premium_monthly',
      amount: stripeData.amount,
      currency: stripeData.currency || 'eur',
    };

    console.log('📋 Customer data for Oblio:', {
      name: `${oblioCustomerData.firstName} ${oblioCustomerData.lastName}`,
      email: oblioCustomerData.email,
      address: oblioCustomerData.address,
      city: oblioCustomerData.city,
      state: oblioCustomerData.state,
      country: oblioCustomerData.country,
      isCompany: !!oblioCustomerData.company
    });

    // Convertește la formatul Oblio
    const oblioInvoiceData = convertStripeToOblioData(
      oblioCustomerData, 
      oblioSubscriptionData, 
      stripeData.amount
    );

    console.log('🎯 Oblio invoice data prepared:', {
      clientName: oblioInvoiceData.clientName,
      clientEmail: oblioInvoiceData.clientEmail,
      billingType: oblioInvoiceData.billingType,
      totalCost: oblioInvoiceData.totalCost,
      currency: oblioInvoiceData.currency,
      hasAddress: !!oblioInvoiceData.clientAddress,
      hasCity: !!oblioInvoiceData.clientCity
    });

    console.log('\n🚀 ===== GENERATING OBLIO INVOICE =====');
    console.log('⏰ Starting Oblio API call...');

    // Generează factura în Oblio
    const oblioResult = await oblioService.generateInvoice(oblioInvoiceData);

    console.log('📊 Oblio generation result:', {
      success: oblioResult.success,
      hasInvoiceNumber: !!oblioResult.invoiceNumber,
      hasInvoiceUrl: !!oblioResult.invoiceUrl,
      error: oblioResult.error || 'none'
    });

    if (oblioResult.success) {
      console.log('✅ Oblio invoice created successfully!');
      console.log('📄 Invoice number:', oblioResult.invoiceNumber);
      console.log('🔗 Invoice URL:', oblioResult.invoiceUrl);

      // Pregătește datele pentru salvare în Firebase
      const invoiceRecord = {
        oblioInvoiceNumber: oblioResult.invoiceNumber,
        oblioInvoiceUrl: oblioResult.invoiceUrl,
        stripeInvoiceId: stripeData.invoiceId || null,
        stripeCustomerId: stripeData.customerId || null,
        stripeSubscriptionId: stripeData.subscriptionId || null,
        amount: stripeData.amount,
        currency: stripeData.currency,
        source: source,
        generatedAt: new Date(),
        customerEmail: oblioInvoiceData.clientEmail,
        billingType: oblioInvoiceData.billingType,
        reference: metadata.reference || null
      };

      console.log('\n💾 ===== SAVING TO FIREBASE =====');

      // Salvează în Firebase (multiple locații pentru redundanță)
      const updateData = {
        // Ultima factură (pentru backward compatibility)
        'subscription.lastOblioInvoiceNumber': oblioResult.invoiceNumber,
        'subscription.lastOblioInvoiceUrl': oblioResult.invoiceUrl,
        'subscription.lastOblioInvoiceDate': new Date(),
        'subscription.lastOblioInvoiceSource': source,
        
        // Array cu toate facturile (pentru istoric complet)
        'subscription.oblioInvoices': userData.subscription?.oblioInvoices 
          ? [...userData.subscription.oblioInvoices, invoiceRecord]
          : [invoiceRecord],
          
        'subscription.updatedAt': new Date()
      };

      await updateDoc(doc(db, 'Users', userId), updateData);

      console.log('✅ Invoice data saved to Firebase');
      console.log('📧 Email should be sent automatically by Oblio');

      return NextResponse.json({
        success: true,
        message: 'Oblio invoice generated successfully',
        source: source,
        invoice: {
          number: oblioResult.invoiceNumber,
          url: oblioResult.invoiceUrl,
          amount: stripeData.amount,
          currency: stripeData.currency,
          customer: oblioInvoiceData.clientEmail,
          billingType: oblioInvoiceData.billingType,
          generatedAt: new Date().toISOString(),
          source: source
        },
        stripeData: {
          invoiceId: stripeData.invoiceId,
          customerId: stripeData.customerId,
          subscriptionId: stripeData.subscriptionId
        },
        timestamp: new Date().toISOString()
      });

    } else {
      console.error('❌ Oblio invoice generation failed');
      console.error('📊 Error details:', oblioResult.error);

      return NextResponse.json({
        success: false,
        error: 'Oblio invoice generation failed',
        details: oblioResult.error,
        source: source,
        retryable: true,
        stripeData: {
          invoiceId: stripeData.invoiceId,
          amount: stripeData.amount,
          currency: stripeData.currency
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in Oblio invoice generation API:', error);
    console.error('📊 Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      retryable: true,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint pentru informații despre API
export async function GET() {
  return NextResponse.json({
    name: 'Oblio Invoice Generation API',
    version: '1.0.0',
    description: 'Dedicated API for generating Oblio invoices from various sources',
    endpoints: {
      generate: {
        method: 'POST',
        url: '/api/oblio/generate-invoice',
        description: 'Generate Oblio invoice from Stripe data or manual input'
      }
    },
    sources: [
      'stripe_webhook',
      'manual', 
      'admin',
      'recovery'
    ],
    features: [
      'Duplicate prevention',
      'Firebase integration',
      'Multiple data sources',
      'Error handling with retry support',
      'Complete audit trail'
    ],
    usage: {
      'stripe_webhook': 'Called automatically from Stripe webhook',
      'manual': 'Called manually for testing or one-off invoices',
      'admin': 'Called from admin panel',
      'recovery': 'Called to retry failed invoice generations'
    }
  });
} 