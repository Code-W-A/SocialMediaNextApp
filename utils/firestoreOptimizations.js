// Centralized Firestore optimizations utilities
import { getUser } from "@/actions/user";

// Global cache for user data to reduce repeated getUser calls
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for general data with configurable TTL
const generalCache = new Map();

/**
 * Optimized getUser with caching
 * @param {string} userId - User ID to fetch
 * @param {boolean} forceRefresh - Force refresh from Firestore
 * @returns {Promise<Object>} User data
 */
export const getCachedUser = async (userId, forceRefresh = false) => {
  const now = Date.now();
  const cached = userCache.get(userId);
  
  if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const userData = await getUser(userId);
    userCache.set(userId, {
      data: userData,
      timestamp: now
    });
    return userData;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { data: { id: userId, firstName: 'Unknown', lastName: 'User' } };
  }
};

/**
 * Batch get multiple users to reduce individual calls
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<Object>} Map of userId -> userData
 */
export const batchGetUsers = async (userIds) => {
  const uniqueUserIds = [...new Set(userIds)];
  const userPromises = uniqueUserIds.map(userId => getCachedUser(userId));
  const users = await Promise.all(userPromises);
  
  const userMap = {};
  uniqueUserIds.forEach((userId, index) => {
    userMap[userId] = users[index];
  });
  
  return userMap;
};

/**
 * Generic cache utility with configurable TTL
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export const setCacheData = (key, data, ttl = 5 * 60 * 1000) => {
  generalCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {*} Cached data or null if expired/not found
 */
export const getCacheData = (key) => {
  const cached = generalCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if ((now - cached.timestamp) >= cached.ttl) {
    generalCache.delete(key);
    return null;
  }
  
  return cached.data;
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCacheData = (key) => {
  generalCache.delete(key);
};

/**
 * Clear all cache data
 */
export const clearAllCache = () => {
  userCache.clear();
  generalCache.clear();
};

/**
 * Clear expired cache entries
 */
export const cleanupExpiredCache = () => {
  const now = Date.now();
  
  // Cleanup user cache
  for (const [key, value] of userCache.entries()) {
    if ((now - value.timestamp) >= CACHE_DURATION) {
      userCache.delete(key);
    }
  }
  
  // Cleanup general cache
  for (const [key, value] of generalCache.entries()) {
    if ((now - value.timestamp) >= value.ttl) {
      generalCache.delete(key);
    }
  }
};

/**
 * Debounce utility for function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Throttle utility for function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Batch operation utility for Firestore writes
 * @param {Array} operations - Array of operations to batch
 * @param {number} batchSize - Maximum batch size (default: 500)
 * @returns {Promise<Array>} Results of batch operations
 */
export const batchOperations = async (operations, batchSize = 500) => {
  const results = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchPromises = batch.map(operation => operation());
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Rate limiter for API calls
 * @param {Function} func - Function to rate limit
 * @param {number} maxCalls - Maximum calls per time window
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {Function} Rate limited function
 */
export const rateLimit = (func, maxCalls, timeWindow) => {
  const calls = [];
  
  return (...args) => {
    const now = Date.now();
    
    // Remove old calls outside the time window
    while (calls.length > 0 && calls[0] <= now - timeWindow) {
      calls.shift();
    }
    
    // Check if we can make the call
    if (calls.length < maxCalls) {
      calls.push(now);
      return func.apply(this, args);
    } else {
      throw new Error(`Rate limit exceeded: ${maxCalls} calls per ${timeWindow}ms`);
    }
  };
};

/**
 * Optimized pagination utility
 * @param {Object} config - Pagination configuration
 * @param {Function} config.queryFunc - Function that returns a Firestore query
 * @param {number} config.pageSize - Number of items per page
 * @param {string} config.orderByField - Field to order by
 * @param {string} config.orderDirection - Order direction ('asc' or 'desc')
 * @returns {Object} Pagination utilities
 */
export const createPagination = (config) => {
  const { queryFunc, pageSize = 10, orderByField = 'createdAt', orderDirection = 'desc' } = config;
  let lastCursor = null;
  let hasMore = true;
  
  return {
    async getNextPage() {
      if (!hasMore) return { data: [], hasMore: false };
      
      const query = queryFunc(lastCursor, pageSize, orderByField, orderDirection);
      const snapshot = await query;
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      hasMore = data.length === pageSize;
      lastCursor = data.length > 0 ? data[data.length - 1].id : null;
      
      return { data, hasMore };
    },
    
    reset() {
      lastCursor = null;
      hasMore = true;
    },
    
    get hasMore() {
      return hasMore;
    }
  };
};

/**
 * Memory usage monitor for cache management
 */
export const getCacheStats = () => {
  return {
    userCacheSize: userCache.size,
    generalCacheSize: generalCache.size,
    totalEntries: userCache.size + generalCache.size,
    userCacheEntries: Array.from(userCache.keys()),
    generalCacheEntries: Array.from(generalCache.keys())
  };
};

// Auto cleanup expired cache every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
} 