/**
 * Error Logging Service
 * Handles application errors, logging to Firestore, and email notifications
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  where,
  getDocs,
  updateDoc,
  doc 
} from 'firebase/firestore';

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error types
export const ERROR_TYPES = {
  JAVASCRIPT: 'javascript',
  NETWORK: 'network',
  AUTH: 'authentication',
  FIREBASE: 'firebase',
  UI: 'ui_component',
  API: 'api_call',
  UNKNOWN: 'unknown'
};

/**
 * Get browser and device information
 */
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  const userAgent = window.navigator.userAgent;
  const language = window.navigator.language || window.navigator.userLanguage;
  const platform = window.navigator.platform;
  const cookieEnabled = window.navigator.cookieEnabled;
  const onLine = window.navigator.onLine;
  
  // Screen information
  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth
  };
  
  // Window information
  const windowInfo = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  };
  
  return {
    userAgent,
    language,
    platform,
    cookieEnabled,
    onLine,
    screen: screenInfo,
    window: windowInfo,
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get React component stack from error
 */
const getComponentStack = (error) => {
  if (!error) return null;
  
  // Extract component stack from React error
  if (error.componentStack) {
    return error.componentStack;
  }
  
  // Try to extract from stack trace
  if (error.stack) {
    const lines = error.stack.split('\n');
    const componentLines = lines.filter(line => 
      line.includes('at ') && 
      (line.includes('.jsx') || line.includes('.tsx') || line.includes('Component'))
    );
    return componentLines.join('\n');
  }
  
  return null;
};

/**
 * Determine error severity based on error details
 */
const determineErrorSeverity = (error, errorInfo) => {
  // Critical errors
  if (error.name === 'ChunkLoadError' || 
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk')) {
    return ERROR_SEVERITY.CRITICAL;
  }
  
  // Auth errors are usually high severity
  if (error.message.includes('auth') || 
      error.message.includes('permission') ||
      error.message.includes('unauthorized')) {
    return ERROR_SEVERITY.HIGH;
  }
  
  // Network errors
  if (error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('connection')) {
    return ERROR_SEVERITY.MEDIUM;
  }
  
  // Component errors
  if (errorInfo?.componentStack) {
    return ERROR_SEVERITY.MEDIUM;
  }
  
  // Default
  return ERROR_SEVERITY.LOW;
};

/**
 * Determine error type based on error details
 */
const determineErrorType = (error) => {
  if (error.message.includes('auth') || error.message.includes('permission')) {
    return ERROR_TYPES.AUTH;
  }
  
  if (error.message.includes('firebase') || error.message.includes('firestore')) {
    return ERROR_TYPES.FIREBASE;
  }
  
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return ERROR_TYPES.NETWORK;
  }
  
  if (error.message.includes('chunk') || error.message.includes('module')) {
    return ERROR_TYPES.JAVASCRIPT;
  }
  
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return ERROR_TYPES.JAVASCRIPT;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Log error to Firestore
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information (from React Error Boundary)
 * @param {Object} user - Current user information
 * @param {string} userMessage - Optional message from user
 * @param {string} context - Context where error occurred
 */
export const logErrorToFirestore = async (error, errorInfo = {}, user = null, userMessage = '', context = '') => {
  try {
    const browserInfo = getBrowserInfo();
    const componentStack = getComponentStack(error);
    const severity = determineErrorSeverity(error, errorInfo);
    const errorType = determineErrorType(error);
    
    const errorData = {
      // Error details
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack || '',
      componentStack,
      
      // Error classification
      severity,
      type: errorType,
      context: context || 'unknown',
      
      // User information
      userId: user?.id || null,
      userEmail: user?.email || null,
      userName: user?.firstName && user?.lastName ? 
        `${user.firstName} ${user.lastName}` : 
        user?.username || 'Unknown',
      userMessage: userMessage || '',
      
      // Technical information
      browserInfo,
      errorInfo: {
        componentStack: errorInfo.componentStack || '',
        errorBoundary: errorInfo.errorBoundary || ''
      },
      
      // Metadata
      timestamp: serverTimestamp(),
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
      notes: '',
      
      // App version (you can add this from package.json)
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.error('🚨 [ErrorLogging] Logging error to Firestore:', {
      message: error.message,
      severity,
      type: errorType,
      userId: user?.id
    });
    
    const docRef = await addDoc(collection(db, 'application_errors'), errorData);
    
    console.log('✅ [ErrorLogging] Error logged successfully with ID:', docRef.id);
    
    return {
      success: true,
      errorId: docRef.id,
      severity,
      type: errorType
    };
    
  } catch (loggingError) {
    console.error('❌ [ErrorLogging] Failed to log error to Firestore:', loggingError);
    
    // Fallback: log to console with all available information
    console.error('🔄 [ErrorLogging] Original error that failed to log:', {
      error: error.message,
      stack: error.stack,
      user: user?.email,
      context,
      userMessage
    });
    
    return {
      success: false,
      error: loggingError.message
    };
  }
};

/**
 * Send error report via email
 * @param {string} errorId - Firestore error document ID
 * @param {Object} errorData - Error data object
 * @param {string} userMessage - Message from user
 */
export const sendErrorEmail = async (errorId, errorData, userMessage = '') => {
  try {
    console.log('📧 [ErrorLogging] Sending error email...');
    
    const emailData = {
      type: 'error_report',
      errorId,
      errorData: {
        message: errorData.message,
        severity: errorData.severity,
        type: errorData.type,
        context: errorData.context,
        userId: errorData.userId,
        userEmail: errorData.userEmail,
        userName: errorData.userName,
        userMessage: userMessage,
        timestamp: new Date().toISOString(),
        appVersion: errorData.appVersion,
        environment: errorData.environment,
        browserInfo: {
          userAgent: errorData.browserInfo?.userAgent,
          url: errorData.browserInfo?.url,
          language: errorData.browserInfo?.language
        }
      }
    };
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });
    
    if (response.ok) {
      console.log('✅ [ErrorLogging] Error email sent successfully');
      return { success: true };
    } else {
      throw new Error(`Email API responded with status: ${response.status}`);
    }
    
  } catch (emailError) {
    console.error('❌ [ErrorLogging] Failed to send error email:', emailError);
    return { 
      success: false, 
      error: emailError.message 
    };
  }
};

