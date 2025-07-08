import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/firebaseAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { oblioService, convertStripeToOblioData } from '@/lib/oblioService';

/**
 * Manual Oblio Invoice Creation API
 * POST /api/oblio/create-invoice
 * 
 * Body:
 * {
 *   "userId": "user_id", // Optional if called by authenticated user
 *   "amount": 1999, // Amount in cents
 *   "currency": "ron",
 *   "description": "Custom description", // Optional
 *   "reference": "custom_reference" // Optional
 * }
 */
export async function POST(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      userId, 
      amount, 
      currency = 'ron', 
      description = 'Abonament Premium YDestiny',
      reference 
    } = body;

    // Use provided userId or current user's ID
    const targetUserId = userId || user.id;

    console.log('📋 Manual Oblio invoice creation requested:', {
      targetUserId,
      amount,
      currency,
      description,
      reference
    });

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Get user data
    const userDoc = await getDoc(doc(db, 'Users', targetUserId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Prepare customer data for manual invoice
    const customerData = {
      firstName: userData.firstName || 'Client',
      lastName: userData.lastName || 'YDestiny',
      email: userData.email,
      phone: userData.phone || '',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || userData.county || '',
      country: userData.country || 'Romania',
      company: userData.company || '',
      companyVat: userData.companyVat || '',
      companyReg: userData.companyReg || '',
    };
    
    // Create subscription data for manual invoice
    const subscriptionData = {
      subscriptionId: reference || `manual_${Date.now()}`,
      amount: amount,
      currency: currency,
    };

    // Convert to Oblio format
    const oblioInvoiceData = convertStripeToOblioData(customerData, subscriptionData, amount);

    console.log('📋 Creating manual Oblio invoice...', {
      customer: oblioInvoiceData.clientEmail,
      amount: amount,
      currency: currency
    });

    const oblioResult = await oblioService.generateInvoice(oblioInvoiceData);

    if (oblioResult.success) {
      console.log('✅ Manual Oblio invoice created successfully:', oblioResult);
      
      // Save Oblio invoice details to user record
      const updateData = {
        'subscription.lastManualOblioInvoiceNumber': oblioResult.invoiceNumber,
        'subscription.lastManualOblioInvoiceUrl': oblioResult.invoiceUrl,
        'subscription.lastManualOblioInvoiceDate': new Date(),
        'subscription.updatedAt': new Date()
      };

      await updateDoc(doc(db, 'Users', targetUserId), updateData);
      
      console.log('✅ Manual Oblio invoice details saved to user record');
      
      return NextResponse.json({
        success: true,
        message: 'Invoice created successfully',
        invoice: {
          number: oblioResult.invoiceNumber,
          url: oblioResult.invoiceUrl,
          amount: amount,
          currency: currency,
          customer: oblioInvoiceData.clientEmail,
          reference: reference,
          createdAt: new Date().toISOString()
        }
      });
    } else {
      console.error('❌ Failed to create manual Oblio invoice:', oblioResult.error);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create invoice',
        details: oblioResult.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in manual Oblio invoice creation:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
} 