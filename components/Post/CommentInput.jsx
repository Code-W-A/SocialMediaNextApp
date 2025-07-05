import { Avatar, Button, Flex, Input, Typography, Alert } from "antd";
import React, { useState, useMemo, useEffect } from "react";
import Iconify from "../Iconify";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import CommentDialog from "./CommentDialog";
import { canUserComment } from "@/actions/post";
import { useLanguage } from "@/lib/i18n";

const CommentInput = ({ postId, setExpanded, queryId, postAuthorId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commentPermission, setCommentPermission] = useState({ canComment: true, reason: "" });
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const { user } = useUser();
  const { t } = useLanguage();
  
  // Memoized user profile image to prevent recalculation
  const userProfileImage = useMemo(() => getMainProfileImage(user?.images), [user?.images]);

  // Check if user can comment on this post
  useEffect(() => {
    const checkCommentPermission = async () => {
      if (!user?.id || !postId) {
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

    checkCommentPermission();
  }, [postId, user?.id]);

  // Handle opening comment dialog
  const handleOpenDialog = () => {
    if (commentPermission.canComment) {
      setDialogOpen(true);
    }
  };

  // Handle closing comment dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Show loading state while checking permissions
  if (isCheckingPermission) {
    return (
      <Flex gap={"1rem"} align="center">
        <Avatar 
          src={userProfileImage} 
          size={40} 
          style={{ minWidth: "40px" }}
        >
          {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
        </Avatar>
        <Input
          placeholder={t('comments.checkingPermissions')}
          disabled
          style={{ 
            flex: 1, 
            backgroundColor: '#f5f5f5'
          }}
        />
      </Flex>
    );
  }

  // Show restriction message if user cannot comment
  if (!commentPermission.canComment) {
    return (
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
        type="info"
        showIcon
        style={{ marginTop: '8px' }}
      />
    );
  }

  return (
    <>
      <Flex gap={"1rem"} align="center">
        {/* avatar */}
        <Avatar 
          src={userProfileImage} 
          size={40} 
          style={{ minWidth: "40px" }}
        >
          {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
        </Avatar>

        {/* Input trigger */}
        <Input
          placeholder="Scrie un comentariu..."
          readOnly
          onClick={handleOpenDialog}
          style={{ 
            flex: 1, 
            cursor: 'pointer',
            backgroundColor: '#fafafa'
          }}
          suffix={
            <Button
              type="text"
              size="small"
              icon={<Iconify icon="ph:chat-circle-fill" width="16px" style={{ color: '#667eea' }} />}
              onClick={handleOpenDialog}
              style={{ border: 'none', padding: '4px' }}
            />
          }
        />
      </Flex>

      {/* Comment Dialog */}
      {commentPermission.canComment && (
        <CommentDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          postId={postId}
          setExpanded={setExpanded}
          queryId={queryId}
        />
      )}
    </>
  );
};

export default CommentInput;
