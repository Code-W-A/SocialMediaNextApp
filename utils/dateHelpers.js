/**
 * Date utility functions to handle serialization between Server and Client Components
 * This prevents "Objects with toJSON methods are not supported" errors in Next.js
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Converts a Date object, Firebase timestamp, or ISO string to a serializable ISO string
 * @param {Date|Object|string|null} dateValue - The date value to convert
 * @returns {string|null} - ISO string or null
 */
export const toSerializableDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a string (ISO), return it
  if (typeof dateValue === 'string') return dateValue;
  
  // If it's a Firebase timestamp with toDate method
  if (dateValue.toDate && typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toISOString();
  }
  
  // If it's a Date object
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  // Try to create a Date from the value
  try {
    return new Date(dateValue).toISOString();
  } catch (error) {
    console.warn('Failed to convert date value:', dateValue, error);
    return null;
  }
};

/**
 * Converts an ISO string back to a Date object for use in client components
 * @param {string|null} isoString - The ISO string to convert
 * @returns {Date|null} - Date object or null
 */
export const fromSerializableDate = (isoString) => {
  if (!isoString || typeof isoString !== 'string') return null;
  
  try {
    return new Date(isoString);
  } catch (error) {
    console.warn('Failed to parse ISO date string:', isoString, error);
    return null;
  }
};

/**
 * Serializes an object by converting all Date properties to ISO strings
 * @param {Object} obj - The object to serialize
 * @param {string[]} dateFields - Array of field names that contain dates
 * @returns {Object} - Object with serialized dates
 */
export const serializeDates = (obj, dateFields = ['createdAt', 'updatedAt', 'editedAt']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const serialized = { ...obj };
  
  dateFields.forEach(field => {
    if (serialized[field]) {
      serialized[field] = toSerializableDate(serialized[field]);
    }
  });
  
  return serialized;
};

/**
 * Deserializes an object by converting ISO string properties back to Date objects
 * @param {Object} obj - The object to deserialize
 * @param {string[]} dateFields - Array of field names that contain ISO strings
 * @returns {Object} - Object with Date objects
 */
export const deserializeDates = (obj, dateFields = ['createdAt', 'updatedAt', 'editedAt']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const deserialized = { ...obj };
  
  dateFields.forEach(field => {
    if (deserialized[field]) {
      deserialized[field] = fromSerializableDate(deserialized[field]);
    }
  });
  
  return deserialized;
};

/**
 * Current timestamp as ISO string (for consistent serialization)
 * @returns {string} - Current timestamp as ISO string
 */
export const now = () => new Date().toISOString();

/**
 * Format a date (ISO string, Date object, or Firebase timestamp) for display
 * @param {string|Date|Object} dateValue - The date to format
 * @param {string} format - The format string (dayjs format)
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateValue, format = 'DD MMM YYYY') => {
  if (!dateValue) return '';
  
  try {
    // Handle Firebase timestamps
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dayjs(dateValue.toDate()).format(format);
    }
    
    // Handle ISO strings and Date objects
    return dayjs(dateValue).format(format);
  } catch (error) {
    console.warn('Failed to format date:', dateValue, error);
    return '';
  }
};

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param {string|Date|Object} dateValue - The date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    // Handle Firebase timestamps
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dayjs(dateValue.toDate()).fromNow();
    }
    
    // Handle ISO strings and Date objects
    return dayjs(dateValue).fromNow();
  } catch (error) {
    console.warn('Failed to format relative time:', dateValue, error);
    return '';
  }
};

/**
 * Format time only (HH:mm)
 * @param {string|Date|Object} dateValue - The date to format
 * @returns {string} - Time string
 */
export const formatTime = (dateValue) => {
  return formatDate(dateValue, 'HH:mm');
};

/**
 * Format for chat/message timestamps
 * @param {string|Date|Object} dateValue - The date to format
 * @returns {string} - Formatted time string
 */
export const formatChatTime = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    // Handle Firebase timestamps
    let date;
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      date = dayjs(dateValue.toDate());
    } else {
      date = dayjs(dateValue);
    }
    
    const now = dayjs();
    
    if (now.diff(date, 'day') < 1) {
      return date.format('HH:mm');
    } else if (now.diff(date, 'day') < 7) {
      return date.format('ddd');
    } else {
      return date.format('DD/MM');
    }
  } catch (error) {
    console.warn('Failed to format chat time:', dateValue, error);
    return '';
  }
};

/**
 * Check if two dates are on the same day
 * @param {string|Date|Object} date1 - First date
 * @param {string|Date|Object} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  try {
    // Handle Firebase timestamps
    const d1 = date1.toDate ? dayjs(date1.toDate()) : dayjs(date1);
    const d2 = date2.toDate ? dayjs(date2.toDate()) : dayjs(date2);
    
    return d1.isSame(d2, 'day');
  } catch (error) {
    console.warn('Failed to compare dates:', date1, date2, error);
    return false;
  }
}; 