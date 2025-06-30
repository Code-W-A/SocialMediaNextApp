// Manual processing for the failed webhook payment
import { db } from './lib/firebase-admin.js';

const processFailedPayment = async () => {
  const userId = 'NZsYzHyZWQdFmKuL0UoZV2Dkssf1';
  const customerId = 'cus_Saq3IvxTaLE7Rj';
  const subscriptionId = 'sub_1RfeMzClBW08h64juxct5kVz';
  
  console.log('🔄 Processing failed webhook payment manually...');
  
  try {
    // Update user subscription in Firestore
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      subscriptionStatus: 'active',
      subscriptionId: subscriptionId,
      customerId: customerId,
      subscriptionPlan: 'monthly',
      subscriptionStartDate: new Date('2025-06-30T09:51:25Z'), // from webhook
      subscriptionEndDate: new Date('2025-07-30T09:51:25Z'), // +1 month
      updatedAt: new Date(),
      isPremium: true
    });
    
    console.log('✅ User subscription updated successfully!');
    console.log(`🎉 User ${userId} now has active premium subscription`);
    
    // Log the processing
    await db.collection('webhookLogs').add({
      userId,
      customerId,
      subscriptionId,
      event: 'manual_payment_processing',
      amount: 500,
      currency: 'eur',
      status: 'processed',
      processedAt: new Date(),
      originalEventId: 'evt_1RfeNDClBW08h64jvnVY9Al8',
      reason: 'webhook_redirect_failure'
    });
    
    console.log('📝 Processing logged successfully');
    
  } catch (error) {
    console.error('❌ Error processing payment:', error);
  }
};

processFailedPayment(); 