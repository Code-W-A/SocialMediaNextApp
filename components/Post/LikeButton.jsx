"use client";
import { Button, Flex, Typography } from "antd";
import React, { useMemo } from "react";
import Iconify from "../Iconify";
import { HappyProvider } from "@ant-design/happy-work-theme";
import { useUser } from "@/hooks/useFirebaseAuth";
import { updatePostLike } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { now } from "@/utils/dateHelpers";

const LikeButton = ({ postId, likes: initialLikes, queryId }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  // Create the correct query key that matches Posts.jsx
  const queryKey = useMemo(() => ["posts", queryId, user?.id], [queryId, user?.id]);
  
  console.log("🔄 LikeButton render:", {
    postId,
    initialLikesCount: initialLikes?.length || 0,
    userId: user?.id,
    queryId,
    queryKey
  });
  
  // Use only the likes from props (query cache) - no local state
  const likes = initialLikes || [];

  // Memoize user liked status to prevent unnecessary re-calculations
  const isLiked = useMemo(() => {
    const userLiked = likes?.some((like) => like?.authorId === user?.id) || false;
    console.log("🤔 LikeButton: Calculating user liked status", {
      postId,
      userLiked,
      userId: user?.id,
      likesCount: likes?.length || 0,
      likeAuthors: likes?.map(like => like.authorId)
    });
    return userLiked;
  }, [likes, user?.id, postId]);

  const actionType = isLiked ? "unlike" : "like";

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ postId, actionType }) => {
      console.log("🚀 LikeButton: mutationFn called", {
        postId,
        actionType,
        userId: user?.id
      });
      const result = await updatePostLike(postId, actionType, user?.id);
      console.log("📊 LikeButton: mutationFn result", result);
      return result;
    },
    onMutate: async ({ postId, actionType }) => {
      console.log("🔄 LikeButton: onMutate - Starting optimistic update", {
        postId,
        actionType,
        currentLikesCount: likes?.length || 0,
        userId: user?.id
      });

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(queryKey);
      
      console.log("💾 LikeButton: Previous posts data", {
        exists: !!previousPosts,
        pagesCount: previousPosts?.pages?.length || 0
      });

      // Optimistically update the query cache
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post.id === postId) {
                const currentLikes = post.likes || [];
                let newLikes;
                
                if (actionType === "like") {
                  // Add like
                  newLikes = [...currentLikes, {
                    id: `temp-${Date.now()}`,
                    authorId: user?.id,
                    postId: postId,
                    createdAt: now()
                  }];
                } else {
                  // Remove like
                  newLikes = currentLikes.filter(like => like.authorId !== user?.id);
                }
                
                console.log("💾 LikeButton: Query cache updated for post", {
                  postId: post.id,
                  actionType,
                  oldLikesCount: currentLikes.length,
                  newLikesCount: newLikes.length
                });
                
                return {
                  ...post,
                  likes: newLikes,
                  likesCount: newLikes.length
                };
              }
              return post;
            }),
          })),
        };
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onSuccess: (result) => {
      console.log("✅ LikeButton: Like operation successful", {
        postId,
        actionType,
        result
      });
      // Optionally invalidate to refetch fresh data, but usually not needed with optimistic updates
      // queryClient.invalidateQueries({ queryKey });
    },
    onError: (err, variables, context) => {
      console.error("❌ LikeButton: Like operation failed", {
        postId: variables.postId,
        actionType: variables.actionType,
        error: err,
        errorMessage: err.message
      });
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
        console.log("🔄 LikeButton: Reverted query cache");
      }
    },
  });

  const handleLikeClick = () => {
    console.log("👆 LikeButton: Click handler called", {
      postId,
      actionType,
      isPending,
      currentLikesCount: likes?.length || 0,
      isLiked
    });
    
    if (isPending) {
      console.log("⏳ LikeButton: Click ignored - already loading");
      return;
    }
    
    mutate({ postId, actionType });
  };

  return (
    <HappyProvider>
      <Button
        size="small"
        style={{ background: "transparent", border: "none", boxShadow: "none" }}
        onClick={handleLikeClick}
        loading={isPending}
        disabled={isPending}
      >
        <Flex gap={".5rem"} align="center">
          <Iconify
            icon="ph:heart-fill"
            width={"22px"}
            style={{ color: isLiked ? "var(--primary)" : "grey" }}
          />

          <Typography.Text className="typoBody2">
            {likes?.length === 0 ? "Like" : `${likes?.length} Likes`}
          </Typography.Text>
        </Flex>
      </Button>
    </HappyProvider>
  );
};

export default LikeButton;
