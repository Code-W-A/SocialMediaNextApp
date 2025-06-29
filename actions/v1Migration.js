"use server";

import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isV1User, isV1UserMigrated, getV1Properties, getV1Indicators } from '@/utils/v1MigrationUtils';
import { serializeFirebaseData } from '@/utils/firebaseHelpers';

/**
 * Get V1 user status for a specific user
 */
export const getV1UserStatus = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      return {
        isV1User: false,
        isMigrated: false,
        hasShownWelcome: false,
        migrationData: null
      };
    }

    const userData = userDoc.data();
    const v1User = isV1User(userData);
    const migrated = isV1UserMigrated(userData);
    
    const result = {
      isV1User: v1User,
      isMigrated: migrated,
      hasShownWelcome: userData?.v1Migration?.welcomeShown || false,
      migrationData: userData?.v1Migration || null,
      v1Properties: getV1Properties(userData)
    };

    return serializeFirebaseData(result);
  } catch (error) {
    console.error('Error getting V1 user status:', error);
    throw error;
  }
};

/**
 * Migrate a V1 user to V2 premium
 */
export const migrateV1UserToPremium = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    
    // Check if user is actually a V1 user
    if (!isV1User(userData)) {
      throw new Error('User is not a V1 user');
    }

    // Check if already migrated
    if (isV1UserMigrated(userData)) {
      throw new Error('User already migrated');
    }

    // Create V2 premium subscription data
    const v2PremiumData = {
      subscription: {
        status: 'active',
        type: 'v1_migration',
        isPremium: true,
        isLifetime: true,
        source: 'v1_migration',
        migratedAt: new Date(),
        customerId: null,
        subscriptionId: `v1_migration_${userId}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(2099, 11, 31), // Far future date for lifetime
        cancelAtPeriodEnd: false,
        priceId: null,
        updatedAt: new Date()
      },
      v1Migration: {
        completed: true,
        migratedAt: new Date(),
        welcomeShown: false,
        originalProperties: getV1Indicators().reduce((acc, prop) => {
          if (userData[prop] !== undefined) {
            acc[prop] = userData[prop];
          }
          return acc;
        }, {}),
        migrationVersion: '1.0'
      }
    };

    // Update user document
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, v2PremiumData);

    console.log(`✅ Successfully migrated V1 user ${userId} to V2 premium`);
    
    const result = {
      success: true,
      migrationData: v2PremiumData.v1Migration
    };

    return serializeFirebaseData(result);
  } catch (error) {
    console.error('Error migrating V1 user:', error);
    throw error;
  }
};

/**
 * Mark welcome message as shown for V1 user
 */
export const markV1WelcomeShown = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      'v1Migration.welcomeShown': true,
      'v1Migration.welcomeShownAt': new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking V1 welcome as shown:', error);
    throw error;
  }
};

/**
 * Get all V1 users that need migration (batch operation for admin)
 */
export const getAllV1UsersForMigration = async () => {
  try {
    const usersRef = collection(db, 'Users');
    const snapshot = await getDocs(usersRef);
    
    const v1Users = [];
    const alreadyMigrated = [];
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      
      if (isV1User(userData)) {
        if (isV1UserMigrated(userData)) {
          alreadyMigrated.push({
            id: userId,
            ...userData
          });
        } else {
          v1Users.push({
            id: userId,
            ...userData,
            v1Properties: getV1Properties(userData)
          });
        }
      }
    });

    const result = {
      v1Users,
      alreadyMigrated,
      totalV1Users: v1Users.length + alreadyMigrated.length,
      needsMigration: v1Users.length
    };

    return serializeFirebaseData(result);
  } catch (error) {
    console.error('Error getting V1 users for migration:', error);
    throw error;
  }
};

/**
 * Batch migrate all V1 users (admin function)
 */
export const batchMigrateV1Users = async () => {
  try {
    const { v1Users } = await getAllV1UsersForMigration();
    
    if (v1Users.length === 0) {
      return {
        success: true,
        message: 'No V1 users found that need migration',
        migrated: 0
      };
    }

    const batch = writeBatch(db);
    let migratedCount = 0;

    for (const user of v1Users) {
      try {
        const userRef = doc(db, 'Users', user.id);
        
        const v2PremiumData = {
          subscription: {
            status: 'active',
            type: 'v1_migration',
            isPremium: true,
            isLifetime: true,
            source: 'v1_migration',
            migratedAt: new Date(),
            customerId: null,
            subscriptionId: `v1_migration_${user.id}`,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(2099, 11, 31),
            cancelAtPeriodEnd: false,
            priceId: null,
            updatedAt: new Date()
          },
          v1Migration: {
            completed: true,
            migratedAt: new Date(),
            welcomeShown: false,
            originalProperties: V1_INDICATORS.reduce((acc, prop) => {
              if (user[prop] !== undefined) {
                acc[prop] = user[prop];
              }
              return acc;
            }, {}),
            migrationVersion: '1.0'
          }
        };

        batch.update(userRef, v2PremiumData);
        migratedCount++;
      } catch (error) {
        console.error(`Error preparing migration for user ${user.id}:`, error);
      }
    }

    await batch.commit();

    console.log(`✅ Successfully migrated ${migratedCount} V1 users to V2 premium`);
    
    const result = {
      success: true,
      message: `Successfully migrated ${migratedCount} V1 users`,
      migrated: migratedCount,
      total: v1Users.length
    };

    return serializeFirebaseData(result);
  } catch (error) {
    console.error('Error in batch migration:', error);
    throw error;
  }
}; 