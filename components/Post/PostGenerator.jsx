"use client";
import React, { useRef, useState } from "react";
import css from "@/styles/PostGenerator.module.css";
import Box from "../Box";
import { Avatar, Button, Flex, Image, Input, Spin, Typography, Divider, Card, Modal } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import Iconify from "../Iconify";
import { createPost } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useFirebaseAuth";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { useLanguage } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { useDailyUsageTracking } from "@/hooks/useDailyUsageTracking";
import { hasReachedDailyLimit, canPerformAction } from "@/utils/premiumHelpers";
import { useSettingsContext } from "@/context/settings/settings-context";
import { getUserLimits } from "@/utils/premiumHelpers";
import { now } from "@/utils/dateHelpers";

const YDestinyPrompts = [
  "Ce emoție te domină azi?",
  "La ce te gândești chiar acum?",
  "Ce te-ar bucura cel mai mult astăzi?",
  "Dacă ai putea schimba ceva azi, ce ar fi?",
  "Ce ți-ar plăcea să afle ceilalți despre tine?",
  "Ce moment ți-a adus un zâmbet astăzi?",
  "Împărtășește o mică bucurie sau un mic triumf!",
  "Cum e partenerul perfect pentru tine acum? – 3 calități",
  "Ce este cel mai important într-o relație pentru tine?"
];

