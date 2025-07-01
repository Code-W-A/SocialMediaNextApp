import { 
  sendPasswordResetEmail, 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  collection 
} from 'firebase/firestore';
import { 
  ref, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    let message = 'Failed to send password reset email';
    
    if (error.code === 'auth/user-not-found') {
      message = 'No user found with this email address';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please try again later';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    }
    
    return { success: false, message };
  }
};

/**
 * Delete all user data from Firebase Storage
 */
export const deleteUserStorageData = async (userId) => {
  try {
    console.log('🗑️ Starting storage cleanup for user:', userId);
    
    // List of storage paths to check
    const storagePaths = [
      `images/${userId}`,  // User-specific folder
      'images',           // Root images folder  
      'banners',          // Banners folder
      'avatars',          // Avatars folder (if exists)
      'uploads'           // Generic uploads folder (if exists)
    ];
    
    for (const path of storagePaths) {
      try {
        const storageRef = ref(storage, path);
        const filesList = await listAll(storageRef);
        
        for (const item of filesList.items) {
          // For root folders, only delete files that contain user ID
          if (path === 'images' || path === 'banners' || path === 'avatars' || path === 'uploads') {
            if (item.name.includes(userId)) {
              await deleteObject(item);
              console.log(`🗑️ Deleted ${path}/${item.name}`);
            }
          } else {
            // For user-specific folders, delete everything
            await deleteObject(item);
            console.log(`🗑️ Deleted ${path}/${item.name}`);
          }
        }
        
        // Also check subfolders in user-specific paths
        for (const folderRef of filesList.prefixes) {
          const subFilesList = await listAll(folderRef);
          for (const subItem of subFilesList.items) {
            await deleteObject(subItem);
            console.log(`🗑️ Deleted ${path}/${folderRef.name}/${subItem.name}`);
          }
        }
        
      } catch (error) {
        console.warn(`⚠️ Error cleaning ${path}:`, error.message);
        // Continue with other paths even if one fails
      }
    }
    
    console.log('✅ Storage cleanup completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Error in storage cleanup:', error);
    // Don't throw error, continue with Firestore cleanup
    return { success: false, error: error.message };
  }
};

/**
 * Delete all user data from Firestore
 */
export const deleteUserFirestoreData = async (userId) => {
  try {
    console.log('🗑️ Starting Firestore cleanup for user:', userId);
    
    // Collections to clean up
    const collectionsToClean = [
      { name: 'Posts', field: 'userId' },
      { name: 'Comments', field: 'userId' },
      { name: 'Likes', field: 'userId' },
      { name: 'Matches', field: 'userId' },
      { name: 'Messages', field: 'senderId' },
      { name: 'Messages', field: 'receiverId' },
      { name: 'Notifications', field: 'userId' },
      { name: 'Reports', field: 'reporterId' },
      { name: 'Reports', field: 'reportedUserId' }
    ];
    
    // Delete documents from collections
    for (const { name, field } of collectionsToClean) {
      try {
        const q = query(collection(db, name), where(field, '==', userId));
        const snapshot = await getDocs(q);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        if (snapshot.docs.length > 0) {
          console.log(`🗑️ Deleted ${snapshot.docs.length} documents from ${name}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error cleaning ${name}:`, error.message);
        // Continue with other collections
      }
    }
    
    // Delete main user document last
    await deleteDoc(doc(db, 'Users', userId));
    console.log('🗑️ Deleted main user document');
    
    console.log('✅ Firestore cleanup completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Error in Firestore cleanup:', error);
    throw error; // Throw error for Firestore as it's critical
  }
};

/**
 * Completely delete user account and all associated data
 */
export const deleteUserAccount = async (currentPassword, userEmail) => {
  try {
    console.log('🚀 Starting complete account deletion process');
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    const userId = user.uid;
    
    // Step 1: Reauthenticate user
    console.log('🔐 Reauthenticating user...');
    const credential = EmailAuthProvider.credential(userEmail, currentPassword);
    await reauthenticateWithCredential(user, credential);
    console.log('✅ User reauthenticated successfully');
    
    // Step 2: Delete user data from Storage (non-critical)
    console.log('🗑️ Cleaning up Storage data...');
    await deleteUserStorageData(userId);
    
    // Step 3: Delete user data from Firestore (critical)
    console.log('🗑️ Cleaning up Firestore data...');
    await deleteUserFirestoreData(userId);
    
    // Step 4: Delete user from Firebase Auth (must be last)
    console.log('🗑️ Deleting user from Firebase Auth...');
    await deleteUser(user);
    console.log('✅ User deleted from Firebase Auth');
    
    console.log('🎉 Account deletion completed successfully');
    return { success: true, message: 'Account deleted successfully' };
    
  } catch (error) {
    console.error('❌ Error in account deletion:', error);
    
    let message = 'Failed to delete account. Please try again.';
    
    if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/requires-recent-login') {
      message = 'Please log out and log back in, then try again.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your connection and try again.';
    }
    
    return { success: false, message };
  }
};

/**
 * Get account deletion statistics (for debugging)
 */
export const getAccountDeletionStats = async (userId) => {
  try {
    const stats = {
      storageFiles: 0,
      firestoreDocuments: 0,
      collections: {}
    };
    
    // Count storage files
    try {
      const paths = ['images', 'banners', 'avatars'];
      for (const path of paths) {
        const ref = ref(storage, path);
        const list = await listAll(ref);
        const userFiles = list.items.filter(item => item.name.includes(userId));
        stats.storageFiles += userFiles.length;
      }
    } catch (error) {
      console.warn('Error counting storage files:', error);
    }
    
    // Count Firestore documents
    const collections = ['Posts', 'Comments', 'Likes', 'Matches', 'Messages', 'Notifications'];
    for (const collectionName of collections) {
      try {
        const q = query(collection(db, collectionName), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        stats.collections[collectionName] = snapshot.docs.length;
        stats.firestoreDocuments += snapshot.docs.length;
      } catch (error) {
        console.warn(`Error counting ${collectionName}:`, error);
        stats.collections[collectionName] = 'error';
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting deletion stats:', error);
    return null;
  }
}; 