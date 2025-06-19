"use client";
import { Button, Flex, Typography } from "antd";
import React from "react";
import Iconify from "../Iconify";

const CommentButton = ({ comments }) => {
  return (
    <Button
      size="small"
      style={{ 
        background: "transparent", 
        border: "none", 
        boxShadow: "none",
        padding: '4px 8px'
      }}
    >
      <Flex gap={".5rem"} align="center">
        <Iconify
          icon="eva:message-circle-fill"
          width={"20px"}
          style={{ color: "#764ba2" }}
        />

        <Typography.Text className="typoBody2" style={{ color: "#764ba2" }}>
          {comments === 0 
            ? "Comentează" 
            : comments === 1 
              ? "1 comentariu" 
              : `${comments} comentarii`
          }
        </Typography.Text>
      </Flex>
    </Button>
  );
};

export default CommentButton;
