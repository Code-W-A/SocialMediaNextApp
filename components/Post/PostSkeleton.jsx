"use client";
import React from "react";
import { Card, Skeleton, Typography, Flex } from "antd";
import Box from "../Box";
import css from "@/styles/Post.module.css";
import { useLanguage } from "@/lib/i18n";

const { Text } = Typography;

const PostSkeleton = ({ isDeleting = false, isDeletingWithImage = false }) => {
  const { t } = useLanguage();

  return (
    <div className={css.wrapper}>
      <Box>
        <div className={css.container}>
          {isDeleting ? (
            // Deleting state - show blurred content with overlay
            <div style={{ position: 'relative' }}>
              {/* Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 10,
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #ff4d4f',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <Text style={{ 
                  color: '#ff4d4f', 
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  {t('posts.deletingPost')}
                </Text>
              </div>

              {/* Blurred content behind */}
              <div style={{ filter: 'blur(3px)', opacity: 0.7 }}>
                {/* Profile info skeleton */}
                <Flex align="center" justify="space-between" style={{ marginBottom: '16px' }}>
                  <Flex gap={".5rem"} align="center">
                    <Skeleton.Avatar size={40} active />
                    <div>
                      <Skeleton.Input style={{ width: 120, height: 16 }} active size="small" />
                      <Skeleton.Input style={{ width: 80, height: 12, marginTop: 4 }} active size="small" />
                    </div>
                  </Flex>
                  <Skeleton.Button style={{ width: 32, height: 32 }} active size="small" />
                </Flex>

                {/* Post text skeleton */}
                <Skeleton paragraph={{ rows: 2, width: ['100%', '80%'] }} title={false} active />
                
                {/* Image skeleton if post had image */}
                {isDeletingWithImage && (
                  <Skeleton.Image style={{ width: '100%', height: 300, marginTop: '16px' }} active />
                )}

                {/* Actions skeleton */}
                <Flex align="center" justify="space-between" style={{ marginTop: '16px' }}>
                  <Flex gap="1rem">
                    <Skeleton.Button style={{ width: 60 }} active size="small" />
                    <Skeleton.Button style={{ width: 60 }} active size="small" />
                  </Flex>
                  <Skeleton.Button style={{ width: 40 }} active size="small" />
                </Flex>
              </div>
            </div>
          ) : (
            // Regular loading skeleton
            <>
              {/* Profile info skeleton */}
              <Flex align="center" justify="space-between" style={{ marginBottom: '16px' }}>
                <Flex gap={".5rem"} align="center">
                  <Skeleton.Avatar size={40} active />
                  <div>
                    <Skeleton.Input style={{ width: 120, height: 16 }} active size="small" />
                    <Skeleton.Input style={{ width: 80, height: 12, marginTop: 4 }} active size="small" />
                  </div>
                </Flex>
                <Skeleton.Button style={{ width: 32, height: 32 }} active size="small" />
              </Flex>

              {/* Post text skeleton */}
              <Skeleton paragraph={{ rows: 3, width: ['100%', '90%', '75%'] }} title={false} active />
              
              {/* Image skeleton (random chance for variation) */}
              {Math.random() > 0.5 && (
                <Skeleton.Image style={{ width: '100%', height: 300, marginTop: '16px' }} active />
              )}

              {/* Actions skeleton */}
              <Flex align="center" justify="space-between" style={{ marginTop: '16px' }}>
                <Flex gap="1rem">
                  <Skeleton.Button style={{ width: 60 }} active size="small" />
                  <Skeleton.Button style={{ width: 60 }} active size="small" />
                </Flex>
                <Skeleton.Button style={{ width: 40 }} active size="small" />
              </Flex>

              {/* Comments skeleton */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <Flex gap="8px" style={{ marginBottom: '12px' }}>
                  <Skeleton.Avatar size={24} active />
                  <Skeleton.Input style={{ width: '70%', height: 20 }} active size="small" />
                </Flex>
                <Flex gap="8px">
                  <Skeleton.Avatar size={24} active />
                  <Skeleton.Input style={{ width: '60%', height: 20 }} active size="small" />
                </Flex>
              </div>
            </>
          )}
        </div>
      </Box>

      {/* CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PostSkeleton; 