const PostGenerator = () => {
  const { t } = useLanguage();
  const imgInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // [image, video]
  const [postText, setPostText] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { subscription, isPremium } = useSubscription();
  const { dailyUsage, incrementUsage } = useDailyUsageTracking();

  const canPost = canPerformAction('DAILY_POSTS', dailyUsage, subscription);

  const { mutate: execute, isPending } = useMutation({
    mutationFn: (data) => {
      console.log("🔥 PostGenerator: Starting createPost mutation", {
        postText: data.postText?.substring(0, 50) + "...",
        hasMedia: !!data.media,
        authorId: user?.id,
        userData: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName
        }
      });
      return createPost({ ...data, authorId: user?.id });
    },
    onMutate: async (newPost) => {
      console.log("🔄 PostGenerator: onMutate - Starting optimistic update", {
        postText: newPost.postText?.substring(0, 50) + "...",
        hasMedia: !!newPost.media,
        userId: user?.id
      });
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(["posts", "all", user?.id]);
      console.log("📊 Previous posts data:", {
        exists: !!previousPosts,
        hasPages: !!previousPosts?.pages,
        firstPageDataLength: previousPosts?.pages?.[0]?.data?.length
      });

      // Optimistically update to the new value
      if (previousPosts) {
        const optimisticPost = {
          id: `temp-${Date.now()}`,
          postText: newPost.postText || '',
          media: newPost.media,
          authorId: user?.id,
          createdAt: now(),
          updatedAt: now(),
          edited: false,
          likes: [],
          likesCount: 0,
          commentsCount: 0,
          isVisible: true,
          author: {
            id: user?.id,
            first_name: user?.firstName,
            last_name: user?.lastName,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            image_url: getMainProfileImage(user?.images),
            images: user?.images
          },
          comments: []
        };

        console.log("📝 Created optimistic post:", {
          id: optimisticPost.id,
          hasText: !!optimisticPost.postText,
          hasMedia: !!optimisticPost.media
        });

        queryClient.setQueryData(["posts", "all", user?.id], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: [
              {
                data: [optimisticPost, ...(old.pages[0]?.data || [])],
                metaData: old.pages[0]?.metaData || { hasNextPage: false, lastCursor: null }
              },
              ...old.pages.slice(1)
            ]
          };
        });
        console.log("✅ PostGenerator: Optimistic update completed");
      } else {
        console.log("⚠️ No previous posts data found, skipping optimistic update");
      }

      return { previousPosts };
    },
    onSuccess: (result) => {
      console.log("✅ PostGenerator: Post creation successful", {
        result,
        postId: result?.post?.id,
        success: result?.success
      });
      handleSuccess();
      // Increment daily usage counter
      incrementUsage('DAILY_POSTS');
      // Invalidate all posts queries to refresh with real data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      console.log("🔄 PostGenerator: Invalidated posts queries");
    },
    onError: (err, newPost, context) => {
      console.error("❌ PostGenerator: Post creation failed", {
        error: err,
        errorMessage: err.message,
        postText: newPost?.postText?.substring(0, 50) + "...",
        hasMedia: !!newPost?.media
      });
      
      // Restore previous data on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", "all", user?.id], context.previousPosts);
        console.log("🔄 PostGenerator: Restored previous posts data");
      }
      showError("Something wrong happened. Try again!");
    },
  });

  const handleSuccess = () => {
    console.log("🎉 PostGenerator: handleSuccess called - cleaning up form");
    setSelectedFile(null);
    setFileType(null);
    setPostText("");
    setSelectedPrompt(null);
    toast.success("Postarea ta a fost partajată pe Calea Destinului! ✨");
    console.log("✅ PostGenerator: Form cleaned up and success message shown");
  };

  const handlePromptSelect = (prompt) => {
    setPostText(prompt + " ");
    setSelectedPrompt(prompt);
    setShowPrompts(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    // put a limit of 5mb file size
    if (file && file.size > 5 * 1024 * 1024) {
      console.log("File size is too big");
      return;
    }

    if (
      file &&
      (file.type.startsWith("image/") || file.type.startsWith("video/"))
    ) {
      setFileType(file.type.split("/")[0]);

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        setSelectedFile(reader.result);
      };
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
  };

  const showError = (content = "Something went wrong! Try again.") => {
    toast.error(content);
  };

  function handleSubmitPost() {
    console.log("🚀 PostGenerator: handleSubmitPost called", {
      postText: postText?.substring(0, 50) + "...",
      hasSelectedFile: !!selectedFile,
      postTextEmpty: postText === "" || !postText,
      canPerform: canPost.canPerform,
      user: {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName
      }
    });
    
    if ((postText === "" || !postText) && !selectedFile) {
      console.error("❌ Empty post attempted");
      showError("Nu poți face o postare goală");
      return;
    }

    // Check daily limit for free users
    if (!canPost.canPerform) {
      console.warn("⚠️ Daily post limit reached, showing modal");
      setShowLimitModal(true);
      return;
    }

    console.log("🎯 Executing post creation...");
    // don't forget to tell about the next.config.js file where we have set the limit of 5mb
    execute({ postText, media: selectedFile });
  }

  return (
    <>
      <Spin
        spinning={isPending}
        tip={
          <Typography className="typoBody1" style={{ marginTop: "1rem" }}>
            {t('posts.publishingOnDestinyPath')}
          </Typography>
        }
      >
        <div className={css.postGenWrapper}>
          <Box className={css.container}>
            {/* Header with YDestiny branding */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Iconify icon="eva:star-fill" width="24px" style={{ color: '#FFD700' }} />
                <Typography.Title level={4} style={{ margin: 0, color: 'white', fontSize: '18px' }}>
                  {t('posts.destinyPath')}
                </Typography.Title>
                <Iconify icon="eva:star-fill" width="24px" style={{ color: '#FFD700' }} />
              </div>
              <Typography.Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                {t('posts.shareThoughts')}
              </Typography.Text>
            </div>

            <Flex gap={"1rem"} align={"flex-start"} vertical>
              {/* avatar */}

              <Flex style={{ width: "100%" }} gap={"1rem"}>
                <Avatar
                  src={getMainProfileImage(user?.images)}
                  style={{
                    boxShadow: "var(--avatar-shadow)",
                    width: "2.6rem",
                    height: "2.6rem",
                  }}
                >
                  {user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
                </Avatar>

                <Input.TextArea
                  // maxLength={100}
                  placeholder={selectedPrompt || "Împărtășește ce simți în această clipă..."}
                  style={{ height: 80, resize: "none", flex: 1 }}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  disabled={!canPost.canPerform}
                />
              </Flex>

              {/* YDestiny Prompts */}
              <div style={{ width: '100%' }}>
                <Button 
                  type="text" 
                  onClick={() => setShowPrompts(!showPrompts)}
                  style={{ 
                    marginBottom: '12px',
                    border: '1px dashed #667eea',
                    borderRadius: '8px',
                    background: showPrompts ? '#667eea15' : 'transparent'
                  }}
                  disabled={!canPost.canPerform}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify icon="eva:bulb-fill" width="16px" style={{ color: '#667eea' }} />
                    <Typography.Text style={{ color: '#667eea' }}>
                      {showPrompts ? 'Ascunde inspirația' : 'Inspirație pentru postare'}
                    </Typography.Text>
                    <Iconify 
                      icon={showPrompts ? "eva:chevron-up-fill" : "eva:chevron-down-fill"} 
                      width="16px" 
                      style={{ color: '#667eea' }} 
                    />
                  </Flex>
                </Button>

                {showPrompts && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {YDestinyPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        type="text"
                        size="small"
                        onClick={() => handlePromptSelect(prompt)}
                        style={{
                          textAlign: 'left',
                          height: 'auto',
                          whiteSpace: 'normal',
                          padding: '8px 12px',
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px',
                          background: selectedPrompt === prompt ? '#667eea15' : '#fafafa',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPrompt !== prompt) {
                            e.target.style.background = '#667eea10';
                            e.target.style.borderColor = '#667eea';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPrompt !== prompt) {
                            e.target.style.background = '#fafafa';
                            e.target.style.borderColor = '#f0f0f0';
                          }
                        }}
                      >
                        <Typography.Text 
                          style={{ 
                            fontSize: '13px',
                            color: selectedPrompt === prompt ? '#667eea' : '#666'
                          }}
                        >
                          {prompt}
                        </Typography.Text>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* file preview */}
              {fileType && (
                <div className={css.previewContainer}>
                  {/* remove button */}
                  <Button
                    type="default"
                    className={css.remove}
                    style={{ position: "absolute" }}
                  >
                    <Typography
                      className="typoCaption"
                      onClick={handleRemoveFile}
                    >
                      Remove
                    </Typography>
                  </Button>

                  {/* media preview */}
                  {fileType === "image" && (
                    <Image
                      src={selectedFile}
                      className={css.preview}
                      alt="preview"
                      height={"350px"}
                      width={"100%"}
                    />
                  )}
                  {fileType === "video" && (
                    <video
                      className={css.preview}
                      controls
                      src={selectedFile}
                    />
                  )}
                </div>
              )}

              {/* buttons Container */}
              <div className={css.buttonsContainer}>
                {/* image upload button */}
                <Button
                  type="text"
                  className={css.photoButton}
                  onClick={() => imgInputRef.current.click()}
                  disabled={!canPost.canPerform}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify
                      icon="solar:camera-linear"
                      width="1.2rem"
                      color="#667eea"
                    />
                    <Typography className="typoSubtitle2" style={{ color: "#667eea" }}>Fotografie</Typography>
                  </Flex>
                </Button>

                <Button
                  className={css.shareButton}
                  onClick={handleSubmitPost}
                  disabled={!canPost.canPerform}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify icon="eva:star-fill" width="1.2rem" style={{ color: "white" }} />
                    <Typography
                      className="typoSubtitle2"
                      style={{ color: "white" }}
                    >
                      Împărtășește
                    </Typography>
                  </Flex>
                </Button>
              </div>
            </Flex>
          </Box>
        </div>
      </Spin>

      {/* Premium Upgrade Modal */}
      <Modal
        open={showLimitModal}
        onCancel={() => setShowLimitModal(false)}
        footer={null}
        centered
        width={400}
        className="premium-modal"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <CrownOutlined style={{ color: '#FFD700' }} />
          </div>
          
          <Typography.Title level={3} style={{ marginBottom: '16px' }}>
            Ai atins limita zilnică
          </Typography.Title>
          
          <Typography.Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
            Utilizatorii free pot posta doar <strong>{canPost.limit} postări pe zi</strong>.
            Ai folosit toate postările disponibile pentru astăzi.
          </Typography.Paragraph>
          
          <div style={{ 
            background: '#f0f2f5', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <Typography.Text strong style={{ fontSize: '16px' }}>
              Upgrade la Premium pentru:
            </Typography.Text>
            <ul style={{ textAlign: 'left', marginTop: '8px', marginBottom: 0 }}>
              <li>Postări nelimitate</li>
              <li>Vizualizări feed nelimitate</li>
              <li>Match-uri nelimitate</li>
              <li>Și multe alte beneficii!</li>
            </ul>
          </div>
          
          <Button 
            type="primary" 
            size="large"
            block
            onClick={() => {
              setShowLimitModal(false);
              window.location.href = '/premium';
            }}
            style={{ 
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000'
            }}
          >
            <CrownOutlined /> Upgrade la Premium
          </Button>
          
          <Button 
            type="text" 
            block
            onClick={() => setShowLimitModal(false)}
            style={{ marginTop: '12px' }}
          >
            Mai târziu
          </Button>
        </div>
      </Modal>

      {/* make an input to only accept img files and max number of files as 1 */}
      <input
        type="file"
        accept="image/*"
        multiple={false}
        style={{ display: "none" }}
        ref={imgInputRef}
        onChange={(e) => handleFileChange(e)}
      />
    </>
  );
};

export default PostGenerator;
