"use server";

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  or,
  and,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Removed getMyCompatibleUsers import - compatibility filter removed
import { getUser } from "./user";
import { toSerializableDate } from "@/utils/dateHelpers";
import { serializeFirebaseData } from "@/utils/firebaseHelpers";

// Cache for user data to reduce repeated getUser calls
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Optimized getUser with caching
const getCachedUser = async (userId) => {
  const now = Date.now();
  const cached = userCache.get(userId);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    console.log(`🔍 getCachedUser: Fetching user ${userId} from getUser...`);
    const userData = await getUser(userId);
    console.log(`✅ getCachedUser: Successfully got user ${userId}:`, {
      hasData: !!userData?.data,
      userId: userData?.data?.id,
      firstName: userData?.data?.firstName,
      lastName: userData?.data?.lastName,
      first_name: userData?.data?.first_name,
      last_name: userData?.data?.last_name,
      username: userData?.data?.username,
      isIncomplete: userData?.data?.isIncomplete
    });
    userCache.set(userId, {
      data: userData,
      timestamp: now
    });
    return userData;
  } catch (error) {
    console.error(`❌ getCachedUser: Error fetching user ${userId}:`, error);
    return { data: { id: userId, firstName: 'Unknown', lastName: 'User' } };
  }
};

// Optimized batch get users with caching
const batchGetUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) return {};
  
  const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates
  const userMap = {};
  const uncachedUserIds = [];
  
  // Check cache first
  uniqueUserIds.forEach(userId => {
    const cached = userCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      userMap[userId] = cached.data;
    } else {
      uncachedUserIds.push(userId);
    }
  });
  
  // If all users are cached, return immediately
  if (uncachedUserIds.length === 0) {
    console.log("All users found in cache");
    return userMap;
  }
  
  console.log(`Fetching ${uncachedUserIds.length} users from Firestore`, {
    requestedUserIds: uncachedUserIds,
    cachedUserIds: uniqueUserIds.filter(id => userMap[id])
  });
  
  try {
    // Firestore 'in' query has a limit of 10 items
    const chunks = [];
    for (let i = 0; i < uncachedUserIds.length; i += 10) {
      chunks.push(uncachedUserIds.slice(i, i + 10));
    }
    
    // Fetch all chunks in parallel
    const promises = chunks.map(chunk => 
      getDocs(query(
        collection(db, "Users"),
        where("__name__", "in", chunk)
      ))
    );
    
    const snapshots = await Promise.all(promises);
    
    // Process all results
    snapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        // Serialize the Firebase data before storing/returning
        const rawUserData = doc.data();
        const serializedUserData = serializeFirebaseData(rawUserData);
        
        const userData = {
          data: {
            id: doc.id,
            ...serializedUserData
          }
        };
        
        // Update cache
        userCache.set(doc.id, {
          data: userData,
          timestamp: Date.now()
        });
        
        userMap[doc.id] = userData;
      });
    });
    
    // For any users not found, try individual fetch then create placeholder
    for (const userId of uncachedUserIds) {
      if (!userMap[userId]) {
        console.log(`⚠️ User ${userId} not found in batch query, trying individual fetch...`);
        try {
          // Try individual fetch as fallback
          const individualUserData = await getCachedUser(userId);
          if (individualUserData?.data) {
            userMap[userId] = individualUserData;
            console.log(`✅ User ${userId} found via individual fetch`);
          } else {
            console.log(`❌ User ${userId} not found even with individual fetch, using placeholder`);
            const placeholderData = {
              data: {
                id: userId,
                firstName: 'Unknown',
                lastName: 'User',
                first_name: 'Unknown',
                last_name: 'User', 
                username: 'unknown'
              }
            };
            userMap[userId] = placeholderData;
          }
        } catch (error) {
          console.error(`❌ Error fetching user ${userId} individually:`, error);
          const placeholderData = {
            data: {
              id: userId,
              firstName: 'Unknown',
              lastName: 'User',
              first_name: 'Unknown',
              last_name: 'User',
              username: 'unknown'
            }
          };
          userMap[userId] = placeholderData;
        }
      }
    }
    
  } catch (error) {
    console.error("Error batch fetching users:", error);
    
    // Try individual fetches for all uncached users on batch error
    for (const userId of uncachedUserIds) {
      if (!userMap[userId]) {
        try {
          console.log(`🔄 Batch failed, trying individual fetch for user ${userId}...`);
          const individualUserData = await getCachedUser(userId);
          if (individualUserData?.data) {
            userMap[userId] = individualUserData;
            console.log(`✅ User ${userId} recovered via individual fetch after batch error`);
          } else {
            userMap[userId] = {
              data: {
                id: userId,
                firstName: 'Unknown',
                lastName: 'User',
                first_name: 'Unknown',
                last_name: 'User',
                username: 'unknown'
              }
            };
          }
        } catch (individualError) {
          console.error(`❌ Individual fetch also failed for user ${userId}:`, individualError);
          userMap[userId] = {
            data: {
              id: userId,
              firstName: 'Unknown',
              lastName: 'User',
              first_name: 'Unknown',
              last_name: 'User',
              username: 'unknown'
            }
          };
        }
      }
    }
  }
  
  return userMap;
};

