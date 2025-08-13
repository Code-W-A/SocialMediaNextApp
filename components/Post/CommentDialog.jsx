import { Avatar, Button, Flex, Input, Modal, Typography, Alert } from "antd";
import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Iconify from "../Iconify";
import { addComment, canUserComment } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { now } from "@/utils/dateHelpers";
import { useLanguage } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";

const CommentDialog = ({ open, onClose, postId, setExpanded, queryId }) => {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commentPermission, setCommentPermission] = useState({ canComment: true, reason: "" });
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const { user } = useUser();
  const { t } = useLanguage();
  const { isPremium } = useSubscription();
  const queryClient = useQueryClient();
  const textAreaRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check comment permission when dialog opens
  useEffect(() => {
    const checkCommentPermission = async () => {
      if (!open || !user?.id || !postId) {
        setIsCheckingPermission(false);
        return;
      }

      try {
        setIsCheckingPermission(true);
        const permission = await canUserComment(postId, user.id);
        setCommentPermission(permission);
      } catch (error) {
        console.error("Error checking comment permission:", error);
        setCommentPermission({ 
          canComment: false, 
          reason: "Error checking permissions" 
        });
      } finally {
        setIsCheckingPermission(false);
      }
    };

    if (open) {
      checkCommentPermission();
    }
  }, [open, postId, user?.id]);
  
  // Create the correct query key that matches Posts.jsx
  const queryKey = useMemo(() => ["posts", queryId, user?.id], [queryId, user?.id]);
  
  // Memoized user profile image to prevent recalculation
  const userProfileImage = useMemo(() => getMainProfileImage(user?.images), [user?.images]);
  
  // Memoized user data for optimistic updates - match exactly the server structure
  const optimisticAuthor = useMemo(() => ({
    id: user?.id,
    // Main fields (Firebase structure)
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
    email: user?.email,
    images: user?.images,
    
    // Legacy field mappings for backward compatibility (match getUser structure)
    first_name: user?.firstName,
    last_name: user?.lastName,
    email_address: user?.email,
    image_url: userProfileImage,
    
    // Additional fields to match complete structure
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    relationshipStatus: user?.relationshipStatus || '',
    interests: user?.interests || [],
    gpsCoordinates: user?.gpsCoordinates || null,
    banner_url: user?.banner_url || null,
    banner_id: user?.banner_id || null,
    verified: user?.verified || false,
    followers: user?.followers || [],
    following: user?.following || [],
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    lastTimeActive: user?.lastTimeActive,
    isIncomplete: false,
  }), [
    user?.id, 
    user?.firstName, 
    user?.lastName, 
    user?.username, 
    user?.email,
    userProfileImage, 
    user?.images,
    user?.bio,
    user?.location,
    user?.website,
    user?.relationshipStatus,
    user?.interests,
    user?.gpsCoordinates,
    user?.banner_url,
    user?.banner_id,
    user?.verified,
    user?.followers,
    user?.following,
    user?.createdAt,
    user?.updatedAt,
    user?.lastTimeActive
  ]);

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open && textAreaRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Clear value when dialog closes
  useEffect(() => {
    if (!open) {
      setValue("");
      setIsSubmitting(false);
    }
  }, [open]);

  const { isPending, mutate } = useMutation({
    mutationFn: useCallback((postId) => {
      return addComment(postId, value, user?.id);
    }, [value, user?.id]),
    
    onMutate: useCallback(async () => {
      setExpanded(true);
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
      
      console.log("🔄 CommentDialog: Creating optimistic comment", {
        tempId,
        comment: value.trim().substring(0, 30) + "...",
        postId,
        userId: user?.id,
        authorFields: {
          firstName: optimisticAuthor.firstName,
          lastName: optimisticAuthor.lastName,
          first_name: optimisticAuthor.first_name,
          last_name: optimisticAuthor.last_name,
          username: optimisticAuthor.username
        }
      });
      
      // Batch cache updates to reduce re-renders
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      // Optimized cache update with minimal object creation
      queryClient.setQueryData(queryKey, (old) => {
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

      console.log("✅ CommentDialog: Optimistic comment added to cache");
      return { previousPosts, optimisticComment };
    }, [postId, value, user?.id, optimisticAuthor, setExpanded, queryClient, queryKey]),
    
    onSuccess: useCallback((newComment) => {
      setValue("");
      setIsSubmitting(false);
      onClose(); // Close dialog on success
      
      console.log("✅ CommentDialog: Comment added successfully", {
        commentId: newComment?.id,
        hasAuthor: !!newComment?.author,
        fullAuthorData: newComment?.author,
        authorFields: newComment?.author ? {
          firstName: newComment.author.firstName,
          lastName: newComment.author.lastName,
          first_name: newComment.author.first_name,
          last_name: newComment.author.last_name,
          username: newComment.author.username
        } : null
      });

      // Ensure author data is complete - fallback to optimistic author if server data is incomplete
      if (newComment && newComment.author) {
        // Check if author has proper name fields
        const hasFirstName = newComment.author.firstName || newComment.author.first_name;
        const hasLastName = newComment.author.lastName || newComment.author.last_name;
        const hasUsername = newComment.author.username;
        
        if (!hasFirstName && !hasLastName && !hasUsername) {
          console.warn("⚠️ CommentDialog: Server comment missing author name data, preserving optimistic author");
          newComment.author = { ...newComment.author, ...optimisticAuthor };
        }
      } else if (newComment && !newComment.author) {
        console.warn("⚠️ CommentDialog: Server comment missing author completely, using optimistic author");
        newComment.author = optimisticAuthor;
      }
      
      // Update cache with real comment data from server
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post.id === postId) {
                // Replace temp comment with real comment
                const comments = post.comments || [];
                const tempCommentIndex = comments.findIndex(c => c.id.startsWith('temp-'));
                
                if (tempCommentIndex !== -1) {
                  // Replace the temp comment with the real one
                  const updatedComments = [...comments];
                  updatedComments[tempCommentIndex] = newComment;
                  
                  return {
                    ...post,
                    comments: updatedComments,
                    commentsCount: updatedComments.length
                  };
                } else {
                  // Fallback: just add the new comment
                  return {
                    ...post,
                    comments: [...comments, newComment],
                    commentsCount: (post.commentsCount || 0) + 1
                  };
                }
              }
              return post;
            }),
          })),
        };
      });
    }, [postId, queryClient, queryKey, optimisticAuthor, onClose]),
    
    onError: useCallback((err, variables, context) => {
      toast.error("Something wrong happened. Try again!");
      setIsSubmitting(false);
      
      // Revert optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
    }, [queryClient, queryKey]),
  });

  // Handle submit
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

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSubmitting && !isPending) {
      onClose();
    }
  }, [isSubmitting, isPending, onClose]);

  const isDisabled = useMemo(() => 
    isPending || isSubmitting || !value.trim() || value.trim().length > 500
  , [isPending, isSubmitting, value]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title={
        <Flex align="center" gap="12px">
          <Iconify icon="ph:chat-circle-fill" width="20px" style={{ color: '#667eea' }} />
          <Typography.Text strong>Add a comment</Typography.Text>
          {isPremium && (
            <div style={{
              marginLeft: 'auto',
              background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
              border: '1px solid #ffe58f',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 700,
              color: '#ad6800',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Iconify icon="mdi:crown" width="14px" />
              {t('comments.premiumCommentAnywhere')}
            </div>
          )}
        </Flex>
      }
      width={isMobile ? '95vw' : 500}
      centered
      destroyOnHidden
      maskClosable={!isSubmitting && !isPending}
      closable={!isSubmitting && !isPending}
              styles={{
          body: { 
            padding: isMobile ? '16px' : '20px',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: 'auto'
          },
          header: { 
            borderBottom: '1px solid #f0f0f0', 
            paddingBottom: '16px',
            padding: isMobile ? '16px 16px 12px 16px' : undefined
          },
          content: {
            maxHeight: isMobile ? '90vh' : 'auto'
          }
        }}
    >
      <Flex vertical gap="16px">
        {/* User info */}
        <Flex align="center" gap="12px">
          <Avatar 
            src={userProfileImage} 
            size={40} 
            style={{ minWidth: "40px" }}
          >
            {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
          </Avatar>
          <Typography.Text strong>
            {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Anonymous'}
          </Typography.Text>
        </Flex>

        {/* Show restriction message if user cannot comment */}
        {!isCheckingPermission && !commentPermission.canComment && (
          <Alert
            message={t('comments.cannotComment')}
            description={
              commentPermission.reason === "You can only comment on posts from people you're compatible with" 
                ? (
                  <>
                    <div>{t('comments.compatibilityRequired')}</div>
                    <div style={{ marginTop: '8px' }}>{t('comments.likeToGetCompatible')}</div>
                  </>
                )
                : commentPermission.reason
            }
            type="warning"
            showIcon
          />
        )}

        {/* Show loading while checking permissions */}
        {isCheckingPermission && (
          <Alert
            message={t('comments.checkingPermissions')}
            type="info"
            showIcon
          />
        )}

                 {/* Comment input */}
         <Input.TextArea
           ref={textAreaRef}
           disabled={isPending || isSubmitting || isCheckingPermission || !commentPermission.canComment}
           placeholder={
             isCheckingPermission 
               ? t('comments.checkingPermissions')
               : !commentPermission.canComment 
                 ? t('comments.cannotComment')
                 : "Scrie comentariul tău..."
           }
           value={value}
           onChange={(e) => setValue(e.target.value)}
           onKeyDown={handleKeyPress}
           autoSize={{ 
             minRows: isMobile ? 4 : 3, 
             maxRows: isMobile ? 10 : 8 
           }}
           maxLength={500}
           showCount={value.length > 400 && commentPermission.canComment}
           style={{ 
             fontSize: isMobile ? '16px' : '14px',
             lineHeight: '1.5',
             borderRadius: '8px'
           }}
         />

        {/* Helper text */}
        {commentPermission.canComment && !isCheckingPermission && (
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Press Ctrl+Enter (Cmd+Enter on Mac) to submit
          </Typography.Text>
        )}

                 {/* Action buttons */}
         <Flex 
           justify="space-between" 
           align="center"
           gap="12px"
           style={{
             flexDirection: isMobile ? 'column-reverse' : 'row'
           }}
         >
           <Button
             onClick={handleClose}
             disabled={isSubmitting || isPending}
             style={{
               width: isMobile ? '100%' : 'auto'
             }}
           >
             {commentPermission.canComment ? 'Cancel' : 'Close'}
           </Button>
           
           {commentPermission.canComment && !isCheckingPermission && (
             <Button
               type="primary"
               onClick={handleSubmit}
               loading={isPending || isSubmitting}
               disabled={isDisabled}
               icon={<Iconify icon="ph:paper-plane-tilt-fill" />}
               size={isMobile ? 'large' : 'middle'}
               style={{
                 width: isMobile ? '100%' : 'auto'
               }}
             >
               Post Comment
             </Button>
           )}
         </Flex>
      </Flex>
    </Modal>
  );
};

export default CommentDialog; 