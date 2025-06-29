"use client";
import { Avatar, Button, Flex, Typography, Dropdown, Input, Popconfirm } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import css from "@/styles/Post.module.css";
import Box from "../Box";
import { SettingsContext } from "@/context/settings/settings-context";
import cx from "classnames";
import CommentInput from "./CommentInput";
import Iconify from "../Iconify";
import dayjs from "dayjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { animateScroll } from "react-scroll";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editComment, deleteComment } from "@/actions/post";
import toast from "react-hot-toast";

const EXPAND_ICONS = {
  true: "ic:outline-expand-less",
  false: "ic:outline-expand-more",
};

const CommentSection = ({ comments: initialComments, postId, queryId }) => {
  console.log("🔥 CommentSection rendered:", { 
    postId, 
    initialCommentsCount: initialComments?.length, 
    queryId,
    initialComments 
  });
  
  const [expanded, setExpanded] = useState(false);
  const [parent] = useAutoAnimate();
  
  // Local state for comments - optimistic updates
  const [comments, setComments] = useState(initialComments || []);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when initial comments change (from server)
  useEffect(() => {
    console.log("📥 Initial comments updated:", { 
      postId, 
      commentsCount: initialComments?.length,
      initialComments 
    });
    setComments(initialComments || []);
  }, [initialComments, postId]);

  console.log("💬 CommentSection state:", { 
    commentsCount: comments?.length, 
    isLoading,
    expanded,
    comments 
  });

  useEffect(() => {
    if (expanded) {
      console.log("📜 Scrolling to bottom of comments");
      // scroll to the bottom of parent
      animateScroll.scrollToBottom({
        containerId: "comments-container",
        smooth: true,
        duration: 300,
      });
    }
  }, [expanded, comments]);

  const checkIsPostingComment = (index) => {
    if (index === comments?.length - 1 && isLoading) {
      return true;
    } else {
      return false;
    }
  };

  // Function to add comment optimistically
  const addCommentOptimistically = (newComment) => {
    console.log("➕ Adding comment optimistically to local state:", newComment);
    setComments(prevComments => {
      const updatedComments = [...(prevComments || []), newComment];
      console.log("📊 Updated comments state:", {
        previousCount: prevComments?.length || 0,
        newCount: updatedComments.length,
        newComment
      });
      return updatedComments;
    });
    setExpanded(true); // Auto-expand when adding comment
    console.log("✅ Comment added to local state and expanded");
  };

  // Function to update comment optimistically
  const updateCommentOptimistically = (commentId, newText) => {
    console.log("📝 Updating comment optimistically:", { commentId, newText });
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, comment: newText, edited: true, editedAt: new Date() }
          : comment
      )
    );
  };

  // Function to remove comment optimistically
  const removeCommentOptimistically = (commentId) => {
    console.log("🗑️ Removing comment optimistically:", commentId);
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
  };

  console.log("🎨 CommentSection rendering with:", { 
    commentsCount: comments?.length, 
    expanded, 
    isLoading,
    hasComments: comments && comments.length > 0
  });

  return (
    <Flex vertical gap={"1rem"}>
      <>
        {comments?.length > 1 && (
          <Button type="text" onClick={() => setExpanded((prev) => !prev)}>
            <Flex align="center" gap={".5rem"} justify="center">
              <Iconify icon={EXPAND_ICONS[expanded]} />
              Show more comments ({comments.length})
            </Flex>
          </Button>
        )}
        {/* comments */}
        {comments?.length > 0 && (
          <Flex
            vertical
            gap={".5rem"}
            className={css.commentsContainer}
            ref={parent}
            id="comments-container"
          >
            {!expanded ? (
              <Comment
                data={comments[comments?.length - 1]}
                postingComment={() => checkIsPostingComment(0)}
                postId={postId}
                queryId={queryId}
                onCommentUpdated={updateCommentOptimistically}
                onCommentDeleted={removeCommentOptimistically}
              />
            ) : (
              comments?.map((comment, index) => {
                console.log("🔄 Rendering comment:", { 
                  index, 
                  commentId: comment.id, 
                  comment: comment.comment?.substring(0, 30)
                });
                return (
                  <Comment
                    key={comment.id || index}
                    data={comment}
                    postingComment={() => checkIsPostingComment(index)}
                    postId={postId}
                    queryId={queryId}
                    onCommentUpdated={updateCommentOptimistically}
                    onCommentDeleted={removeCommentOptimistically}
                  />
                );
              })
            )}
          </Flex>
        )}
        
        {comments?.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>
            No comments yet. Be the first to comment!
          </div>
        )}
        
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>
            Adding comment...
          </div>
        )}
      </>

      <CommentInput
        queryId={queryId}
        postId={postId}
        setExpanded={setExpanded}
        onCommentAdded={addCommentOptimistically}
        setIsLoading={setIsLoading}
      />
    </Flex>
  );
};

export default CommentSection;

