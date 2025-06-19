"use server";

import { 
  mockPosts, 
  mockUsers, 
  mockCurrentUser, 
  mockTrendsWithCounts,
  getPostsWithRelations,
  paginatePosts 
} from "@/mock/mockData";
import { checkPostForTrends } from "@/utils";

// Global variables to simulate database state
let mockPostsState = [...getPostsWithRelations()];
let nextPostId = Math.max(...mockPosts.map(p => p.id)) + 1;
let nextLikeId = 100;
let nextCommentId = 50;

// Mock current user function
const getCurrentUser = () => {
  return Promise.resolve(mockCurrentUser);
};

export const createPost = async (post) => {
  const { postText, media } = post;
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = await getCurrentUser();
    const currentTime = new Date();
    
    const newPost = {
      id: nextPostId++,
      postText,
      media: media || null,
      authorId: user.id,
      cld_id: media ? `post_${nextPostId}_${Date.now()}` : null,
      createdAt: currentTime,
      likes: [],
      comments: [],
      trends: [],
      author: user,
    };

    // Add trends if any
    const trends = checkPostForTrends(postText);
    if (trends.length > 0) {
      newPost.trends = trends.map((trend, index) => ({
        id: `trend_${nextPostId}_${index}`,
        name: trend,
        postId: newPost.id,
      }));
    }

    // Add to beginning of posts array (most recent first)
    mockPostsState.unshift(newPost);

    return {
      data: newPost,
    };
  } catch (e) {
    console.log(e);
    throw Error("Failed to create post");
  }
};

export const getPosts = async (lastCursor, id) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const take = 5;
    let filteredPosts = mockPostsState;
    
    // Filter by user if id is not "all"
    if (id !== "all") {
      filteredPosts = mockPostsState.filter(post => post.author.id === id);
    }
    
    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return paginatePosts(filteredPosts, lastCursor, take);
  } catch (e) {
    console.log(e);
    throw Error("Failed to fetch posts");
  }
};

export const getMyPostsFeed = async (lastCursor) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = await getCurrentUser();
    
    // For mock purposes, return all posts as if they're from followed users
    // In a real app, you'd filter by following relationships
    const feedPosts = mockPostsState.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return paginatePosts(feedPosts, lastCursor, 5);
  } catch (e) {
    console.log(e);
    throw Error("Failed to fetch posts");
  }
};

export const updatePostLike = async (postId, type) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = await getCurrentUser();
    const userId = user.id;

    // Find the post
    const postIndex = mockPostsState.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      return {
        error: "Post not found",
      };
    }

    const post = mockPostsState[postIndex];
    
    // Check if user has already liked the post
    const likeIndex = post.likes.findIndex(like => like.authorId === userId);
    const hasLiked = likeIndex !== -1;

    if (type === "like" && !hasLiked) {
      // Add like
      const newLike = {
        id: nextLikeId++,
        postId: postId,
        authorId: userId,
        createdAt: new Date(),
      };
      post.likes.push(newLike);
    } else if (type === "unlike" && hasLiked) {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    return {
      data: post,
    };
  } catch (e) {
    console.log(e);
    throw Error("Failed to update post like");
  }
};

export const addComment = async (postId, comment) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = await getCurrentUser();
    
    // Find the post
    const postIndex = mockPostsState.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      throw new Error("Post not found");
    }

    const newComment = {
      id: nextCommentId++,
      comment,
      authorId: user.id,
      postId: postId,
      createdAt: new Date(),
      author: user,
    };

    mockPostsState[postIndex].comments.push(newComment);

    return {
      data: newComment,
    };
  } catch (e) {
    throw e;
  }
};

export const createTrends = async (trends, postId) => {
  try {
    // Mock function - trends are already created in createPost
    return {
      data: trends.map((trend, index) => ({
        id: `trend_${postId}_${index}`,
        name: trend,
        postId: postId,
      })),
    };
  } catch (e) {
    throw e;
  }
};

export const getPopularTrends = async () => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: mockTrendsWithCounts,
    };
  } catch (e) {
    throw e;
  }
};

export const deletePost = async (postId) => {
  try {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = await getCurrentUser();
    const userId = user.id;
    
    // Find the post
    const postIndex = mockPostsState.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      return {
        error: "Post not found",
      };
    }

    const post = mockPostsState[postIndex];
    
    // Check if user owns the post
    if (post.authorId !== userId) {
      return {
        error: "You are not authorized to delete this post",
      };
    }

    // Remove the post
    mockPostsState.splice(postIndex, 1);
    
    return {
      data: "Post deleted",
    };
  } catch (e) {
    throw e;
  }
};
