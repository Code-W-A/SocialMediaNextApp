import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { stripe } from '@/lib/stripe';

// This endpoint serves as a backup check for expired subscriptions
// In case webhooks fail, this can be called periodically to ensure consistency
export async function POST(request) {
  try {
    // Simple auth check - you should implement proper auth here
    const authHeader = headers().get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('\n🔍 ===== CHECKING EXPIRED SUBSCRIPTIONS =====');
    console.log('📅 Started at:', new Date().toISOString());

    // Get all users with premium subscriptions that might be expired
    const usersQuery = query(
      collection(db, 'Users'),
      where('subscription.isPremium', '==', true),
      where('subscription.cancelAtPeriodEnd', '==', true)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const now = new Date();
    let checkedCount = 0;
    let expiredCount = 0;
    let updatedCount = 0;

    console.log(`📊 Found ${usersSnapshot.size} users with canceled subscriptions to check`);

    for (const userDocSnapshot of usersSnapshot.docs) {
      const userData = userDocSnapshot.data();
      const subscription = userData.subscription;
      const userId = userDocSnapshot.id;

      checkedCount++;

      if (!subscription?.currentPeriodEnd || !subscription?.subscriptionId) {
        console.log(`⚠️ User ${userId}: Missing subscription data`);
        continue;
      }

      const periodEnd = subscription.currentPeriodEnd.toDate ? 
        subscription.currentPeriodEnd.toDate() : 
        new Date(subscription.currentPeriodEnd);

      // Check if subscription has expired
      if (now > periodEnd) {
        expiredCount++;
        console.log(`⏰ User ${userId}: Subscription expired on ${periodEnd.toISOString()}`);

        try {
          // Double-check with Stripe to be absolutely sure
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscriptionId);
          
          if (stripeSubscription.status === 'canceled' || 
              (stripeSubscription.cancel_at_period_end && now > new Date(stripeSubscription.current_period_end * 1000))) {
            
            // Update Firestore to revoke premium access
            await updateDoc(doc(db, 'Users', userId), {
              'subscription.isPremium': false,
              'subscription.status': 'canceled',
              'subscription.expiredAt': now,
              'subscription.expiredViaBackupCheck': true,
              'subscription.updatedAt': now
            });

            updatedCount++;
            console.log(`✅ User ${userId}: Premium access revoked (expired subscription)`);
          } else {
            console.log(`ℹ️ User ${userId}: Stripe shows subscription still active, keeping premium`);
          }
        } catch (stripeError) {
          console.error(`❌ User ${userId}: Error checking Stripe subscription:`, stripeError.message);
          
          // If we can't reach Stripe, but local data shows expired, still revoke access
          await updateDoc(doc(db, 'Users', userId), {
            'subscription.isPremium': false,
            'subscription.status': 'canceled',
            'subscription.expiredAt': now,
            'subscription.expiredViaBackupCheck': true,
            'subscription.backupCheckError': stripeError.message,
            'subscription.updatedAt': now
          });

          updatedCount++;
          console.log(`⚠️ User ${userId}: Premium access revoked (couldn't verify with Stripe, but locally expired)`);
        }
      } else {
        console.log(`✅ User ${userId}: Subscription valid until ${periodEnd.toISOString()}`);
      }
    }

    const result = {
      success: true,
      timestamp: now.toISOString(),
      statistics: {
        totalChecked: checkedCount,
        totalExpired: expiredCount,
        totalUpdated: updatedCount,
        totalUsers: usersSnapshot.size
      }
    };

    console.log('\n📊 ===== BACKUP CHECK COMPLETED =====');
    console.log('📈 Statistics:', result.statistics);
    console.log('⏰ Completed at:', new Date().toISOString());
    console.log('=========================================\n');

    return NextResponse.json(result);

  } catch (error) {
    console.error('\n❌ ===== BACKUP CHECK FAILED =====');
    console.error('🔥 Error:', error.message);
    console.error('📊 Stack:', error.stack);
    console.error('=======================================\n');

    return NextResponse.json(
      { 
        error: 'Backup check failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 