// Create a new post
export const createPost = async (post) => {
  const { postText, media, authorId } = post;
  console.log("🔥 createPost called:", { 
    postText: postText?.substring(0, 50) + "...", 
    hasMedia: !!media, 
    authorId 
  });
  
  try {
    if (!authorId) {
      console.error("❌ Author ID is required");
      throw new Error("Author ID is required");
    }

    if (!postText?.trim() && !media) {
      console.error("❌ Post must have either text or media");
      throw new Error("Post must have either text or media");
    }

    console.log("👤 Getting author data...");
    // Get author data with caching
    const authorData = await getCachedUser(authorId);
    console.log("👤 Author data retrieved:", {
      hasData: !!authorData?.data,
      authorId: authorData?.data?.id,
      authorName: `${authorData?.data?.firstName || ''} ${authorData?.data?.lastName || ''}`.trim()
    });
    
    if (!authorData?.data) {
      console.error("❌ Author not found for ID:", authorId);
      throw new Error("Author not found");
    }

    let mediaUrl = null;
    let mediaFileName = null;

    // Upload media if provided
    if (media) {
      console.log("📷 Uploading media for post...", { mediaType: typeof media, mediaLength: media?.length });
      try {
        // Convert base64 to file if needed
        if (typeof media === 'string' && media.startsWith('data:')) {
          const base64Data = media.split(',')[1];
          const mimeType = media.split(',')[0].split(':')[1].split(';')[0];
          const fileExtension = mimeType.split('/')[1];
          
          console.log("📊 Media details:", { mimeType, fileExtension });
          
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer], { type: mimeType });
          
          // Create unique filename
          const timestamp = Date.now();
          const fileName = `post_${timestamp}.${fileExtension}`;
          const filePath = `posts/${authorId}/${fileName}`;
          
          console.log("☁️ Uploading to Firebase Storage:", { fileName, filePath });
          
          // Upload to Firebase Storage
          const storage = getStorage();
          const storageRef = ref(storage, filePath);
          const snapshot = await uploadBytes(storageRef, blob);
          mediaUrl = await getDownloadURL(snapshot.ref);
          mediaFileName = fileName;
          
          console.log("✅ Media uploaded successfully:", { mediaUrl, mediaFileName });
        }
      } catch (uploadError) {
        console.error("❌ Error uploading media:", uploadError);
        console.log("⚠️ Continuing without media...");
        // Continue without media if upload fails
      }
    }

    console.log("📝 Creating post document...");
    // Create post document
    const newPost = {
      postText: postText?.trim() || '',
      media: mediaUrl,
      mediaFileName,
      authorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      edited: false,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      isVisible: true
    };

    console.log("💾 Saving post to Firestore...");
    const docRef = await addDoc(collection(db, "Posts"), newPost);
    console.log("✅ Post document created with ID:", docRef.id);

    // Return serialized data to avoid Firebase timestamp issues
    const serializedPost = {
      id: docRef.id,
      postText: postText?.trim() || '',
      media: mediaUrl,
      mediaFileName,
      authorId,
      createdAt: toSerializableDate(new Date()), // Use current date as ISO string
      updatedAt: toSerializableDate(new Date()), // Use current date as ISO string
      edited: false,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      isVisible: true,
      author: authorData.data // This is already serialized from getCachedUser
    };

    console.log("🎯 Returning serialized post:", {
      id: serializedPost.id,
      hasText: !!serializedPost.postText,
      hasMedia: !!serializedPost.media,
      authorId: serializedPost.authorId
    });

    return {
      success: true,
      post: serializedPost
    };
  } catch (error) {
    console.error("❌ Error creating post:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to create post: ${error.message}`);
  }
};

