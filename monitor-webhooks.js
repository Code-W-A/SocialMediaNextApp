const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, doc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function monitorUserSubscriptions(userId = 'test-user-123') {
  console.log('🔍 ===== MONITORING FIRESTORE SUBSCRIPTIONS =====');
  console.log('👤 Monitoring user:', userId);
  console.log('📅 Started at:', new Date().toISOString());
  console.log('================================================\n');

  // Monitor specific user
  const userRef = doc(db, 'Users', userId);
  
  return onSnapshot(userRef, (doc) => {
    const timestamp = new Date().toISOString();
    
    if (doc.exists()) {
      const data = doc.data();
      const subscription = data.subscription || {};
      
      console.log(`\n🔄 [${timestamp}] USER DATA UPDATED:`);
      console.log('👤 User ID:', userId);
      console.log('📊 Subscription Data:');
      console.log('   ✅ Status:', subscription.status || 'none');
      console.log('   💳 Last Payment:', subscription.lastPaymentStatus || 'none');
      console.log('   📅 Last Payment Date:', subscription.lastPaymentDate?.toDate?.() || subscription.lastPaymentDate || 'none');
      console.log('   🛒 Checkout Completed:', subscription.checkoutCompleted || false);
      console.log('   📅 Checkout Date:', subscription.checkoutCompletedAt?.toDate?.() || subscription.checkoutCompletedAt || 'none');
      console.log('   👤 Stripe Customer:', subscription.stripeCustomerId || 'none');
      console.log('   🔄 Updated At:', subscription.updatedAt?.toDate?.() || subscription.updatedAt || 'none');
      console.log('   🧾 Last Invoice:', subscription.lastInvoiceId || 'none');
      console.log('===============================================');
    } else {
      console.log(`\n❌ [${timestamp}] USER NOT FOUND: ${userId}`);
    }
  }, (error) => {
    console.error('❌ Error monitoring user:', error);
  });
}

function monitorAllUsers() {
  console.log('🔍 ===== MONITORING ALL USERS SUBSCRIPTIONS =====');
  console.log('📅 Started at:', new Date().toISOString());
  console.log('================================================\n');

  const usersRef = collection(db, 'Users');
  
  return onSnapshot(usersRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const timestamp = new Date().toISOString();
      const userId = change.doc.id;
      const data = change.doc.data();
      const subscription = data.subscription || {};

      if (change.type === 'added') {
        console.log(`\n➕ [${timestamp}] NEW USER: ${userId}`);
      } else if (change.type === 'modified') {
        console.log(`\n🔄 [${timestamp}] USER UPDATED: ${userId}`);
        
        // Doar dacă are modificări la subscription
        if (subscription && Object.keys(subscription).length > 0) {
          console.log('📊 Subscription Changes:');
          console.log('   ✅ Status:', subscription.status || 'none');
          console.log('   💳 Last Payment:', subscription.lastPaymentStatus || 'none');
          console.log('   🛒 Checkout Completed:', subscription.checkoutCompleted || false);
          console.log('   👤 Stripe Customer:', subscription.stripeCustomerId || 'none');
        }
      } else if (change.type === 'removed') {
        console.log(`\n❌ [${timestamp}] USER REMOVED: ${userId}`);
      }
      console.log('===============================================');
    });
  }, (error) => {
    console.error('❌ Error monitoring users:', error);
  });
}

// Verifică URL-ul webhook-ului
async function checkWebhookEndpoint() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`;
  
  console.log('🔗 ===== WEBHOOK ENDPOINT CHECK =====');
  console.log('🎯 Webhook URL:', webhookUrl);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'GET'
    });
    
    console.log('📊 Status:', response.status);
    console.log('✅ Endpoint is reachable');
  } catch (error) {
    console.error('❌ Endpoint not reachable:', error.message);
  }
  console.log('===================================\n');
}

function startMonitoring() {
  console.log('🚀 Starting Webhook & Firestore Monitor...\n');
  
  // Check webhook endpoint
  checkWebhookEndpoint();
  
  // Monitor specific test user
  const userId = process.argv[2] || 'test-user-123';
  const unsubscribeUser = monitorUserSubscriptions(userId);
  
  // Monitor all users (optional)
  // const unsubscribeAll = monitorAllUsers();

  console.log('🎯 Monitoring active. Press Ctrl+C to stop.\n');
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping monitor...');
    unsubscribeUser();
    // unsubscribeAll();
    process.exit(0);
  });
}

if (require.main === module) {
  startMonitoring();
}

module.exports = { 
  monitorUserSubscriptions, 
  monitorAllUsers, 
  checkWebhookEndpoint 
}; 