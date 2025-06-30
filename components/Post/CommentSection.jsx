"use client";
import { Avatar, Button, Flex, Typography, Dropdown, Input, Popconfirm } from "antd";
import React, { useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  const [expanded, setExpanded] = useState(false);
  const [parent] = useAutoAnimate();
  
  // Local state for comments - optimistic updates
  const [comments, setComments] = useState(initialComments || []);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when initial comments change (from server)
  // Use JSON.stringify to ensure deep comparison for arrays
  const initialCommentsString = JSON.stringify(initialComments || []);
  useEffect(() => {
    setComments(initialComments || []);
  }, [initialCommentsString, postId]);

  // Stabilize scroll effect dependencies
  useEffect(() => {
    if (expanded && comments?.length > 0) {
      // scroll to the bottom of parent
      animateScroll.scrollToBottom({
        containerId: "comments-container",
        smooth: true,
        duration: 300,
      });
    }
  }, [expanded, comments?.length]);

  const checkIsPostingComment = useCallback((index) => {
    return index === comments?.length - 1 && isLoading;
  }, [comments?.length, isLoading]);

  // Function to add comment optimistically
  const addCommentOptimistically = useCallback((newComment) => {
    setComments(prevComments => [...(prevComments || []), newComment]);
    setExpanded(true); // Auto-expand when adding comment
  }, []);

  // Function to update comment optimistically
  const updateCommentOptimistically = useCallback((commentId, newText) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, comment: newText, edited: true, editedAt: new Date() }
          : comment
      )
    );
  }, []);

  // Function to remove comment optimistically
  const removeCommentOptimistically = useCallback((commentId) => {
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
  }, []);

  // Memoize has comments to prevent unnecessary re-renders
  const hasComments = useMemo(() => comments && comments.length > 0, [comments?.length]);

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
        {hasComments && (
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
              comments?.map((comment, index) => (
                <Comment
                  key={comment.id || index}
                  data={comment}
                  postingComment={() => checkIsPostingComment(index)}
                  postId={postId}
                  queryId={queryId}
                  onCommentUpdated={updateCommentOptimistically}
                  onCommentDeleted={removeCommentOptimistically}
                />
              ))
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

const Comment = React.memo(function Comment({ data, postId, queryId, onCommentUpdated, onCommentDeleted }) {
  const {
    settings: { theme },
  } = useContext(SettingsContext);
  
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data?.comment || "");

  // Edit comment mutation
  const { mutate: editMutate, isPending: isEditPending } = useMutation({
    mutationFn: ({ commentId, newText }) => editComment(postId, commentId, newText, currentUser?.id),
    onMutate: async ({ commentId, newText }) => {
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
      setIsEditing(false);
      toast.success("Comment updated successfully!");
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
      toast.error("Failed to update comment");
    },
  });

  // Delete comment mutation
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: ({ commentId }) => {
      console.log("🗑️ CommentSection: Delete mutation started", {
        commentId,
        postId,
        userId: currentUser?.id,
        isTemporary: commentId?.startsWith('temp-')
      });
      return deleteComment(postId, commentId, currentUser?.id);
    },
    onMutate: async ({ commentId }) => {
      console.log("🔄 CommentSection: onMutate - Starting optimistic delete", {
        commentId,
        postId
      });
      
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
                  commentsCount: Math.max(0, (post.commentsCount || 0) - 1)
                };
              }
              return post;
            }),
          })),
        };
      });

      console.log("✅ CommentSection: Optimistic delete completed");
      return { previousPosts };
    },
    onSuccess: (result) => {
      console.log("✅ CommentSection: Delete mutation successful", result);
      toast.success("Comment deleted successfully!");
    },
    onError: (err, variables, context) => {
      console.error("❌ CommentSection: Delete mutation failed", {
        error: err,
        errorMessage: err.message,
        variables
      });
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
      toast.error("Failed to delete comment");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(data?.comment || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(data?.comment || "");
  };

  const handleDelete = () => {
    console.log("🔥 CommentSection: Delete confirmation clicked", {
      commentId: data?.id,
      commentData: data,
      isTemporary: data?.id?.startsWith('temp-'),
      postId
    });
    deleteMutate({ commentId: data?.id });
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== data?.comment) {
      editMutate({ commentId: data?.id, newText: editText.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const isOwnComment = data?.authorId === currentUser?.id;

  // Memoize dropdown items to prevent recreation
  const dropdownItems = useMemo(() => [
    {
      key: "edit",
      label: "Edit",
      icon: <Iconify icon="ph:pencil" />,
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete comment"
          description="Are you sure you want to delete this comment?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
          placement="left"
        >
          <span style={{ color: "red" }}>Delete</span>
        </Popconfirm>
      ),
      icon: <Iconify icon="ph:trash" style={{ color: "red" }} />,
      danger: true,
    },
  ], [handleEdit, handleDelete]);

  return (
    <Box
      className={cx(css.comment, {
        [css.commentDark]: theme === "dark",
      })}
    >
      <Flex gap={"1rem"} align="flex-start">
        {/* avatar */}
        <Avatar 
          src={getMainProfileImage(data?.author?.images)} 
          size={32}
          style={{ minWidth: "32px" }}
        >
          {data?.author?.firstName?.[0] || data?.author?.username?.[0]}
        </Avatar>

        <Flex vertical style={{ width: "100%" }}>
          {/* author name and comment */}
          <Flex justify="space-between" align="flex-start">
            <Flex vertical>
              <Typography.Text strong className="typoCaption">
                {`${data?.author?.first_name || data?.author?.firstName || ""} ${
                  data?.author?.last_name || data?.author?.lastName || ""
                }`.trim() || data?.author?.username || "Anonymous"}
                {data?.edited && (
                  <Typography.Text className="typoCaption" style={{ color: "#999", marginLeft: "8px" }}>
                    (edited)
                  </Typography.Text>
                )}
              </Typography.Text>
              {isEditing ? (
                <Flex vertical gap="8px" style={{ marginTop: "4px" }}>
                  <Input.TextArea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    maxLength={500}
                    disabled={isEditPending}
                  />
                  <Flex gap="8px">
                    <Button 
                      size="small" 
                      type="primary" 
                      onClick={handleSaveEdit}
                      loading={isEditPending}
                      disabled={!editText.trim() || editText.trim() === data?.comment}
                    >
                      Save
                    </Button>
                    <Button 
                      size="small" 
                      onClick={handleCancelEdit}
                      disabled={isEditPending}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Typography.Text className="typoBody2" style={{ marginTop: "2px" }}>
                  {data?.comment}
                </Typography.Text>
              )}
            </Flex>

            {/* dropdown menu for owner */}
            {isOwnComment && !isEditing && (
              <Dropdown
                menu={{ items: dropdownItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<Iconify icon="ph:dots-three-vertical" />}
                  disabled={isDeletePending}
                />
              </Dropdown>
            )}
          </Flex>

          {/* time */}
          <Typography.Text className="typoCaption" style={{ color: "#999", marginTop: "4px" }}>
            {dayjs(data?.createdAt).fromNow()}
          </Typography.Text>
        </Flex>
      </Flex>
    </Box>
  );
});
