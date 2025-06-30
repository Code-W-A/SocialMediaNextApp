import { Avatar, Button, Flex, Input } from "antd";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Iconify from "../Iconify";
import { addComment } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { now } from "@/utils/dateHelpers";

const CommentInput = ({ postId, setExpanded, queryId, onCommentAdded, setIsLoading }) => {
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
      // Basic trim validation
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
      return addComment(postId, value, user?.id);
    }, [value, user?.id]),
    
    onMutate: useCallback(async () => {
      setExpanded(true);
      setIsLoading(true);
      setIsSubmitting(true);

      // Create optimistic comment with memoized author
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticComment = {
        id: tempId,
        comment: value.trim(),
        authorId: user?.id,
        postId: postId,
        createdAt: now(),
        author: optimisticAuthor
      };
      
      console.log("🔄 CommentInput: Creating optimistic comment", {
        tempId,
        comment: value.trim().substring(0, 30) + "...",
        postId,
        userId: user?.id
      });
      
      // Add to parent component's local state first (faster UI update)
      if (onCommentAdded) {
        onCommentAdded(optimisticComment);
      }

      // Batch cache updates to reduce re-renders
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] });
      const previousPosts = queryClient.getQueryData(["posts", queryId]);

      // Optimized cache update with minimal object creation
      queryClient.setQueryData(["posts", queryId], (old) => {
        if (!old) {
          return old;
        }
        
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post.id === postId) {
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

      console.log("✅ CommentInput: Optimistic comment added to cache");
      return { previousPosts, optimisticComment };
    }, [postId, value, user?.id, optimisticAuthor, setExpanded, setIsLoading, onCommentAdded, queryClient, queryId]),
    
    onSuccess: useCallback((result) => {
      console.log("✅ CommentInput: Comment added successfully", {
        result,
        tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        realId: result?.id
      });
      
      setValue(""); // Reset input on success
      setIsLoading(false);
      setIsSubmitting(false);
      
      // Update cache to replace temporary ID with real ID from server
      if (result?.id) {
        queryClient.setQueryData(["posts", queryId], (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post.id === postId) {
                  // Find and replace the temporary comment with the real one
                  const updatedComments = post.comments.map((comment) => {
                    // Replace the last temporary comment (most recent) with server response
                    if (comment.id.startsWith('temp-') && comment.authorId === user?.id && comment.comment === result.comment) {
                      console.log("🔄 CommentInput: Replacing temp ID with real ID", {
                        tempId: comment.id,
                        realId: result.id
                      });
                      return {
                        ...result, // Use the complete comment data from server
                        author: comment.author // Keep the author data from optimistic update
                      };
                    }
                    return comment;
                  });
                  
                  return {
                    ...post,
                    comments: updatedComments
                  };
                }
                return post;
              }),
            })),
          };
        });
      }
    }, [setIsLoading, queryId, postId, user?.id, queryClient]),
    
    onError: useCallback((err, variables, context) => {
      toast.error("Something wrong happened. Try again!");
      setIsLoading(false);
      setIsSubmitting(false);
      
      // Revert optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
    }, [setIsLoading, queryClient, queryId]),
  });

  // Optimized submit handler with additional validation
  const handleSubmit = useCallback(() => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return;
    }
    
    if (trimmedValue.length > 500) {
      toast.error("Comment is too long (max 500 characters)");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    if (isSubmitting || isPending) {
      return;
    }
    
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
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        autoSize={{ minRows: 1, maxRows: 3 }}
        maxLength={500}
        showCount={value.length > 400}
        style={{ flex: 1 }}
      />

      {/* send button */}
      <Button
        type="primary"
        shape="circle"
        disabled={isDisabled}
        loading={isPending || isSubmitting}
        onClick={handleSubmit}
        icon={<Iconify icon="ph:paper-plane-tilt-fill" />}
      />
    </Flex>
  );
};

export default CommentInput;