// Simple feed showing all public posts with progressive loading
export const getMyPostsFeed = async (userId, lastCursor = null, limitCount = 3) => {
  console.log("🔥 getMyPostsFeed called:", { userId, lastCursor, limitCount });
  
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("🌍 Getting all public posts with progressive loading");

    // Build query for all public posts with pagination
    const postsRef = collection(db, "Posts");
    let lastDocSnapshot = null;

    // If we have a cursor, get the document snapshot for proper pagination
    if (lastCursor) {
      try {
        const lastDocRef = doc(db, "Posts", lastCursor);
        lastDocSnapshot = await getDoc(lastDocRef);
        if (!lastDocSnapshot.exists()) {
          console.warn("⚠️ Last cursor document not found, starting from beginning");
          lastDocSnapshot = null;
        }
      } catch (error) {
        console.error("Error getting last document:", error);
        lastDocSnapshot = null;
      }
    }

    // Simple query for all public posts
    console.log("📄 Querying all public posts with limit:", limitCount);
    const postsQuery = query(
      postsRef,
      where("isVisible", "!=", false),
      orderBy("createdAt", "desc"),
      ...(lastDocSnapshot ? [startAfter(lastDocSnapshot)] : []),
      limit(limitCount)
    );

    const snapshot = await getDocs(postsQuery);
    console.log("📄 Raw posts retrieved:", snapshot.docs.length);

    // All posts from query are already filtered for visibility and limited
    const relevantDocs = snapshot.docs;
    console.log("✅ Posts ready for display:", relevantDocs.length);

    if (relevantDocs.length === 0) {
      return {
        data: [],
        metaData: {
          hasNextPage: false,
          lastCursor: null
        }
      };
    }

    // Batch collect all user IDs from posts and comments
    const allUserIds = new Set();
    const postCommentPromises = [];
    const postLikePromises = [];

    // Pre-process posts to collect user IDs and prepare comment + like queries
    relevantDocs.forEach(docSnap => {
      const postData = docSnap.data();
      allUserIds.add(postData.authorId);
      
      // Prepare comment query for this post
      postCommentPromises.push(
        getDocs(query(
          collection(db, "Posts", docSnap.id, "Comments"),
          orderBy("createdAt", "asc"),
          limit(5) // Limit comments per post to reduce reads
        )).then(commentsSnapshot => ({
          postId: docSnap.id,
          comments: commentsSnapshot.docs
        }))
      );

      // Prepare like query for this post - THIS WAS MISSING!
      postLikePromises.push(
        getDocs(collection(db, "Posts", docSnap.id, "Likes")).then(likesSnapshot => ({
          postId: docSnap.id,
          likes: likesSnapshot.docs
        }))
      );
    });

    // Execute all comment AND like queries in parallel
    const [allCommentsResults, allLikesResults] = await Promise.all([
      Promise.all(postCommentPromises),
      Promise.all(postLikePromises)
    ]);

    console.log("👍 Likes data loaded:", {
      postsWithLikes: allLikesResults.length,
      totalLikes: allLikesResults.reduce((sum, result) => sum + result.likes.length, 0)
    });

    // Collect author IDs from comments and likes
    allCommentsResults.forEach(({ comments }) => {
      comments.forEach(commentDoc => {
        const commentData = commentDoc.data();
        allUserIds.add(commentData.authorId);
      });
    });

    allLikesResults.forEach(({ likes }) => {
      likes.forEach(likeDoc => {
        const likeData = likeDoc.data();
        allUserIds.add(likeData.authorId);
      });
    });

    // Batch fetch all unique users
    console.log("👥 Fetching user data for", allUserIds.size, "unique users");
    const userMap = await batchGetUsers(Array.from(allUserIds));

    // Process each post with its comments and likes and return them
    const postsWithDetails = allCommentsResults.map(({ postId, comments }) => {
      const docSnap = relevantDocs.find(doc => doc.id === postId);
      const postData = docSnap.data();
      
      const processedComments = comments.map(commentDoc => {
        const commentData = commentDoc.data();
        const authorData = userMap[commentData.authorId];
        
        console.log("📝 getMyPostsFeed - Processing comment:", {
          commentId: commentDoc.id,
          postId: docSnap.id,
          authorId: commentData.authorId,
          hasAuthorData: !!authorData?.data,
          authorFields: authorData?.data ? {
            firstName: authorData.data.firstName,
            lastName: authorData.data.lastName,
            first_name: authorData.data.first_name,
            last_name: authorData.data.last_name,
            username: authorData.data.username
          } : 'NO_AUTHOR_DATA',
          fallbackAuthor: !authorData?.data ? { firstName: "Unknown", lastName: "User" } : null
        });
        
        return {
          id: commentDoc.id,
          comment: commentData.comment,
          authorId: commentData.authorId,
          createdAt: toSerializableDate(commentData.createdAt),
          updatedAt: toSerializableDate(commentData.updatedAt),
          author: authorData?.data || { 
            id: commentData.authorId,
            firstName: "Unknown", 
            lastName: "User",
            first_name: "Unknown",
            last_name: "User",
            username: "unknown"
          }
        };
      });

      // Get likes for this post
      const likesResult = allLikesResults.find(result => result.postId === postId);
      const processedLikes = [];
      if (likesResult) {
        likesResult.likes.forEach(likeDoc => {
          const likeData = likeDoc.data();
          processedLikes.push({
            id: likeDoc.id,
            authorId: likeData.authorId,
            postId: likeData.postId,
            createdAt: toSerializableDate(likeData.createdAt),
            author: userMap[likeData.authorId]?.data || { 
              id: likeData.authorId,
              firstName: "Unknown", 
              lastName: "User",
              first_name: "Unknown",
              last_name: "User",
              username: "unknown"
            }
          });
        });
      }

      console.log("📝 Processing post:", {
        id: docSnap.id,
        authorId: postData.authorId,
        hasText: !!postData.postText,
        hasMedia: !!postData.media,
        createdAtType: typeof postData.createdAt,
        createdAtValue: postData.createdAt,
        likesCount: processedLikes.length,
        commentsCount: processedComments.length
      });

      return {
        id: docSnap.id,
        postText: postData.postText || '',
        media: postData.media,
        mediaFileName: postData.mediaFileName,
        authorId: postData.authorId,
        createdAt: toSerializableDate(postData.createdAt),
        updatedAt: toSerializableDate(postData.updatedAt),
        edited: postData.edited || false,
        likes: processedLikes, // NOW PROPERLY LOADED FROM SUBCOLLECTION!
        likesCount: processedLikes.length, // REAL COUNT FROM SUBCOLLECTION!
        commentsCount: processedComments.length,
        isVisible: postData.isVisible !== false,
        author: userMap[postData.authorId]?.data || { 
          id: postData.authorId,
          firstName: "Unknown", 
          lastName: "User",
          first_name: "Unknown",
          last_name: "User",
          username: "unknown"
        },
        comments: processedComments
      };
    });

    console.log("🎯 Returning posts with details:", {
      count: postsWithDetails.length,
      hasNextPage: relevantDocs.length === limitCount,
      lastCursor: relevantDocs.length > 0 ? relevantDocs[relevantDocs.length - 1].id : null
    });

    return {
      data: postsWithDetails,
      metaData: {
        hasNextPage: relevantDocs.length === limitCount,
        lastCursor: relevantDocs.length > 0 ? relevantDocs[relevantDocs.length - 1].id : null
      }
    };
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw new Error("Failed to fetch feed posts");
  }
};