/**
 * Get errors for admin dashboard
 * @param {number} limitCount - Number of errors to fetch
 * @param {string} severity - Filter by severity
 * @param {boolean} resolvedOnly - Get only resolved/unresolved errors
 */
export const getErrorsForAdmin = async (limitCount = 50, severity = null, resolvedOnly = null) => {
  try {
    let queryConstraints = [
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    ];
    
    if (severity) {
      queryConstraints.push(where('severity', '==', severity));
    }
    
    if (resolvedOnly !== null) {
      queryConstraints.push(where('resolved', '==', resolvedOnly));
    }
    
    const q = query(collection(db, 'application_errors'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const errors = [];
    querySnapshot.forEach((doc) => {
      errors.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      });
    });
    
    console.log(`📊 [ErrorLogging] Retrieved ${errors.length} errors for admin`);
    
    return { success: true, errors };
    
  } catch (error) {
    console.error('❌ [ErrorLogging] Failed to get errors for admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark error as resolved
 * @param {string} errorId - Error document ID
 * @param {string} resolvedBy - Admin user who resolved it
 * @param {string} notes - Resolution notes
 */
export const markErrorAsResolved = async (errorId, resolvedBy, notes = '') => {
  try {
    const errorRef = doc(db, 'application_errors', errorId);
    await updateDoc(errorRef, {
      resolved: true,
      resolvedAt: serverTimestamp(),
      resolvedBy,
      notes
    });
    
    console.log('✅ [ErrorLogging] Error marked as resolved:', errorId);
    return { success: true };
    
  } catch (error) {
    console.error('❌ [ErrorLogging] Failed to mark error as resolved:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear browser cache and storage
 */
export const clearBrowserCache = async () => {
  try {
    console.log('🧹 [ErrorLogging] Starting browser cache cleanup...');
    
    if (typeof window === 'undefined') {
      console.warn('⚠️ [ErrorLogging] Window not available, skipping cache clear');
      return { success: false, error: 'Window not available' };
    }
    
    // Clear different types of storage
    const clearPromises = [];
    
    // 1. Clear localStorage
    try {
      localStorage.clear();
      console.log('✅ [ErrorLogging] LocalStorage cleared');
    } catch (e) {
      console.warn('⚠️ [ErrorLogging] Failed to clear localStorage:', e);
    }
    
    // 2. Clear sessionStorage
    try {
      sessionStorage.clear();
      console.log('✅ [ErrorLogging] SessionStorage cleared');
    } catch (e) {
      console.warn('⚠️ [ErrorLogging] Failed to clear sessionStorage:', e);
    }
    
    // 3. Clear IndexedDB
    if (window.indexedDB) {
      try {
        // Get all databases and clear them
        if (window.indexedDB.databases) {
          const databases = await window.indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              const deleteRequest = window.indexedDB.deleteDatabase(db.name);
              clearPromises.push(new Promise((resolve) => {
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => resolve(); // Don't fail the whole process
              }));
            }
          }
        }
        console.log('✅ [ErrorLogging] IndexedDB clearing initiated');
      } catch (e) {
        console.warn('⚠️ [ErrorLogging] Failed to clear IndexedDB:', e);
      }
    }
    
    // 4. Clear Cache API
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const deleteCachePromises = cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        });
        clearPromises.push(...deleteCachePromises);
        console.log('✅ [ErrorLogging] Cache API clearing initiated');
      } catch (e) {
        console.warn('⚠️ [ErrorLogging] Failed to clear Cache API:', e);
      }
    }
    
    // 5. Clear Service Worker caches
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Send message to service worker to clear caches
          if (registration.active) {
            registration.active.postMessage({ type: 'CLEAR_CACHE' });
          }
        }
        console.log('✅ [ErrorLogging] Service Worker cache clear requested');
      } catch (e) {
        console.warn('⚠️ [ErrorLogging] Failed to clear Service Worker cache:', e);
      }
    }
    
    // Wait for all clear operations to complete
    await Promise.allSettled(clearPromises);
    
    console.log('🎉 [ErrorLogging] Browser cache cleanup completed');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ [ErrorLogging] Failed to clear browser cache:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get error statistics for admin dashboard
 */