function Comment({ data, postId, queryId, onCommentUpdated, onCommentDeleted }) {
  const {
    settings: { theme },
  } = useContext(SettingsContext);
  
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data?.comment || "");

  console.log("🔄 Comment component rendered:", { 
    commentId: data?.id, 
    authorName: `${data?.author?.first_name} ${data?.author?.last_name}`,
    comment: data?.comment?.substring(0, 30),
    isOwn: data?.authorId === currentUser?.id
  });

  // Edit comment mutation
  const { mutate: editMutate, isPending: isEditPending } = useMutation({
    mutationFn: ({ commentId, newText }) => editComment(postId, commentId, newText, currentUser?.id),
    onMutate: async ({ commentId, newText }) => {
      console.log("⏳ Optimistic comment edit:", { commentId, newText });
      
      // Update local state optimistically
      if (onCommentUpdated) {
        onCommentUpdated(commentId, newText);
      }
      
      // Update query cache
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
                return {
                  ...post,
                  comments: post.comments.map(comment => 
                    comment.id === commentId 
                      ? { ...comment, comment: newText, edited: true, editedAt: new Date() }
                      : comment
                  )
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
      console.log("✅ Comment edit successful");
      setIsEditing(false);
      toast.success("Comment updated successfully!");
    },
    onError: (err, variables, context) => {
      console.error("❌ Comment edit error:", err);
      toast.error("Failed to update comment");
      
      // Revert optimistic update
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
      
      // Revert local state
      if (onCommentUpdated) {
        onCommentUpdated(data.id, data.comment);
      }
    },
  });

  // Delete comment mutation
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: (commentId) => deleteComment(postId, commentId, currentUser?.id),
    onMutate: async (commentId) => {
      console.log("⏳ Optimistic comment delete:", commentId);
      
      // Update local state optimistically
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
      
      // Update query cache
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
                return {
                  ...post,
                  comments: post.comments.filter(comment => comment.id !== commentId),
                  commentsCount: Math.max(0, (post.commentsCount || 1) - 1)
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
      console.log("✅ Comment delete successful");
      toast.success("Comment deleted successfully!");
    },
    onError: (err, variables, context) => {
      console.error("❌ Comment delete error:", err);
      toast.error("Failed to delete comment");
      
      // Revert optimistic update
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
    },
  });

  const handleEdit = () => {
    if (editText.trim() !== data?.comment && editText.trim()) {
      editMutate({ commentId: data.id, newText: editText.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(data?.comment || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMutate(data.id);
  };

  // Dropdown menu items (only for own comments)
  const isOwnComment = data?.authorId === currentUser?.id;
  const menuItems = isOwnComment ? [
    {
      key: "edit",
      label: "Edit Comment",
      icon: <Iconify icon="eva:edit-fill" width="16px" />,
      onClick: () => setIsEditing(true),
    },
    {
      key: "delete",
      danger: true,
      label: (
        <Popconfirm
          title="Delete comment"
          description="Are you sure you want to delete this comment?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
        >
          Delete Comment
        </Popconfirm>
      ),
    },
  ] : [];

  return (
    <Box>
      <Flex gap={".5rem"}>
        {/* person image */}
        <Avatar 
          size={30} 
          src={getMainProfileImage(data?.author?.images) || data?.author?.image_url}
        >
          {data?.author?.first_name?.[0] || data?.author?.firstName?.[0] || data?.author?.username?.[0] || data?.author?.email?.[0]}
        </Avatar>

        {/* person comment */}
        <Flex
          vertical
          flex={1}
          gap={".5rem"}
          className={cx(css.comment, css[theme])}
        >
          {/* name, date and actions */}
          <Flex align="center" justify="space-between">
            <Flex align="center" gap=".5rem">
              {/* name */}
              <Typography.Text className="typoSubtitle2">
                {data?.author?.first_name} {data?.author?.last_name}
              </Typography.Text>

              {/* date */}
              <Typography.Text className="typoCaption" type="secondary" strong>
                {dayjs(data?.created_at || data?.createdAt).format("DD MMM YYYY")}
              </Typography.Text>

              {/* edited indicator */}
              {data?.edited && (
                <Typography.Text 
                  type="secondary" 
                  style={{ fontSize: '10px', fontStyle: 'italic' }}
                >
                  (edited)
                </Typography.Text>
              )}
            </Flex>

            {/* actions dropdown - only for own comments */}
            {isOwnComment && (
              <Dropdown 
                menu={{ items: menuItems }} 
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button 
                  ghost 
                  shape="circle" 
                  size="small"
                  style={{ 
                    opacity: 0.7,
                    color: '#000',
                    borderColor: 'transparent'
                  }}
                  loading={isEditPending || isDeletePending}
                >
                  <Iconify 
                    icon="akar-icons:more-vertical" 
                    width={14} 
                    style={{ color: '#000' }}
                  />
                </Button>
              </Dropdown>
            )}
          </Flex>

          {/* comment text or edit input */}
          {isEditing ? (
            <div style={{ marginTop: '0.5rem' }}>
              <Input.TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginBottom: '8px' }}
              />
              <Flex gap="8px" justify="flex-end">
                <Button size="small" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={handleEdit}
                  disabled={!editText.trim() || editText.trim() === data?.comment}
                  loading={isEditPending}
                >
                  Save Changes
                </Button>
              </Flex>
            </div>
          ) : (
            <Typography.Text className="typoBody2">
              {data?.comment}
            </Typography.Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
