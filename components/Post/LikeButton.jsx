"use client";
import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";
import Iconify from "../Iconify";
import { HappyProvider } from "@ant-design/happy-work-theme";
import { useUser } from "@/hooks/useFirebaseAuth";
import { updatePostLike } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LikeButton = ({ postId, likes: initialLikes, queryId }) => {
  console.log("🔥 LikeButton rendered:", { postId, initialLikesCount: initialLikes?.length, queryId });
  
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  // Local state for likes - optimistic updates
  const [likes, setLikes] = useState(initialLikes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when initial likes change (from server)
  useEffect(() => {
    console.log("📥 Initial likes updated:", { postId, likesCount: initialLikes?.length });
    setLikes(initialLikes || []);
  }, [initialLikes]);

  // Check if user liked the post
  useEffect(() => {
    const userLiked = likes?.some((like) => like?.authorId === user?.id);
    console.log("👍 Checking if user liked post:", { 
      postId, 
      userId: user?.id, 
      userLiked, 
      likesCount: likes?.length 
    });
    setIsLiked(userLiked);
  }, [user, likes]);

  const actionType = isLiked ? "unlike" : "like";

  const { mutate } = useMutation({
    mutationFn: ({ postId, actionType }) => {
      console.log("🚀 Executing like mutation:", { postId, actionType, userId: user?.id });
      return updatePostLike(postId, actionType, user?.id);
    },
    onMutate: async ({ postId, actionType }) => {
      console.log("⏳ Optimistic like update:", { postId, actionType });
      setIsLoading(true);

      // Optimistic update - immediately update local state
      setLikes(prevLikes => {
        if (actionType === "like") {
          // Add like optimistically
          const newLike = {
            id: `temp-${Date.now()}`,
            authorId: user?.id,
            postId: postId,
            createdAt: new Date()
          };
          const newLikes = [...(prevLikes || []), newLike];
          console.log("➕ Added like optimistically:", { newLikesCount: newLikes.length });
          return newLikes;
        } else {
          // Remove like optimistically
          const newLikes = (prevLikes || []).filter(like => like.authorId !== user?.id);
          console.log("➖ Removed like optimistically:", { newLikesCount: newLikes.length });
          return newLikes;
        }
      });

      // Also update the query cache for persistence across re-renders
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] });
      const previousPosts = queryClient.getQueryData(["posts", queryId]);

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
                    createdAt: new Date()
                  }];
                } else {
                  newLikes = currentLikes.filter(like => like.authorId !== user?.id);
                }
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
    onSuccess: () => {
      console.log("✅ Like mutation successful");
      setIsLoading(false);
      // Data is already updated optimistically, no need to refetch
    },
    onError: (err, variables, context) => {
      console.error("❌ Like mutation error:", err);
      setIsLoading(false);
      
      // Revert optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
      
      // Also revert local state
      setLikes(initialLikes || []);
    },
  });

  const handleLikeClick = () => {
    console.log("🖱️ Like button clicked:", { postId, actionType, isLoading });
    if (isLoading) return;
    mutate({ postId, actionType });
  };

  console.log("🎨 LikeButton rendering with:", { 
    isLiked, 
    likesCount: likes?.length, 
    isLoading 
  });

  return (
    <HappyProvider>
      <Button
        size="small"
        style={{ background: "transparent", border: "none", boxShadow: "none" }}
        onClick={handleLikeClick}
        loading={isLoading}
        disabled={isLoading}
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