// Optimized getPosts with caching and batch operations
export const getPosts = async (lastCursor = null, userId, limitCount = 10) => {
  console.log("🔥 getPosts called:", { lastCursor, userId, limitCount });
  
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const postsRef = collection(db, "Posts");
    let postsQuery;
    let postsSnapshot;
    let lastDocSnapshot = null;

    // If we have a cursor, get the document snapshot for proper pagination
    if (lastCursor) {
      try {
        const lastDocRef = doc(db, "Posts", lastCursor);
        lastDocSnapshot = await getDoc(lastDocRef);
        if (!lastDocSnapshot.exists()) {
          console.warn("⚠️ Last cursor document not found, starting from beginning");
          lastDocSnapshot = null;
        }
      } catch (error) {
        console.error("Error getting last document:", error);
        lastDocSnapshot = null;
      }
    }

    try {
      // Try optimized query first
      postsQuery = query(
        postsRef,
        where("authorId", "==", userId),
        where("isVisible", "!=", false),
        orderBy("createdAt", "desc"),
        ...(lastDocSnapshot ? [startAfter(lastDocSnapshot)] : []),
        limit(limitCount)
      );
      
      postsSnapshot = await getDocs(postsQuery);
      console.log("📄 Direct query got:", postsSnapshot.docs.length, "posts");
      
    } catch (indexError) {
      console.log("⚠️ Index not available, falling back to basic query:", indexError.message);
      
      // Fallback: Get all posts and filter client-side
      postsQuery = query(
        postsRef,
        orderBy("createdAt", "desc"),
        ...(lastDocSnapshot ? [startAfter(lastDocSnapshot)] : []),
        limit(limitCount * 10) // Get more posts to filter
      );
      
      const fallbackSnapshot = await getDocs(postsQuery);
      console.log("📄 Fallback query got:", fallbackSnapshot.docs.length, "total posts");
      
      // Filter client-side for the specific user
      const userPosts = fallbackSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.authorId === userId && data.isVisible !== false;
      });
      
      console.log("🎯 Filtered to user posts:", userPosts.length);
      
      // Create a new snapshot-like object with filtered docs
      postsSnapshot = {
        docs: userPosts.slice(0, limitCount),
        empty: userPosts.length === 0
      };
    }

    if (postsSnapshot.empty) {
      return {
        data: [],
        metaData: {
          hasNextPage: false,
          lastCursor: null
        }
      };
    }

    // Collect all user IDs and prepare parallel queries
    const allUserIds = new Set();
    const postCommentPromises = [];
    const postLikePromises = [];

    postsSnapshot.docs.forEach(docSnap => {
      const postData = docSnap.data();
      allUserIds.add(postData.authorId);
      
      // Prepare parallel queries
      postCommentPromises.push(
        getDocs(query(
          collection(db, "Posts", docSnap.id, "Comments"),
          orderBy("createdAt", "asc"),
          limit(10) // Limit comments to reduce reads
        )).then(snapshot => ({ postId: docSnap.id, comments: snapshot.docs }))
      );
      
      postLikePromises.push(
        getDocs(collection(db, "Posts", docSnap.id, "Likes"))
        .then(snapshot => ({ postId: docSnap.id, likes: snapshot.docs }))
      );
    });

    // Execute all queries in parallel
    const [commentResults, likeResults] = await Promise.all([
      Promise.all(postCommentPromises),
      Promise.all(postLikePromises)
    ]);

    // Collect user IDs from comments
    commentResults.forEach(({ comments }) => {
      comments.forEach(commentDoc => {
        const commentData = commentDoc.data();
        allUserIds.add(commentData.authorId);
      });
    });

    // Batch fetch all users
    const userMap = await batchGetUsers(Array.from(allUserIds));

    const posts = [];

    for (const docSnap of postsSnapshot.docs) {
      const postData = docSnap.data();
      
      // Skip invisible posts
      if (postData.isVisible === false) continue;
      
      const authorData = userMap[postData.authorId];
      
      // Get likes from results
      const likeResult = likeResults.find(result => result.postId === docSnap.id);
      const likes = [];
      
      if (likeResult) {
        likes.push(...likeResult.likes.map(likeDoc => ({
          id: likeDoc.id,
          ...serializeFirebaseData(likeDoc.data())
        })));
      }

      // Get comments from results
      const commentResult = commentResults.find(result => result.postId === docSnap.id);
      const comments = [];
      
      if (commentResult) {
        comments.push(...commentResult.comments.map(commentDoc => {
          const commentData = commentDoc.data();
          const commentAuthorData = userMap[commentData.authorId];
          
          console.log("📝 getPosts - Processing comment:", {
            commentId: commentDoc.id,
            postId: docSnap.id,
            authorId: commentData.authorId,
            hasAuthorData: !!commentAuthorData?.data,
            authorFields: commentAuthorData?.data ? {
              firstName: commentAuthorData.data.firstName,
              lastName: commentAuthorData.data.lastName,
              first_name: commentAuthorData.data.first_name,
              last_name: commentAuthorData.data.last_name,
              username: commentAuthorData.data.username
            } : 'NO_AUTHOR_DATA',
            fallbackAuthor: !commentAuthorData?.data ? { id: commentData.authorId, firstName: 'Unknown', lastName: 'User' } : null
          });
          
          return {
            id: commentDoc.id,
            ...serializeFirebaseData(commentData),
            createdAt: toSerializableDate(commentData.createdAt),
            author: commentAuthorData?.data || { 
              id: commentData.authorId, 
              firstName: 'Unknown', 
              lastName: 'User',
              first_name: 'Unknown',
              last_name: 'User',
              username: 'unknown'
            }
          };
        }));
      }

      posts.push({
        id: docSnap.id,
        ...postData,
        createdAt: toSerializableDate(postData.createdAt),
        updatedAt: toSerializableDate(postData.updatedAt),
        editedAt: toSerializableDate(postData.editedAt),
        author: authorData?.data || { 
          id: postData.authorId, 
          firstName: 'Unknown', 
          lastName: 'User',
          first_name: 'Unknown',
          last_name: 'User',
          username: 'unknown'
        },
        likes,
        comments,
        commentsCount: comments.length
      });
    }

    // Get the last document for next page cursor
    const lastDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];

    return {
      data: posts,
      metaData: {
        hasNextPage: postsSnapshot.docs.length === limitCount,
        lastCursor: lastDoc ? lastDoc.id : null
      }
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
};

