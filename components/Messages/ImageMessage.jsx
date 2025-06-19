"use client";
import React from "react";
import { Image, Typography } from "antd";

const ImageMessage = ({ messageItem, isCurrentUser }) => {
  const { imageUrl, imageName, caption } = messageItem;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '280px'
    }}>
      {/* Image */}
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #f0f0f0'
      }}>
        <Image
          src={imageUrl}
          alt={imageName || "Shared image"}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '300px',
            objectFit: 'cover'
          }}
          preview={{
            mask: false,
            toolbarRender: () => null
          }}
        />
      </div>

      {/* Caption */}
      {caption && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: isCurrentUser ? 'transparent' : 'rgba(0,0,0,0.02)',
          borderRadius: '8px'
        }}>
          <Typography.Text 
            style={{ 
              fontSize: '14px',
              lineHeight: '1.4',
              wordBreak: 'break-word'
            }}
          >
            {caption}
          </Typography.Text>
        </div>
      )}
    </div>
  );
};

export default ImageMessage; 