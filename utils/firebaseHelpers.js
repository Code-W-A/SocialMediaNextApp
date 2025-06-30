import { toSerializableDate } from './dateHelpers';

/**
 * Convert Firebase Timestamp objects to serializable ISO strings
 * This is needed because Firebase Timestamps cannot be passed directly to Client Components
 */
export const convertFirebaseTimestamps = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertFirebaseTimestamps(item));
  }

  // Handle Firebase Timestamp objects
  if (obj.seconds !== undefined && obj.nanoseconds !== undefined) {
    // Convert directly to ISO string instead of Date object
    return toSerializableDate(new Date(obj.seconds * 1000 + obj.nanoseconds / 1000000));
  }

  // Handle regular objects recursively
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = convertFirebaseTimestamps(value);
  }

  return converted;
};

/**
 * Serialize Firebase data for Client Components
 * Converts Timestamps and other Firebase objects to serializable values
 */
export const serializeFirebaseData = (data) => {
  if (!data) return data;
  
  try {
    // Convert timestamps to ISO strings
    const converted = convertFirebaseTimestamps(data);
    
    // Return the converted data
    return converted;
  } catch (error) {
    console.error('Error serializing Firebase data:', error);
    return data;
  }
};

/**
 * Convert Date objects to ISO strings for Client Components
 * Use this when you need to pass dates through Server Components to Client Components
 */
export const serializeDates = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  const serialized = {};
  for (const [key, value] of Object.entries(obj)) {
    serialized[key] = serializeDates(value);
  }

  return serialized;
}; 