// Optimized updatePostLike with batch operations
export const updatePostLike = async (postId, type, userId) => {
  console.log("🔥 updatePostLike called:", { postId, type, userId });
  
  try {
    if (!userId) {
      console.error("❌ User ID is required");
      throw new Error("User ID is required");
    }

    const batch = writeBatch(db);
    const postRef = doc(db, "Posts", postId);

    console.log("📝 Firebase refs created:", { postRef: postRef.path });

    if (type === "like") {
      console.log("👍 Adding like...");
      // Add like using batch
      const likeRef = doc(collection(db, "Posts", postId, "Likes"));
      const likeData = {
        authorId: userId,
        postId: postId,
        createdAt: serverTimestamp()
      };
      batch.set(likeRef, likeData);
      console.log("✅ Like queued for batch write:", {
        likeId: likeRef.id,
        likeData,
        subcollectionPath: `Posts/${postId}/Likes`
      });
    } else if (type === "unlike") {
      console.log("👎 Removing like...");
      // Find and remove like
      const likesSnapshot = await getDocs(
        query(collection(db, "Posts", postId, "Likes"), where("authorId", "==", userId))
      );
      
      console.log("🔍 Found likes to remove:", {
        count: likesSnapshot.docs.length,
        likeIds: likesSnapshot.docs.map(doc => doc.id)
      });
      
      likesSnapshot.docs.forEach((likeDoc) => {
        batch.delete(likeDoc.ref);
        console.log("🗑️ Like queued for deletion:", {
          likeId: likeDoc.id,
          authorId: likeDoc.data().authorId
        });
      });
    }

    // Get current likes count for batch update
    console.log("📊 Counting current likes before update...");
    const likesSnapshot = await getDocs(collection(db, "Posts", postId, "Likes"));
    let newLikesCount = likesSnapshot.docs.length;
    
    console.log("📊 Current likes in DB:", {
      count: newLikesCount,
      likes: likesSnapshot.docs.map(doc => ({
        id: doc.id,
        authorId: doc.data().authorId
      }))
    });
    
    // Adjust count based on operation
    if (type === "like") {
      newLikesCount += 1;
      console.log("➕ Incrementing likes count:", newLikesCount);
    } else if (type === "unlike") {
      const userLikesToRemove = likesSnapshot.docs.filter(doc => doc.data().authorId === userId).length;
      newLikesCount = Math.max(0, newLikesCount - userLikesToRemove);
      console.log("➖ Decrementing likes count:", {
        userLikesToRemove,
        newCount: newLikesCount
      });
    }
    
    // Update post likes count in batch
    batch.update(postRef, {
      likesCount: newLikesCount
    });
    
    console.log("📝 Post likesCount update queued:", newLikesCount);
    
    // Commit batch
    console.log("💾 Committing batch operation...");
    await batch.commit();
    console.log("✅ Batch operation completed. Final likes count:", newLikesCount);

    // Verify the save by reading back the data
    console.log("🔍 Verifying save - reading back likes...");
    const verifySnapshot = await getDocs(collection(db, "Posts", postId, "Likes"));
    console.log("✅ Verification complete:", {
      likesInDB: verifySnapshot.docs.length,
      likeDetails: verifySnapshot.docs.map(doc => ({
        id: doc.id,
        authorId: doc.data().authorId,
        createdAt: doc.data().createdAt
      }))
    });

    return { success: true, likesCount: verifySnapshot.docs.length };
  } catch (error) {
    console.error("❌ Error updating post like:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to update post like: ${error.message}`);
  }
};

// Optimized addComment with batch operations and compatibility check
// Check if user can comment on a specific post (based on compatibility)
export const canUserComment = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { canComment: false, reason: "Missing required parameters" };
    }

    // Get post data to check the author
    const postDocRef = doc(db, "Posts", postId);
    const postDocSnapshot = await getDoc(postDocRef);
    
    if (!postDocSnapshot.exists()) {
      return { canComment: false, reason: "Post not found" };
    }

    const postData = postDocSnapshot.data();
    const postAuthorId = postData.authorId;

    // Check if the commenter is the post author (always allowed)
    if (userId === postAuthorId) {
      return { canComment: true, reason: "Own post" };
    }

    // Check compatibility between commenter and post author
    const { areUsersCompatible } = await import('./admin');
    const isCompatible = await areUsersCompatible(userId, postAuthorId);
    
    if (!isCompatible) {
      return { 
        canComment: false, 
        reason: "You can only comment on posts from people you're compatible with",
        postAuthorId 
      };
    }
    
    return { canComment: true, reason: "Compatible users" };
  } catch (error) {
    console.error("Error checking comment permission:", error);
    return { canComment: false, reason: "Error checking permissions" };
  }
};

