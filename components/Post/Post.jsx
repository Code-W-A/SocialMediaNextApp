"use client";
import React, { useState, useMemo } from "react";
import css from "@/styles/Post.module.css";
import Box from "../Box";
import PostSkeleton from "./PostSkeleton";
import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  Image,
  Popconfirm,
  Typography,
  Input,
  message,
} from "antd";
// import Image from "next/image";
import CommentButton from "./CommentButton";
import CommentSection from "./CommentSection";
import dayjs from "dayjs";
import { getFileTypeFromUrl } from "@/utils";
import Link from "next/link";
import { useUser } from "@/hooks/useFirebaseAuth";
import Iconify from "../Iconify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost, editPost } from "@/actions/post";
import { getUserDisplayName, getDisplayName } from "@/utils/profileHelpers";
import LikeButton from "./LikeButton";
import { getMainProfileImage } from "@/utils/imageHelpers";
import PremiumBadge from "../PremiumBadge";
import { useLanguage } from "@/lib/i18n";

const Post = ({ data, queryId }) => {
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data?.postText || "");
  const [isDeleting, setIsDeleting] = useState(false);

  // Create the correct query key that matches Posts.jsx
  const queryKey = useMemo(() => ["posts", queryId, currentUser?.id], [queryId, currentUser?.id]);

  const { mutate } = useMutation({
    mutationFn: () => {
      console.log("🗑️ Post component: Starting delete mutation", { 
        postId: data?.id, 
        userId: currentUser?.id,
        postData: data,
        queryId: queryId,
        queryKey: queryKey
      });
      console.log("📡 About to call deletePost server action...");
      return deletePost(data?.id, currentUser?.id);
    },

    // Remove optimistic updates to prevent UI disappearing before Firebase deletion
    onMutate: async () => {
      console.log("🔄 Post component: Starting delete - setting loading state");
      setIsDeleting(true); // Set loading state immediately
      
      // Don't do optimistic updates anymore to prevent the issue
      // where UI disappears before Firebase deletion completes
      return null;
    },

    onError: (err, variables, context) => {
      console.error("❌ Post component: Delete mutation failed", {
        error: err,
        errorMessage: err.message,
        variables,
        postId: data?.id
      });
      
      // Reset loading state
      setIsDeleting(false);
      
      // Show error message
      message.error(t('posts.postDeleteFailed'));
    },

    onSuccess: (result) => {
      console.log("✅ Post component: Delete mutation successful", {
        result,
        postId: data?.id
      });
      
      // Show success message
      message.success(t('posts.postDeleted'));
      
      // Reset loading state (though component will unmount)
      setIsDeleting(false);
      
      // Invalidate queries to refresh the feed
      queryClient.invalidateQueries(queryKey);
    },

    onSettled: () => {
      console.log("🔄 Post component: onSettled - cleaning up");
      setIsDeleting(false);
    },
  });

  const { mutate: editMutate } = useMutation({
    mutationFn: ({ postId, newText }) => {
      console.log("✏️ Post component: Starting edit mutation", { 
        postId, 
        newText: newText?.substring(0, 50) + "...",
        userId: currentUser?.id,
        queryKey: queryKey
      });
      return editPost(postId, newText, currentUser?.id);
    },
    onSuccess: (result) => {
      console.log("✅ Post component: Edit mutation successful", {
        result,
        postId: data?.id
      });
      setIsEditing(false);
      queryClient.invalidateQueries(queryKey);
    },
    onError: (err) => {
      console.error("❌ Post component: Edit mutation failed", {
        error: err,
        errorMessage: err.message,
        postId: data?.id
      });
      // Handle edit error silently or with toast
    },
  });

  const handleEdit = () => {
    if (editText.trim() !== data?.postText) {
      editMutate({ postId: data?.id, newText: editText.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(data?.postText || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log("🔥 Post component: Delete confirmation clicked", {
      postId: data?.id,
      userId: currentUser?.id,
      isOwner: data?.authorId === currentUser?.id,
      queryId: queryId
    });
    mutate();
  };

  const items = [
    {
      key: "1",
      label: t('posts.editPost'),
      icon: <Iconify icon="eva:edit-fill" width="16px" />,
      onClick: () => setIsEditing(true),
    },
    {
      key: "2",
      danger: true,
      label: (
        <Popconfirm
          title={t('posts.deletePostConfirmTitle')}
          description={t('posts.deletePostConfirmDescription')}
          onConfirm={handleDelete}
          okText={t('posts.delete')}
          cancelText={t('posts.cancel')}
          okButtonProps={{ danger: true }}
        >
          {t('posts.deletePost')}
        </Popconfirm>
      ),
    },
  ];

  // Function to get author display name with fallbacks for URL
  const getAuthorDisplayName = (author) => {
    return getUserDisplayName(author);
  };

  // Show skeleton when deleting
  if (isDeleting) {
    return (
      <PostSkeleton 
        isDeleting={true} 
        isDeletingWithImage={!!data?.media} 
      />
    );
  }

  return (
    <div className={css.wrapper}>
      <Box>
        <div className={css.container}>
          {/* profile info */}
          <Flex align="center" justify="space-between">
            <Flex gap={".5rem"} align="center">
              <Link
                href={`/profile/${data?.author?.id}?person=${getAuthorDisplayName(data?.author)}`}
                passHref
              >
                <Avatar
                  size={40}
                  src={
                    currentUser?.id === data?.authorId
                      ? getMainProfileImage(currentUser?.images)
                      : getMainProfileImage(data?.author?.images) || data?.author?.image_url
                  }
                >
                  {data?.author?.first_name?.[0] || data?.author?.firstName?.[0] || data?.author?.username?.[0] || data?.author?.email?.[0]}
                </Avatar>
              </Link>

              {/* name and post date */}
              <Flex vertical>
                <Link
                  href={`/profile/${data?.author?.id}?person=${getAuthorDisplayName(data?.author)}`}
                  passHref
                >
                  <Typography className="typoSubtitle2">
                    {getDisplayName(data?.author)}
                  </Typography>
                </Link>
                <Typography.Text
                  className="typoCaption"
                  type="secondary"
                  strong
                >
                  {dayjs(data?.createdAt || data?.created_at).format("DD MMM YYYY")}
                </Typography.Text>
              </Flex>
            </Flex>

            {data?.authorId === currentUser?.id && (
              <Dropdown menu={{ items }} trigger={"click"}>
                <Button ghost shape="circle">
                  <Typography>
                    <Iconify icon="akar-icons:more-vertical" width={20} />
                  </Typography>
                </Button>
              </Dropdown>
            )}
          </Flex>

          {/* caption */}
          {isEditing ? (
            <div style={{ marginBottom: '1rem' }}>
              <Input.TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Actualizează postarea ta..."
                autoSize={{ minRows: 3, maxRows: 6 }}
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
                  disabled={!editText.trim() || editText.trim() === data?.postText}
                >
                  Save Changes
                </Button>
              </Flex>
            </div>
          ) : (
            <div>
              <Typography.Text className="typoBody2">
                <div
                  dangerouslySetInnerHTML={{
                    __html: (data?.postText)?.replace(/\n/g, "<br/>"),
                  }}
                ></div>
              </Typography.Text>
              {data?.edited && (
                <Typography.Text 
                  type="secondary" 
                  style={{ fontSize: '12px', fontStyle: 'italic', marginLeft: '8px' }}
                >
                  (edited)
                </Typography.Text>
              )}
            </div>
          )}

          {/* media */}
          {getFileTypeFromUrl(data?.media) === "image" && data?.media && (
            <div className={css.media}>
              <Image
                preview={{ mask: null }}
                src={data?.media}
                alt="post image"
                style={{ 
                  width: "100%",
                  height: "auto",
                  maxHeight: "500px",
                  objectFit: "contain",
                  borderRadius: "1rem"
                }}
                fallback="/images/placeholder-image.png"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          {getFileTypeFromUrl(data?.media) === "video" && (
            <div className={css.media}>
              <video
                src={data?.media}
                controls
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}

          {/* actions */}
          <Flex
            align="center"
            justify="space-between"
            style={{ padding: ".5rem 0rem" }}
          >
            {/* left side reactions and comment */}
            <Flex>
              <LikeButton
                postId={data?.id}
                likes={data?.likes}
                queryId={queryId}
              />
              <CommentButton comments={data?.comments?.length} />
            </Flex>

            {/* right side compatibility and share */}
            <Flex gap={".5rem"}>
              {/* Compatibility button - only show for other users */}
              {data?.authorId !== currentUser?.id && (
                <Link href={`/profile/${data?.authorId}?person=${getAuthorDisplayName(data?.author)}`} passHref>
                  <Button
                    size="small"
                    style={{
                      background: "linear-gradient(135deg, #667eea15, #764ba215)",
                      border: "1px solid #667eea30",
                      borderRadius: "6px",
                      color: "#667eea"
                    }}
                  >
                    <Flex align="center" gap={".3rem"}>
                      <Iconify icon="eva:heart-fill" width="14px" style={{ color: "#667eea" }} />
                      <Typography.Text style={{ fontSize: "12px", color: "#667eea" }}>
                        Compatibilitate
                      </Typography.Text>
                    </Flex>
                  </Button>
                </Link>
              )}

              {/* Share button */}
              {/* <Button
                size="small"
                style={{
                  background: "transparent",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px"
                }}
                onClick={() => {
                  navigator.share?.({
                    title: `${getDisplayName(data?.author)} pe YDestiny`,
                    text: data?.postText,
                    url: window.location.href
                  });
                }}
              >
                <Flex align="center" gap={".3rem"}>
                  <Iconify icon="eva:share-fill" width="14px" style={{ color: "#999" }} />
                  <Typography.Text style={{ fontSize: "12px", color: "#999" }}>
                    Distribuie
                  </Typography.Text>
                </Flex>
              </Button> */}
            </Flex>
          </Flex>

          {/* comments */}
          <CommentSection
            comments={data?.comments}
            expanded={false}
            postId={data?.id}
            queryId={queryId}
            postAuthorId={data?.authorId}
          />
        </div>
      </Box>
    </div>
  );
};

export default Post;
