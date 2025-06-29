import { Avatar, Button, Flex, Input } from "antd";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Iconify from "../Iconify";
import { addComment } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";

const CommentInput = ({ postId, setExpanded, queryId, onCommentAdded, setIsLoading }) => {
  console.log("🔥 CommentInput rendered:", { postId, queryId, hasOnCommentAdded: !!onCommentAdded });
  
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const debounceTimeoutRef = useRef(null);
  const validationTimeoutRef = useRef(null);
  
  // Memoized user profile image to prevent recalculation
  const userProfileImage = useMemo(() => getMainProfileImage(user?.images), [user?.images]);
  
  // Memoized user data for optimistic updates to prevent recreation
  const optimisticAuthor = useMemo(() => ({
    id: user?.id,
    first_name: user?.firstName,
    last_name: user?.lastName,
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
    image_url: userProfileImage,
    images: user?.images,
  }), [user?.id, user?.firstName, user?.lastName, user?.username, userProfileImage, user?.images]);
  
  // Debounced validation function
  const debouncedValidation = useCallback((inputValue) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      // Perform any client-side validation here if needed
      // For now, just basic trim validation
      const isValid = inputValue.trim().length > 0 && inputValue.trim().length <= 500;
      // Could emit validation state if needed
    }, 300); // 300ms debounce
  }, []);
  
  // Cleanup timeouts
  useEffect(() => {
    const debounceTimeout = debounceTimeoutRef.current;
    const validationTimeout = validationTimeoutRef.current;
    
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, []);
  
  const { isPending, mutate } = useMutation({
    mutationFn: useCallback((postId) => {
      console.log("🚀 Executing comment mutation:", { postId, comment: value, userId: user?.id });
      return addComment(postId, value, user?.id);
    }, [value, user?.id]),
    
    onMutate: useCallback(async () => {
      console.log("⏳ Optimistic comment update starting:", { postId, comment: value });
      setExpanded(true);
      setIsLoading(true);
      setIsSubmitting(true);

      // Create optimistic comment with memoized author
      const optimisticComment = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
        comment: value.trim(),
        authorId: user?.id,
        postId: postId,
        createdAt: new Date(),
        author: optimisticAuthor
      };

      console.log("➕ Created optimistic comment:", optimisticComment);
      
      // Add to parent component's local state first (faster UI update)
      if (onCommentAdded) {
        console.log("📤 Calling onCommentAdded callback...");
        onCommentAdded(optimisticComment);
        console.log("✅ onCommentAdded callback executed");
      } else {
        console.warn("⚠️ onCommentAdded callback not provided!");
      }

      // Batch cache updates to reduce re-renders
      console.log("💾 Updating query cache...");
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] });
      const previousPosts = queryClient.getQueryData(["posts", queryId]);

      console.log("📊 Previous posts data:", {
        hasData: !!previousPosts,
        pagesCount: previousPosts?.pages?.length
      });

      // Optimized cache update with minimal object creation
      queryClient.setQueryData(["posts", queryId], (old) => {
        if (!old) {
          console.log("⚠️ No old query data found");
          return old;
        }
        
        console.log("🔄 Updating query data...");
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post.id === postId) {
                console.log("📝 Found target post, updating comments:", {
                  postId,
                  currentCommentsCount: post.comments?.length || 0
                });
                return {
                  ...post,
                  comments: [...(post.comments || []), optimisticComment],
                  commentsCount: (post.commentsCount || 0) + 1
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousPosts, optimisticComment };
    }, [postId, value, user?.id, optimisticAuthor, setExpanded, setIsLoading, onCommentAdded, queryClient, queryId]),
    
    onSuccess: useCallback((result) => {
      console.log("✅ Comment mutation successful:", result);
      setValue(""); // Reset input on success
      setIsLoading(false);
      setIsSubmitting(false);
      console.log("🎯 Comment flow completed successfully");
    }, [setIsLoading]),
    
    onError: useCallback((err, variables, context) => {
      console.error("❌ Comment mutation error:", err);
      console.error("❌ Error details:", {
        message: err.message,
        variables,
        context
      });
      toast.error("Something wrong happened. Try again!");
      setIsLoading(false);
      setIsSubmitting(false);
      
      // Revert optimistic update on error
      if (context?.previousPosts) {
        console.log("🔄 Reverting query cache to previous state");
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
      
      // Note: We can't easily revert the parent's local state here,
      // but the error is unlikely and the page will refresh eventually
    }, [setIsLoading, queryClient, queryId]),
  });

  // Optimized submit handler with additional validation
  const handleSubmit = useCallback(() => {
    const trimmedValue = value.trim();
    console.log("🖱️ Comment submit clicked:", { 
      postId, 
      comment: trimmedValue, 
      hasUser: !!user?.id,
      commentLength: trimmedValue.length
    });
    
    if (!trimmedValue) {
      console.warn("⚠️ Empty comment, not submitting");
      return;
    }
    
    if (trimmedValue.length > 500) {
      console.warn("⚠️ Comment too long, not submitting");
      toast.error("Comment is too long (max 500 characters)");
      return;
    }
    
    if (!user?.id) {
      console.error("❌ No user ID, cannot submit comment");
      toast.error("You must be logged in to comment");
      return;
    }
    
    if (isSubmitting || isPending) {
      console.warn("⚠️ Already submitting, ignoring duplicate request");
      return;
    }
    
    console.log("🚀 Initiating comment mutation...");
    mutate(postId);
  }, [value, postId, user?.id, isSubmitting, isPending, mutate]);

  // Optimized change handler with debounced validation
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Debounced validation
    debouncedValidation(newValue);
  }, [debouncedValidation]);

  // Optimized key press handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Memoized disabled state
  const isDisabled = useMemo(() => 
    isPending || isSubmitting || !value.trim() || value.trim().length > 500
  , [isPending, isSubmitting, value]);

  console.log("🎨 CommentInput rendering with:", { 
    value: value.trim(), 
    isPending,
    isSubmitting,
    hasUser: !!user?.id,
    isDisabled
  });

  return (
    <Flex gap={"1rem"} align="center">
      {/* avatar */}
      <Avatar 
        src={userProfileImage} 
        size={40} 
        style={{ minWidth: "40px" }}
      >
        {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
      </Avatar>

      {/* input box */}
      <Input.TextArea
        disabled={isPending || isSubmitting}
        placeholder="Write a comment..."
        style={{ resize: "none" }}
        autoSize={{ minRows: 1, maxRows: 5 }}
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        showCount={{
          max: 500,
          style: { fontSize: '12px', color: value.length > 450 ? '#ff4d4f' : '#999' }
        }}
      />

      <Button
        type="primary"
        onClick={handleSubmit}
        disabled={isDisabled}
        loading={isPending || isSubmitting}
      >
        <Iconify icon="iconamoon:send-fill" width="1.2rem" />
      </Button>
    </Flex>
  );
};

export default React.memo(CommentInput);
