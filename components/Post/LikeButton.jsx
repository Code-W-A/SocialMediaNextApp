"use client";
import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import Iconify from "../Iconify";
import { HappyProvider } from "@ant-design/happy-work-theme";
import { useUser } from "@/hooks/useFirebaseAuth";
import { updatePostLike } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { now } from "@/utils/dateHelpers";

const LikeButton = ({ postId, likes: initialLikes, queryId }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  console.log("🔄 LikeButton render:", {
    postId,
    initialLikesCount: initialLikes?.length || 0,
    userId: user?.id,
    queryId
  });
  
  // Local state for likes - optimistic updates
  const [likes, setLikes] = useState(initialLikes || []);
  const [isLiked, setIsLiked] = useState(false);

  // Update local state when initial likes change (from server)
  useEffect(() => {
    console.log("📥 LikeButton: Initial likes changed", {
      postId,
      oldCount: likes?.length || 0,
      newCount: initialLikes?.length || 0,
      newLikes: initialLikes?.map(like => ({ id: like.id, authorId: like.authorId }))
    });
    setLikes(initialLikes || []);
  }, [initialLikes, likes?.length, postId]);

  // Memoize user liked status to prevent unnecessary re-calculations
  const isUserLiked = useMemo(() => {
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

  // Update isLiked state only when the computed value changes
  useEffect(() => {
    console.log("💖 LikeButton: isLiked state update", {
      postId,
      oldIsLiked: isLiked,
      newIsLiked: isUserLiked
    });
    setIsLiked(isUserLiked);
  }, [isUserLiked, isLiked, postId]);

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

      // Optimistic update - immediately update local state
      setLikes(prevLikes => {
        const updatedLikes = actionType === "like" 
          ? [...(prevLikes || []), {
              id: `temp-${Date.now()}`,
              authorId: user?.id,
              postId: postId,
              createdAt: now()
            }]
          : (prevLikes || []).filter(like => like.authorId !== user?.id);
        
        console.log("📝 LikeButton: Local likes state updated", {
          postId,
          actionType,
          oldCount: prevLikes?.length || 0,
          newCount: updatedLikes.length,
          newLikes: updatedLikes.map(like => ({ id: like.id, authorId: like.authorId }))
        });
        
        return updatedLikes;
      });

      // Also update the query cache for persistence across re-renders
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] });
      const previousPosts = queryClient.getQueryData(["posts", queryId]);
      
      console.log("💾 LikeButton: Previous posts data", {
        exists: !!previousPosts,
        pagesCount: previousPosts?.pages?.length || 0
      });

      queryClient.setQueryData(["posts", queryId], (old) => {
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
                  newLikes = [...currentLikes, {
                    id: `temp-${Date.now()}`,
                    authorId: user?.id,
                    postId: postId,
                    createdAt: now()
                  }];
                } else {
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

      return { previousPosts };
    },
    onSuccess: (result) => {
      console.log("✅ LikeButton: Like operation successful", {
        postId,
        actionType,
        result
      });
      // Data is already updated optimistically, no need to refetch
    },
    onError: (err, variables, context) => {
      console.error("❌ LikeButton: Like operation failed", {
        postId: variables.postId,
        actionType: variables.actionType,
        error: err,
        errorMessage: err.message
      });
      
      // Revert optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
        console.log("🔄 LikeButton: Reverted query cache");
      }
      
      // Also revert local state
      setLikes(initialLikes || []);
      console.log("🔄 LikeButton: Reverted local state");
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
