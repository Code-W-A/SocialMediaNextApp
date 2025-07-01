import { Avatar, Button, Flex, Input } from "antd";
import React, { useState, useMemo } from "react";
import Iconify from "../Iconify";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import CommentDialog from "./CommentDialog";

const CommentInput = ({ postId, setExpanded, queryId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useUser();
  
  // Memoized user profile image to prevent recalculation
  const userProfileImage = useMemo(() => getMainProfileImage(user?.images), [user?.images]);

  // Handle opening comment dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // Handle closing comment dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

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

        {/* Fake input trigger */}
        <Input
          placeholder="Write a comment..."
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
      <CommentDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        postId={postId}
        setExpanded={setExpanded}
        queryId={queryId}
      />
    </>
  );
};

export default CommentInput;
