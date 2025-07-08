import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/firebaseAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { oblioService } from '@/lib/oblioService';

/**
 * Oblio Invoice Status API
 * GET /api/oblio/invoice-status?invoiceId=xxx
 * GET /api/oblio/invoice-status (returns user's last invoices)
 */
export async function GET(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const userId = searchParams.get('userId') || user.id;

    console.log('📋 Oblio invoice status requested:', {
      userId,
      invoiceId
    });

    // Get user data
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const subscription = userData.subscription || {};

    // If specific invoice ID requested, get that invoice
    if (invoiceId) {
      console.log('📋 Getting specific Oblio invoice:', invoiceId);
      
      // Parse invoice ID to get series and number
      const invoiceParts = invoiceId.split(' ');
      const seriesName = invoiceParts[0] || 'FACT';
      const number = invoiceParts[1] || invoiceId;
      
      const oblioResult = await oblioService.getInvoiceDetails(seriesName, number);
      
      if (oblioResult.success) {
        return NextResponse.json({
          success: true,
          invoice: oblioResult.data
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to get invoice',
          details: oblioResult.error
        }, { status: 500 });
      }
    }

    // Otherwise, return user's invoice information from Firestore
    const invoiceInfo = {
      lastOblioInvoice: {
        id: subscription.lastOblioInvoiceId || null,
        number: subscription.lastOblioInvoiceNumber || null,
        url: subscription.lastOblioInvoiceUrl || null,
        date: subscription.lastOblioInvoiceDate || null,
      },
      lastManualOblioInvoice: {
        id: subscription.lastManualOblioInvoiceId || null,
        number: subscription.lastManualOblioInvoiceNumber || null,
        url: subscription.lastManualOblioInvoiceUrl || null,
        date: subscription.lastManualOblioInvoiceDate || null,
      },
      subscriptionInfo: {
        status: subscription.status || 'inactive',
        isPremium: subscription.isPremium || false,
        lastPaymentStatus: subscription.lastPaymentStatus || null,
        lastPaymentDate: subscription.lastPaymentDate || null,
      }
    };

    return NextResponse.json({
      success: true,
      invoiceInfo
    });

  } catch (error) {
    console.error('❌ Error getting Oblio invoice status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
} 