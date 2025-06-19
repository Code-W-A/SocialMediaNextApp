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
  and
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getMyCompatibleUsers } from "./admin";
import { getUser } from "./user";

// Create a new post
export const createPost = async (post) => {
  const { postText, media, authorId } = post;
  try {
    if (!authorId) {
      throw new Error("Author ID is required");
    }

    // Get author data
    const authorData = await getUser(authorId);
    if (!authorData?.data) {
      throw new Error("Author not found");
    }

    let mediaUrl = null;
    let mediaFileName = null;

    // Upload media if provided
    if (media) {
      try {
        // Convert base64 to file if needed
        if (typeof media === 'string' && media.startsWith('data:')) {
          const base64Data = media.split(',')[1];
          const mimeType = media.split(',')[0].split(':')[1].split(';')[0];
          const fileExtension = mimeType.split('/')[1];
          
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer], { type: mimeType });
          
          // Create unique filename
          const timestamp = Date.now();
          const fileName = `post_${timestamp}.${fileExtension}`;
          const filePath = `posts/${authorId}/${fileName}`;
          
          // Upload to Firebase Storage
          const storage = getStorage();
          const storageRef = ref(storage, filePath);
          const snapshot = await uploadBytes(storageRef, blob);
          mediaUrl = await getDownloadURL(snapshot.ref);
          mediaFileName = fileName;
        }
      } catch (uploadError) {
        console.error("Error uploading media:", uploadError);
        // Continue without media if upload fails
      }
    }

    // Create post document
    const newPost = {
      postText: postText || '',
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

    const docRef = await addDoc(collection(db, "Posts"), newPost);

    // Return post with author data
    return {
      data: {
        id: docRef.id,
        ...newPost,
        createdAt: new Date(), // For immediate display
        updatedAt: new Date(),
        author: authorData.data,
        likes: [],
        comments: []
      },
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
};

// Get posts feed (personal + compatible users)
export const getMyPostsFeed = async (userId, lastCursor = null, limitCount = 10) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get compatible user IDs
    const compatibleUsers = await getMyCompatibleUsers(userId);
    const compatibleUserIds = compatibleUsers.map(user => user.id);
    
    // Include current user's posts
    const authorIds = [userId, ...compatibleUserIds];

    if (authorIds.length === 0) {
      return {
        data: [],
        metaData: {
          hasNextPage: false,
          lastCursor: null
        }
      };
    }

    // Create query for posts from compatible users
    const postsRef = collection(db, "Posts");
    let postsQuery = query(
      postsRef,
      orderBy("createdAt", "desc"),
      limit(limitCount * 5) // Get more posts to filter client-side
    );

    // Add pagination if lastCursor provided
    if (lastCursor) {
      const lastDoc = await getDoc(doc(db, "Posts", lastCursor));
      if (lastDoc.exists()) {
        postsQuery = query(
          postsRef,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(limitCount * 5)
        );
      }
    }

    const snapshot = await getDocs(postsQuery);
    const posts = [];

    // Process each post and filter by compatible authors
    for (const docSnap of snapshot.docs) {
      const postData = docSnap.data();
      
      // Skip invisible posts
      if (postData.isVisible === false) {
        continue;
      }
      
      // Only include posts from compatible users or current user
      if (!authorIds.includes(postData.authorId)) {
        continue;
      }
      
      // Get author data
      const authorData = await getUser(postData.authorId);
      
      // Get likes for this post
      const likesSnapshot = await getDocs(
        collection(db, "Posts", docSnap.id, "Likes")
      );
      const likes = likesSnapshot.docs.map(likeDoc => ({
        id: likeDoc.id,
        ...likeDoc.data()
      }));

      // Get comments count
      const commentsSnapshot = await getDocs(
        collection(db, "Posts", docSnap.id, "Comments")
      );

      posts.push({
        id: docSnap.id,
        ...postData,
        // Convert Firestore timestamp to Date for display
        createdAt: postData.createdAt?.toDate() || new Date(),
        updatedAt: postData.updatedAt?.toDate() || new Date(),
        editedAt: postData.editedAt?.toDate() || null,
        author: authorData?.data || { id: postData.authorId, firstName: 'Unknown', lastName: 'User' },
        likes,
        comments: [], // We'll load comments on demand
        commentsCount: commentsSnapshot.docs.length
      });
      
      // Stop when we have enough posts
      if (posts.length >= limitCount) {
        break;
      }
    }

    return {
      data: posts,
      metaData: {
        hasNextPage: posts.length === limitCount,
        lastCursor: posts.length > 0 ? posts[posts.length - 1].id : null
      }
    };
  } catch (error) {
    console.error("Error fetching posts feed:", error);
    throw new Error("Failed to fetch posts feed");
  }
};

