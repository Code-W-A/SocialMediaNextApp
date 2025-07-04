"use server";

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Default admin settings
const DEFAULT_SETTINGS = {
  compatibilityFilterEnabled: true, // Whether posts are filtered by compatibility
  lastUpdated: new Date(),
  updatedBy: 'system'
};

/**
 * Get current admin settings
 */
export const getAdminSettings = async () => {
  try {
    const settingsRef = doc(db, 'AdminSettings', 'globalSettings');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return {
        success: true,
        settings: {
          id: settingsDoc.id,
          ...settingsDoc.data()
        }
      };
    } else {
      // Create default settings if they don't exist
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      return {
        success: true,
        settings: {
          id: 'globalSettings',
          ...DEFAULT_SETTINGS
        }
      };
    }
  } catch (error) {
    console.error('Error getting admin settings:', error);
    return {
      success: false,
      error: error.message,
      settings: DEFAULT_SETTINGS
    };
  }
};

/**
 * Update admin settings
 */
export const updateAdminSettings = async (settingsUpdate, updatedBy = 'admin') => {
  try {
    const settingsRef = doc(db, 'AdminSettings', 'globalSettings');
    
    const updateData = {
      ...settingsUpdate,
      lastUpdated: new Date(),
      updatedBy: updatedBy
    };
    
    // Get current settings first
    const currentSettings = await getDoc(settingsRef);
    
    if (currentSettings.exists()) {
      // Update existing settings
      await updateDoc(settingsRef, updateData);
    } else {
      // Create new settings document
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        ...updateData
      });
    }
    
    console.log('✅ Admin settings updated successfully:', updateData);
    
    return {
      success: true,
      message: 'Settings updated successfully',
      settings: updateData
    };
  } catch (error) {
    console.error('❌ Error updating admin settings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Toggle compatibility filter
 */
export const toggleCompatibilityFilter = async (enabled, updatedBy = 'admin') => {
  try {
    console.log(`🔄 Toggling compatibility filter to: ${enabled}`);
    
    const result = await updateAdminSettings({ 
      compatibilityFilterEnabled: enabled 
    }, updatedBy);
    
    if (result.success) {
      console.log(`✅ Compatibility filter ${enabled ? 'enabled' : 'disabled'} successfully`);
      return {
        success: true,
        message: `Compatibility filter ${enabled ? 'enabled' : 'disabled'} successfully`,
        compatibilityFilterEnabled: enabled
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Error toggling compatibility filter:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get specific setting value
 */
export const getSettingValue = async (settingKey, defaultValue = null) => {
  try {
    const result = await getAdminSettings();
    if (result.success && result.settings[settingKey] !== undefined) {
      return result.settings[settingKey];
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${settingKey}:`, error);
    return defaultValue;
  }
};

/**
 * Check if compatibility filter is enabled
 */
export const isCompatibilityFilterEnabled = async () => {
  try {
    return await getSettingValue('compatibilityFilterEnabled', true); // Default to enabled
  } catch (error) {
    console.error('Error checking compatibility filter status:', error);
    return true; // Default to enabled on error
  }
};

/**
 * Initialize admin settings (call this once)
 */
export const initializeAdminSettings = async () => {
  try {
    const settingsRef = doc(db, 'AdminSettings', 'globalSettings');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        createdAt: new Date(),
        initialized: true
      });
      
      console.log('✅ Admin settings initialized with defaults');
      return {
        success: true,
        message: 'Admin settings initialized successfully'
      };
    } else {
      console.log('ℹ️ Admin settings already exist');
      return {
        success: true,
        message: 'Admin settings already initialized'
      };
    }
  } catch (error) {
    console.error('❌ Error initializing admin settings:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 