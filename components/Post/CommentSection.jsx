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

const CommentSection = ({ comments: initialComments, postId, queryId, postAuthorId }) => {
  const [expanded, setExpanded] = useState(false);
  const [parent] = useAutoAnimate();
  
  // Use only the comments from props (query cache) - no local state
  const comments = initialComments || [];

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

  // Memoize has comments to prevent unnecessary re-renders
  const hasComments = useMemo(() => comments && comments.length > 0, [comments]);

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
                postId={postId}
                queryId={queryId}
                postAuthorId={postAuthorId}
              />
            ) : (
              comments?.map((comment, index) => (
                <Comment
                  key={comment.id || index}
                  data={comment}
                  postId={postId}
                  queryId={queryId}
                  postAuthorId={postAuthorId}
                />
              ))
            )}
          </Flex>
        )}
        
        {comments?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>
            No comments yet. Be the first to comment!
          </div>
        )}
      </>

      <CommentInput
        queryId={queryId}
        postId={postId}
        setExpanded={setExpanded}
        postAuthorId={postAuthorId}
      />
    </Flex>
  );
};

export default CommentSection;

const Comment = React.memo(function Comment({ data, postId, queryId, postAuthorId }) {
  const {
    settings: { theme },
  } = useContext(SettingsContext);
  
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data?.comment || "");
  
  // Create the correct query key that matches Posts.jsx
  const queryKey = useMemo(() => ["posts", queryId, currentUser?.id], [queryId, currentUser?.id]);

  // Edit comment mutation
  const { mutate: editMutate, isPending: isEditPending } = useMutation({
    mutationFn: ({ commentId, newText }) => editComment(postId, commentId, newText, currentUser?.id),
    onMutate: async ({ commentId, newText }) => {
      // Update query cache optimistically
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
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
        queryClient.setQueryData(queryKey, context.previousPosts);
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
      
      // Update query cache optimistically
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
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
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
      toast.error("Failed to delete comment");
    },
  });

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(data?.comment || "");
  }, [data?.comment]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText(data?.comment || "");
  }, [data?.comment]);

  const handleDelete = useCallback(() => {
    console.log("🔥 CommentSection: Delete confirmation clicked", {
      commentId: data?.id,
      commentData: data,
      isTemporary: data?.id?.startsWith('temp-'),
      postId
    });
    deleteMutate({ commentId: data?.id });
  }, [data?.id, data, postId, deleteMutate]);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim() !== data?.comment) {
      editMutate({ commentId: data?.id, newText: editText.trim() });
    } else {
      setIsEditing(false);
    }
  }, [editText, data?.comment, data?.id, editMutate]);

  const isOwnComment = data?.authorId === currentUser?.id;
  const isPostAuthor = postAuthorId === currentUser?.id;
  const canModerateComment = isOwnComment || isPostAuthor;

  // Memoize dropdown items to prevent recreation
  const dropdownItems = useMemo(() => {
    const items = [];
    
    // Only comment author can edit
    if (isOwnComment) {
      items.push({
        key: "edit",
        label: "Edit",
        icon: <Iconify icon="ph:pencil" />,
        onClick: handleEdit,
      });
    }
    
    // Both comment author and post author can delete
    if (canModerateComment) {
      items.push({
        key: "delete",
        label: (
          <Popconfirm
            title="Delete comment"
            description={isPostAuthor && !isOwnComment 
              ? "As the post author, you can moderate this comment. Are you sure you want to delete it?"
              : "Are you sure you want to delete this comment?"
            }
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <span style={{ color: "red" }}>
              {isPostAuthor && !isOwnComment ? "Moderate (Delete)" : "Delete"}
            </span>
          </Popconfirm>
        ),
        icon: <Iconify icon="ph:trash" style={{ color: "red" }} />,
        danger: true,
      });
    }
    
    return items;
  }, [handleEdit, handleDelete, isOwnComment, isPostAuthor, canModerateComment]);

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
                {(() => {
                  const firstName = data?.author?.first_name || data?.author?.firstName || "";
                  const lastName = data?.author?.last_name || data?.author?.lastName || "";
                  const fullName = `${firstName} ${lastName}`.trim();
                  const username = data?.author?.username;
                  
                  // Debug logging
                  console.log("🏷️ Comment author display:", {
                    commentId: data?.id,
                    authorId: data?.authorId,
                    firstName,
                    lastName, 
                    fullName,
                    username,
                    authorData: data?.author
                  });
                  
                  if (fullName && fullName !== "Unknown User") {
                    return fullName;
                  }
                  if (username && username !== "unknown") {
                    return username;
                  }
                  return "Anonymous";
                })()}
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

            {/* dropdown menu for comment/post author */}
            {canModerateComment && !isEditing && dropdownItems.length > 0 && (
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
                  title={isPostAuthor && !isOwnComment ? "Moderate comment" : "Manage comment"}
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