// Get posts for a specific user
export const getPosts = async (lastCursor = null, userId, limitCount = 10) => {
  try {
    if (!userId || userId === "all") {
      // Return all posts (for admin or public feed)
      return getMyPostsFeed("all_users", lastCursor, limitCount);
    }

    const postsRef = collection(db, "Posts");
    let postsQuery = query(
      postsRef,
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount * 2)
    );

    if (lastCursor) {
      const lastDoc = await getDoc(doc(db, "Posts", lastCursor));
      if (lastDoc.exists()) {
        postsQuery = query(
          postsRef,
          where("authorId", "==", userId),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(limitCount * 2)
        );
      }
    }

    const snapshot = await getDocs(postsQuery);
    const posts = [];

    for (const docSnap of snapshot.docs) {
      const postData = docSnap.data();
      
      // Skip invisible posts
      if (postData.isVisible === false) {
        continue;
      }
      
      const authorData = await getUser(postData.authorId);
      
      const likesSnapshot = await getDocs(
        collection(db, "Posts", docSnap.id, "Likes")
      );
      const likes = likesSnapshot.docs.map(likeDoc => ({
        id: likeDoc.id,
        ...likeDoc.data()
      }));

      const commentsSnapshot = await getDocs(
        collection(db, "Posts", docSnap.id, "Comments")
      );

      posts.push({
        id: docSnap.id,
        ...postData,
        createdAt: postData.createdAt?.toDate() || new Date(),
        updatedAt: postData.updatedAt?.toDate() || new Date(),
        editedAt: postData.editedAt?.toDate() || null,
        author: authorData?.data || { id: postData.authorId, firstName: 'Unknown', lastName: 'User' },
        likes,
        comments: [],
        commentsCount: commentsSnapshot.docs.length
      });
    }

    return {
      data: posts,
      metaData: {
        hasNextPage: snapshot.docs.length === limitCount,
        lastCursor: posts.length > 0 ? posts[posts.length - 1].id : null
      }
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
};

// Update post like
export const updatePostLike = async (postId, type, userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const likeRef = doc(db, "Posts", postId, "Likes", userId);
    const postRef = doc(db, "Posts", postId);

    if (type === "like") {
      // Add like
      await addDoc(collection(db, "Posts", postId, "Likes"), {
        authorId: userId,
        postId: postId,
        createdAt: serverTimestamp()
      });
    } else if (type === "unlike") {
      // Remove like
      const likesSnapshot = await getDocs(
        query(collection(db, "Posts", postId, "Likes"), where("authorId", "==", userId))
      );
      
      likesSnapshot.forEach(async (likeDoc) => {
        await deleteDoc(likeDoc.ref);
      });
    }

    // Update likes count in post
    const likesSnapshot = await getDocs(collection(db, "Posts", postId, "Likes"));
    await updateDoc(postRef, {
      likesCount: likesSnapshot.docs.length
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating post like:", error);
    throw new Error("Failed to update post like");
  }
};

// Add comment to post
export const addComment = async (postId, comment, userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const authorData = await getUser(userId);
    
    const newComment = {
      comment,
      authorId: userId,
      postId: postId,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "Posts", postId, "Comments"), newComment);

    // Update comments count in post
    const commentsSnapshot = await getDocs(collection(db, "Posts", postId, "Comments"));
    await updateDoc(doc(db, "Posts", postId), {
      commentsCount: commentsSnapshot.docs.length
    });

    return {
      data: {
        id: docRef.id,
        ...newComment,
        createdAt: new Date(),
        author: authorData?.data || { id: userId, firstName: 'Unknown', lastName: 'User' }
      },
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
};

// Edit post (only by author)
export const editPost = async (postId, newText, userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const postRef = doc(db, "Posts", postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    const postData = postDoc.data();
    if (postData.authorId !== userId) {
      throw new Error("You can only edit your own posts");
    }

    await updateDoc(postRef, {
      postText: newText,
      edited: true,
      editedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error editing post:", error);
    throw new Error("Failed to edit post");
  }
};

// Delete post (only by author)
export const deletePost = async (postId, userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const postRef = doc(db, "Posts", postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    const postData = postDoc.data();
    if (postData.authorId !== userId) {
      throw new Error("You can only delete your own posts");
    }

    // Soft delete - mark as invisible
    await updateDoc(postRef, {
      isVisible: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("Failed to delete post");
  }
};

// Get comments for a post
export const getPostComments = async (postId) => {
  try {
    const commentsSnapshot = await getDocs(
      query(
        collection(db, "Posts", postId, "Comments"),
        orderBy("createdAt", "asc")
      )
    );

    const comments = [];
    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();
      const authorData = await getUser(commentData.authorId);
      
      comments.push({
        id: commentDoc.id,
        ...commentData,
        createdAt: commentData.createdAt?.toDate() || new Date(),
        author: authorData?.data || { id: commentData.authorId, firstName: 'Unknown', lastName: 'User' }
      });
    }

    return { data: comments };
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

// Get popular trends based on hashtags in posts
export const getPopularTrends = async () => {
  try {
    // Get recent posts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postsRef = collection(db, "Posts");
    const recentPostsQuery = query(
      postsRef,
      orderBy("createdAt", "desc"),
      limit(200) // Get recent posts to analyze
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