export const addComment = async (postId, comment, userId) => {
  console.log("🔥 addComment called:", { postId, comment: comment?.substring(0, 50), userId });
  
  try {
    if (!postId || !comment || !userId) {
      console.error("❌ Missing required parameters:", { postId: !!postId, comment: !!comment, userId: !!userId });
      throw new Error("Missing required parameters");
    }

    // Get post data to check the author
    console.log("📝 Getting post data to check author:", postId);
    const postDocRef = doc(db, "Posts", postId);
    const postDocSnapshot = await getDoc(postDocRef);
    
    if (!postDocSnapshot.exists()) {
      console.error("❌ Post not found:", postId);
      throw new Error("Post not found");
    }

    const postData = postDocSnapshot.data();
    const postAuthorId = postData.authorId;
    
    console.log("👤 Post author ID:", postAuthorId);
    console.log("👤 Comment author ID:", userId);

    // Check if the commenter is the post author (always allowed)
    if (userId === postAuthorId) {
      console.log("✅ User is commenting on their own post - allowed");
    } else {
      // Check compatibility between commenter and post author
      console.log("🔍 Checking compatibility between users...");
      const { areUsersCompatible } = await import('./admin');
      const isCompatible = await areUsersCompatible(userId, postAuthorId);
      
      console.log("🤝 Compatibility result:", { 
        commenterId: userId, 
        postAuthorId, 
        isCompatible 
      });

      if (!isCompatible) {
        console.error("❌ Users are not compatible - comment not allowed");
        throw new Error("You can only comment on posts from people you're compatible with");
      }
      
      console.log("✅ Users are compatible - comment allowed");
    }

    // Get user data from cache
    console.log("👤 Getting user data for userId:", userId);
    const userData = await getCachedUser(userId);
    console.log("👤 User data retrieved:", userData?.data);
    
    if (!userData?.data) {
      console.error("❌ User not found for userId:", userId);
      throw new Error("User not found");
    }

    // Use batch for atomic operations
    const batch = writeBatch(db);
    
    // Create comment data
    const commentData = {
      comment: comment.trim(),
      authorId: userId,
      postId: postId,
      createdAt: serverTimestamp(),
    };

    console.log("📝 Creating comment with data:", commentData);

    // Add comment to subcollection
    const commentRef = doc(collection(db, "Posts", postId, "Comments"));
    batch.set(commentRef, commentData);
    console.log("✅ Comment queued for batch write with ID:", commentRef.id);
    console.log("🔑 Generated comment ID details:", {
      commentId: commentRef.id,
      idLength: commentRef.id.length,
      isFirestoreId: commentRef.id.length === 20 // Firestore auto-generated IDs are typically 20 chars
    });

    // Update post's comments count
    console.log("📊 Updating post comments count...");
    const postRef = doc(db, "Posts", postId);
    
    // Get current post to check existing comments count
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      const currentData = postDoc.data();
      const newCommentsCount = (currentData.commentsCount || 0) + 1;
      
      batch.update(postRef, {
        commentsCount: newCommentsCount,
        updatedAt: serverTimestamp()
      });
      
      console.log("✅ Post comments count update queued:", newCommentsCount);
    } else {
      console.error("❌ Post document not found:", postId);
      throw new Error("Post not found");
    }

    // Commit batch
    await batch.commit();
    console.log("✅ Batch operation completed");

    // Return comment with author data - properly serialized
    const newComment = {
      id: commentRef.id,
      comment: comment.trim(),
      authorId: userId,
      postId: postId,
      createdAt: toSerializableDate(new Date()), // Use current date as ISO string
      author: userData.data // This is already serialized from getCachedUser
    };

    console.log("🎯 Returning new comment:", newComment);
    return newComment;

  } catch (error) {
    console.error("❌ Error in addComment:", error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
};

// Edit post (only by author)
export const editPost = async (postId, newText, userId) => {
  console.log("✏️ editPost called:", { postId, newText: newText?.substring(0, 50) + "...", userId });
  
  try {
    if (!userId) {
      console.error("❌ User ID is required");
      throw new Error("User ID is required");
    }

    if (!postId) {
      console.error("❌ Post ID is required");
      throw new Error("Post ID is required");
    }

    if (!newText || newText.trim() === '') {
      console.error("❌ New text is required");
      throw new Error("New text is required");
    }

    console.log("📍 Getting post document reference...");
    const postRef = doc(db, "Posts", postId);
    console.log("📄 Post reference created:", postRef.path);
    
    console.log("📥 Fetching post document...");
    const postDoc = await getDoc(postRef);
    console.log("📄 Post document fetched:", { exists: postDoc.exists() });

    if (!postDoc.exists()) {
      console.error("❌ Post not found:", postId);
      throw new Error("Post not found");
    }

    const postData = postDoc.data();
    console.log("📊 Post data retrieved:", { 
      authorId: postData.authorId, 
      currentUserId: userId,
      isVisible: postData.isVisible,
      originalText: postData.postText?.substring(0, 50) + "...",
      createdAt: postData.createdAt
    });
    
    if (postData.authorId !== userId) {
      console.error("❌ Authorization failed:", { 
        postAuthor: postData.authorId, 
        currentUser: userId 
      });
      throw new Error("You can only edit your own posts");
    }

    console.log("✅ Authorization successful - User is the post author");
    console.log("📝 Updating post document with new text...");

    await updateDoc(postRef, {
      postText: newText.trim(),
      edited: true,
      editedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("✅ Post successfully updated");
    return { success: true };
  } catch (error) {
    console.error("❌ Error editing post:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to edit post: ${error.message}`);
  }
};

// Delete post (only by author)
export const deletePost = async (postId, userId) => {
  console.log("🗑️ deletePost called:", { postId, userId });
  
  try {
    if (!userId) {
      console.error("❌ User ID is required");
      throw new Error("User ID is required");
    }

    if (!postId) {
      console.error("❌ Post ID is required");
      throw new Error("Post ID is required");
    }

    console.log("📍 Getting post document reference...");
    const postRef = doc(db, "Posts", postId);
    console.log("📄 Post reference created:", postRef.path);
    
    console.log("📥 Fetching post document...");
    const postDoc = await getDoc(postRef);
    console.log("📄 Post document fetched:", { exists: postDoc.exists() });

    if (!postDoc.exists()) {
      console.error("❌ Post not found:", postId);
      throw new Error("Post not found");
    }

    const postData = postDoc.data();
    console.log("📊 Post data retrieved:", { 
      authorId: postData.authorId, 
      currentUserId: userId,
      isVisible: postData.isVisible,
      postText: postData.postText?.substring(0, 50) + "...",
      createdAt: postData.createdAt
    });
    
    if (postData.authorId !== userId) {
      console.error("❌ Authorization failed:", { 
        postAuthor: postData.authorId, 
        currentUser: userId 
      });
      throw new Error("You can only delete your own posts");
    }

    console.log("✅ Authorization successful - User is the post author");
    console.log("📝 Updating post document to mark as deleted...");
    
    // Soft delete - mark as invisible
    await updateDoc(postRef, {
      isVisible: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("✅ Post successfully marked as deleted");
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

// Optimized getPostComments with caching
export const getPostComments = async (postId) => {
  console.log("🔥 getPostComments called for postId:", postId);
  
  try {
    if (!postId) {
      console.error("❌ PostId is required");
      throw new Error("PostId is required");
    }

    console.log("📍 Querying comments collection:", `Posts/${postId}/Comments`);
    
    const commentsSnapshot = await getDocs(
      query(
        collection(db, "Posts", postId, "Comments"),
        orderBy("createdAt", "asc")
      )
    );

    console.log("📄 Comments snapshot received:", {
      postId,
      docsCount: commentsSnapshot.docs.length,
      isEmpty: commentsSnapshot.empty
    });

    if (commentsSnapshot.empty) {
      return { data: [] };
    }

    // Collect all unique author IDs
    const authorIds = [...new Set(commentsSnapshot.docs.map(doc => doc.data().authorId))];
    
    // Batch fetch all authors
    const userMap = await batchGetUsers(authorIds);

    const comments = commentsSnapshot.docs.map(commentDoc => {
      const commentData = commentDoc.data();
      const authorData = userMap[commentData.authorId];
      
      // Serialize the comment data properly
      const serializedCommentData = serializeFirebaseData(commentData);
      
      console.log("📝 Processing comment:", {
        commentId: commentDoc.id,
        authorId: commentData.authorId,
        hasAuthorData: !!authorData?.data,
        authorFields: authorData?.data ? {
          firstName: authorData.data.firstName,
          lastName: authorData.data.lastName,
          first_name: authorData.data.first_name,
          last_name: authorData.data.last_name,
          username: authorData.data.username
        } : 'NO_AUTHOR_DATA'
      });
      
      return {
        id: commentDoc.id,
        ...serializedCommentData,
        createdAt: toSerializableDate(commentData.createdAt),
        author: authorData?.data || { 
          id: commentData.authorId, 
          firstName: 'Unknown', 
          lastName: 'User',
          first_name: 'Unknown',
          last_name: 'User',
          username: 'unknown'
        }
      };
    });

    console.log("🎯 Returning comments:", { postId, commentsCount: comments.length });
    return { data: comments };
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

// Get popular trends based on hashtags in posts (optimized with caching)
export const getPopularTrends = async () => {
  try {
    // Get recent posts (last 7 days) with limit
    const postsRef = collection(db, "Posts");
    const recentPostsQuery = query(
      postsRef,
      orderBy("createdAt", "desc"),
      limit(100) // Reduced from 200 to limit reads
    );

    const snapshot = await getDocs(recentPostsQuery);
    const hashtagCount = {};

    // Process posts to extract hashtags
    snapshot.docs.forEach(doc => {
      const postData = doc.data();
      
      // Skip invisible posts
      if (postData.isVisible === false) {
        return;
      }

      // Extract hashtags from post text
      const postText = postData.postText || '';
      const hashtags = postText.match(/#\w+/g) || [];
      
      hashtags.forEach(hashtag => {
        const cleanHashtag = hashtag.toLowerCase();
        if (hashtagCount[cleanHashtag]) {
          hashtagCount[cleanHashtag].count++;
          hashtagCount[cleanHashtag].posts.push(doc.id);
        } else {
          hashtagCount[cleanHashtag] = {
            name: hashtag, // Keep original case
            count: 1,
            posts: [doc.id]
          };
        }
      });
    });

    // Convert to array and sort by count
    const trends = Object.values(hashtagCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 trends
      .map(trend => ({
        name: trend.name,
        _count: {
          name: trend.count
        },
        posts: trend.posts
      }));

    // If no hashtags found, return some default trends
    if (trends.length === 0) {
      return [
        { name: "#SocialMedia", _count: { name: 5 }, posts: [] },
        { name: "#Technology", _count: { name: 3 }, posts: [] },
        { name: "#Lifestyle", _count: { name: 2 }, posts: [] },
        { name: "#News", _count: { name: 2 }, posts: [] },
        { name: "#Fun", _count: { name: 1 }, posts: [] }
      ];
    }

    return trends;
  } catch (error) {
    console.error("Error fetching popular trends:", error);
    
    // Return fallback trends on error
    return [
      { name: "#Trending", _count: { name: 10 }, posts: [] },
      { name: "#Popular", _count: { name: 8 }, posts: [] },
      { name: "#Social", _count: { name: 6 }, posts: [] },
      { name: "#Community", _count: { name: 4 }, posts: [] },
      { name: "#Connect", _count: { name: 3 }, posts: [] }
    ];
  }
};

// Optimized editComment with batch operations
export const editComment = async (postId, commentId, newComment, userId) => {
  console.log("🔥 editComment called:", { postId, commentId, newComment: newComment?.substring(0, 50), userId });
  
  try {
    if (!postId || !commentId || !newComment || !userId) {
      console.error("❌ Missing required parameters");
      throw new Error("Missing required parameters");
    }

    // Get comment to verify ownership
    const commentRef = doc(db, "Posts", postId, "Comments", commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      console.error("❌ Comment not found:", commentId);
      throw new Error("Comment not found");
    }

    const commentData = commentDoc.data();
    if (commentData.authorId !== userId) {
      console.error("❌ User not authorized to edit comment");
      throw new Error("You can only edit your own comments");
    }

    console.log("📝 Updating comment...");
    await updateDoc(commentRef, {
      comment: newComment.trim(),
      edited: true,
      editedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("✅ Comment updated successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error editing comment:", error);
    throw new Error(`Failed to edit comment: ${error.message}`);
  }
};

// Optimized deleteComment with batch operations
export const deleteComment = async (postId, commentId, userId) => {
  console.log("🗑️ deleteComment called:", { postId, commentId, userId });
  console.log("🔍 Comment ID analysis:", {
    commentId,
    isTemporary: commentId?.startsWith('temp-'),
    idLength: commentId?.length,
    idType: typeof commentId
  });
  
  try {
    if (!postId || !commentId || !userId) {
      console.error("❌ Missing required parameters:", {
        hasPostId: !!postId,
        hasCommentId: !!commentId,
        hasUserId: !!userId
      });
      throw new Error("Missing required parameters");
    }

    console.log("📍 Getting comment document reference...");
    const commentRef = doc(db, "Posts", postId, "Comments", commentId);
    console.log("📄 Comment reference created:", commentRef.path);
    
    console.log("📥 Fetching comment document...");
    const commentDoc = await getDoc(commentRef);
    console.log("📄 Comment document fetched:", { 
      exists: commentDoc.exists(),
      docId: commentDoc.id,
      refPath: commentRef.path
    });
    
    if (!commentDoc.exists()) {
      console.error("❌ Comment not found:", commentId);
      console.log("🔍 Searching for all comments in post to help debug...");
      
      try {
        const allCommentsSnapshot = await getDocs(collection(db, "Posts", postId, "Comments"));
        console.log("📋 All comments in post:", {
          totalComments: allCommentsSnapshot.docs.length,
          commentIds: allCommentsSnapshot.docs.map(doc => ({
            id: doc.id,
            authorId: doc.data().authorId,
            comment: doc.data().comment?.substring(0, 30) + "...",
            createdAt: doc.data().createdAt
          }))
        });
      } catch (debugError) {
        console.error("❌ Error fetching comments for debug:", debugError);
      }
      
      throw new Error("Comment not found");
    }

    const commentData = commentDoc.data();
    console.log("📊 Comment data retrieved:", {
      authorId: commentData.authorId,
      currentUserId: userId,
      comment: commentData.comment?.substring(0, 50) + "...",
      createdAt: commentData.createdAt
    });
    
    // Check if user is comment author
    const isCommentAuthor = commentData.authorId === userId;
    
    // Check if user is post author (can moderate comments on their post)
    console.log("📍 Getting post document to check post author...");
    const postRefForAuth = doc(db, "Posts", postId);
    const postDocForAuth = await getDoc(postRefForAuth);
    
    if (!postDocForAuth.exists()) {
      console.error("❌ Post not found:", postId);
      throw new Error("Post not found");
    }
    
    const postData = postDocForAuth.data();
    const isPostAuthor = postData.authorId === userId;
    
    console.log("🔍 Authorization check:", {
      commentAuthor: commentData.authorId,
      postAuthor: postData.authorId,
      currentUser: userId,
      isCommentAuthor,
      isPostAuthor,
      canDelete: isCommentAuthor || isPostAuthor
    });
    
    if (!isCommentAuthor && !isPostAuthor) {
      console.error("❌ Authorization failed:", {
        commentAuthor: commentData.authorId,
        postAuthor: postData.authorId,
        currentUser: userId
      });
      throw new Error("You can only delete your own comments or moderate comments on your posts");
    }

    console.log("✅ Authorization successful -", isCommentAuthor ? "User is the comment author" : "User is the post author (moderating)");

    // Use batch for atomic operations
    const batch = writeBatch(db);
    
    console.log("🗑️ Queuing comment deletion...");
    batch.delete(commentRef);

    // Update post's comments count
    console.log("📊 Getting post document to update comments count...");
    const postRef = doc(db, "Posts", postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const currentData = postDoc.data();
      const currentCount = currentData.commentsCount || 0;
      const newCount = Math.max(0, currentCount - 1);
      
      console.log("📊 Comments count update:", {
        currentCount,
        newCount
      });
      
      batch.update(postRef, {
        commentsCount: newCount,
        updatedAt: serverTimestamp()
      });
      
      console.log("✅ Post comments count update queued:", newCount);
    } else {
      console.error("❌ Post document not found:", postId);
    }

    // Commit batch
    console.log("💾 Committing batch operation...");
    await batch.commit();
    console.log("✅ Comment successfully deleted");

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};


