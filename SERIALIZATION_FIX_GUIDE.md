# Date Serialization Fix Guide

## Problem Description

The error "Only plain objects can be passed to Client Components from Server Components. Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props." was occurring because:

1. **Date Objects**: JavaScript Date objects have a `toJSON()` method and cannot be directly passed from Server Components to Client Components in Next.js
2. **Firebase Timestamps**: Firebase Firestore timestamps also have serialization methods that cause issues
3. **Optimistic Updates**: Client-side optimistic updates were creating Date objects that couldn't be serialized

## Changes Made

### 1. Updated Server Actions (`actions/post.js`)

- **Before**: Used `createdAt: commentData.createdAt?.toDate() || new Date()`
- **After**: Used `createdAt: toSerializableDate(commentData.createdAt)`

This converts all dates to ISO strings before passing them to client components.

### 2. Updated Client Components

**PostGenerator.jsx**, **CommentInput.jsx**, **LikeButton.jsx**, **ConversationsList.jsx**:
- **Before**: Used `createdAt: new Date()`
- **After**: Used `createdAt: now()` (returns ISO string)

### 3. Created Date Utility Functions (`utils/dateHelpers.js`)

New utility functions for consistent date handling:

```javascript
// Convert any date type to ISO string for serialization
toSerializableDate(dateValue)

// Convert ISO string back to Date object
fromSerializableDate(isoString)

// Current timestamp as ISO string
now()

// Format dates for display
formatDate(dateValue, format)
formatRelativeTime(dateValue)
formatTime(dateValue)
formatChatTime(dateValue)

// Compare dates
isSameDay(date1, date2)
```

### 4. Updated Firebase Serialization (`utils/firebaseHelpers.js`)

The core `serializeFirebaseData` function was updated to convert Firebase timestamps directly to ISO strings instead of Date objects:

```javascript
// Before (created Date objects - not serializable)
if (obj.seconds !== undefined && obj.nanoseconds !== undefined) {
  return new Date(obj.seconds * 1000 + obj.nanoseconds / 1000000);
}

// After (creates ISO strings - fully serializable)
if (obj.seconds !== undefined && obj.nanoseconds !== undefined) {
  return toSerializableDate(new Date(obj.seconds * 1000 + obj.nanoseconds / 1000000));
}
```

### 5. Fixed Hooks and State Management

Updated `useDailyUsageTracking` and `useOnlineStatus` hooks to use proper serialization methods instead of creating Date objects.

## Best Practices for Future Development

### ✅ DO - Server Components

```javascript
// In server actions or server components
export const getPosts = async () => {
  const posts = await fetchPosts();
  
  return posts.map(post => ({
    ...post,
    createdAt: toSerializableDate(post.createdAt),
    updatedAt: toSerializableDate(post.updatedAt)
  }));
};
```

### ❌ DON'T - Server Components

```javascript
// This will cause serialization errors
export const getPosts = async () => {
  const posts = await fetchPosts();
  
  return posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toDate(), // Returns Date object
    updatedAt: new Date() // Date object
  }));
};
```

### ✅ DO - Client Components

```javascript
// In client components for optimistic updates
const optimisticPost = {
  id: `temp-${Date.now()}`,
  content: 'Hello world',
  createdAt: now(), // Returns ISO string
  author: user
};
```

### ❌ DON'T - Client Components

```javascript
// This creates Date objects that can't be serialized
const optimisticPost = {
  id: `temp-${Date.now()}`,
  content: 'Hello world',
  createdAt: new Date(), // Date object
  author: user
};
```

### ✅ DO - Displaying Dates

```javascript
// Use the utility functions for consistent formatting
import { formatDate, formatRelativeTime } from '@/utils/dateHelpers';

// In your component
<span>{formatDate(post.createdAt)}</span>
<span>{formatRelativeTime(post.createdAt)}</span>
```

### ❌ DON'T - Displaying Dates

```javascript
// Don't assume date format - ISO strings work with dayjs/moment
<span>{new Date(post.createdAt).toLocaleDateString()}</span>
```

## Common Scenarios

### 1. Firestore Queries

```javascript
// Server action
export const getPosts = async () => {
  const snapshot = await getDocs(collection(db, 'posts'));
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: toSerializableDate(data.createdAt), // Convert Firebase timestamp
      updatedAt: toSerializableDate(data.updatedAt)
    };
  });
};
```

### 2. Optimistic Updates

```javascript
// Client component
const optimisticComment = {
  id: `temp-${Date.now()}`,
  text: commentText,
  createdAt: now(), // Use ISO string
  author: currentUser
};
```

### 3. Real-time Updates

```javascript
// When receiving real-time data from Firebase
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toSerializableDate(data.createdAt),
        updatedAt: toSerializableDate(data.updatedAt)
      };
    });
    setPosts(posts);
  });
  
  return unsubscribe;
}, []);
```

## Key Points to Remember

1. **Always use ISO strings** when passing dates between server and client components
2. **Use the utility functions** from `dateHelpers.js` for consistent date handling
3. **dayjs can handle ISO strings directly** - no need to convert back to Date objects for formatting
4. **Test optimistic updates** to ensure they don't create Date objects
5. **Use `now()` instead of `new Date()`** for consistent timestamp creation

## File Changes Summary

**Core Actions & Data**
- ✅ `actions/post.js` - Updated to return ISO strings, use toSerializableDate()
- ✅ `actions/user.js` - Fixed presence functions, user serialization, added serverTimestamp()
- ✅ `actions/subscription.js` - Fixed subscription updates to use serverTimestamp()
- ✅ `actions/v1Migration.js` - Fixed migration functions to use serverTimestamp()

**Components & UI**
- ✅ `components/Post/PostGenerator.jsx` - Fixed optimistic updates
- ✅ `components/Post/CommentInput.jsx` - Fixed optimistic updates
- ✅ `components/Post/LikeButton.jsx` - Fixed optimistic updates
- ✅ `components/Messages/ConversationsList.jsx` - Fixed date creation

**Utilities & Helpers**
- ✅ `utils/dateHelpers.js` - Created comprehensive date utilities
- ✅ `utils/firebaseHelpers.js` - Updated to use toSerializableDate() instead of Date objects

**Hooks & State Management**
- ✅ `hooks/useOnlineStatus.js` - Fixed import for updateUserActivity
- ✅ `hooks/useDailyUsageTracking.js` - Fixed all Date objects, use serverTimestamp() and now()

## Testing

After these changes, you should no longer see the serialization error. All dates are now properly converted to ISO strings before being passed between components, and the application will handle date formatting consistently across all components. 