export const getErrorStatistics = async () => {
  try {
    const errors = await getErrorsForAdmin(1000); // Get more for statistics
    
    if (!errors.success) {
      return errors;
    }
    
    const stats = {
      total: errors.errors.length,
      bySeverity: {},
      byType: {},
      byDay: {},
      resolved: 0,
      unresolved: 0
    };
    
    // Initialize counters
    Object.values(ERROR_SEVERITY).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });
    
    Object.values(ERROR_TYPES).forEach(type => {
      stats.byType[type] = 0;
    });
    
    // Process errors
    errors.errors.forEach(error => {
      // Count by severity
      if (error.severity) {
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      }
      
      // Count by type
      if (error.type) {
        stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      }
      
      // Count resolved/unresolved
      if (error.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
      
      // Count by day (last 30 days)
      if (error.timestamp) {
        const dateKey = error.timestamp.toISOString().split('T')[0];
        stats.byDay[dateKey] = (stats.byDay[dateKey] || 0) + 1;
      }
    });
    
    return { success: true, stats };
    
  } catch (error) {
    console.error('❌ [ErrorLogging] Failed to get error statistics:', error);
    return { success: false, error: error.message };
  }
};

export default {
  logErrorToFirestore,
  sendErrorEmail,
  getErrorsForAdmin,
  markErrorAsResolved,
  clearBrowserCache,
  getErrorStatistics,
  ERROR_SEVERITY,
  ERROR_TYPES
}; 