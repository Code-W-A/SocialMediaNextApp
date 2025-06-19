"use client";
import React, { useEffect, useRef, useState } from "react";
import css from "@/styles/ProfileHead.module.css";
import { Button, Flex, Image, Skeleton, Spin, Tooltip } from "antd";
import Box from "@/components/Box";
import { Typography } from "antd";
import { Icon } from "@iconify/react";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useMutation } from "@tanstack/react-query";
import { updateBanner } from "@/actions/user";
import toast from "react-hot-toast";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { useRouter } from "next/navigation";

const { Text } = Typography;

const ProfileHead = ({
  userId,
  data,
  isLoading,
  isError,
  getDisplayName,
  getUsername,
  onEditProfile,
  isCurrentUserProfile,
}) => {
  const [bannerPreview, setBannerPreview] = useState(false);
  const { user: currentUser } = useUser();
  const router = useRouter();
  const inputRef = useRef(null);
  const [banner, setBanner] = useState(null);

  const { mutate, isPending } = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      toast.success("Banner updated successfully!");
    },
    onError: () => {
      toast.error("Something wrong happened. Try again!");
    },
  });

  useEffect(() => {
    if (data?.data?.banner_url) {
      setBanner(data?.data?.banner_url);
    }
  }, [data, setBanner]);

  // Check if user has completed questionnaire
  const hasCompletedQuestionnaire = () => {
    const userData = data?.data || currentUser;
    
    // Check multiple conditions for questionnaire completion
    const hasQuestionnaireObject = userData?.questionnaire && typeof userData.questionnaire === 'object';
    const hasRequiredFields = userData?.questionnaire?.zodiacSign && 
                             userData?.questionnaire?.birthDate && 
                             userData?.questionnaire?.relationshipType;
    const hasEnoughKeys = userData?.questionnaire && Object.keys(userData.questionnaire).length >= 3;
    
    return hasQuestionnaireObject && (hasRequiredFields || hasEnoughKeys);
  };

  // Handle questionnaire restart
  const handleRestartQuestionnaire = () => {
    router.push('/onboarding/questionnaire');
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    // put a limit of 5mb file size
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image size is greater than 5 MB");
      return;
    }

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        setBanner(reader.result);
        mutate({
          id: currentUser?.id,
          banner: reader.result,
          prevBannerId: data?.data?.banner_id,
        });
      };
    }
  };

  // Function to get profile image with multiple fallbacks
  const getProfileImage = () => {
    if (isCurrentUserProfile) {
      // For current user, try multiple sources
      return getMainProfileImage(currentUser?.images) || 
             currentUser?.imageUrl || 
             currentUser?.image_url || 
             data?.data?.image_url || 
             "/images/placeholder-avatar.png";
    } else {
      // For other users
      return data?.data?.image_url || 
             getMainProfileImage(data?.data?.images) || 
             "/images/placeholder-avatar.png";
    }
  };

  if (isError) return <div>Error loading profile</div>;

  return (
    <div className={css.container}>
      <Spin spinning={isPending}>
        <div className={css.banner} onClick={() => setBannerPreview(true)}>
          <Image
            src={banner || "/images/banner.png"}
            alt="banner"
            preview={{
              mask: null,
              visible: bannerPreview,
              onVisibleChange: (visible) => setBannerPreview(visible),
            }}
            width={"100%"}
            height={"15rem"}
          />

          {isCurrentUserProfile && (
            <div
              className={css.editButton}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                accept="image/*"
                multiple={false}
                ref={inputRef}
                onChange={(e) => handleBannerChange(e)}
                type="file"
                hidden
              />
              <Button
                onClick={() => inputRef.current.click()}
                type="primary"
                shape="circle"
                icon={
                  <Icon icon="fluent:image-edit-20-filled" width={"20px"} />
                }
              />
            </div>
          )}
        </div>
      </Spin>

      <Box>
        <div className={css.footer}>
          {/* profile */}
          <div className={css.profileContainer}>
            <div className={css.profileImage}>
                <Image
                  src={getProfileImage()}
                  alt="profile"
                  preview={{ mask: null }}
                />
              </div>
              <div className={css.profileInfo}>
                {!isLoading ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Text className={"typoH6"}>
                        {getDisplayName ? getDisplayName(data) : "Unknown User"}
                      </Text>
                      {isCurrentUserProfile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {onEditProfile && (
                            <Tooltip title="Edit Profile">
                              <Button
                                type="text"
                                size="small"
                                shape="circle"
                                icon={<Icon icon="eva:edit-2-fill" width="16px" />}
                                onClick={onEditProfile}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  minWidth: '24px',
                                  height: '24px'
                                }}
                              />
                            </Tooltip>
                          )}
                          {hasCompletedQuestionnaire() && (
                            <Tooltip title="Retake Questionnaire">
                              <Button
                                type="text"
                                size="small"
                                shape="circle"
                                icon={<Icon icon="eva:refresh-fill" width="16px" />}
                                onClick={handleRestartQuestionnaire}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  minWidth: '24px',
                                  height: '24px',
                                  color: '#722ed1'
                                }}
                              />
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                    <Text className={"typoBody1"} type="secondary">
                      @{getUsername ? getUsername(data) : "unknown"}
                    </Text>
                    {/* Location only - bio moved to right side */}
                    {data?.data?.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                        <Icon icon="eva:pin-fill" width="14px" color="#666" />
                        <Text className={"typoCaption"} type="secondary">
                          {data.data.location}
                        </Text>
                      </div>
                    )}
                  </>
                ) : (
                  <Skeleton style={{ width: "9rem" }} paragraph={{ rows: 3 }} />
                )}
              </div>
            </div>

          {/* right side - bio and interests */}
          <div className={css.right}>
            
            {!isLoading && data?.data && (
              <div style={{ textAlign: 'right' }}>
                {/* Bio above interests */}
                {data.data.bio && (
                  <div style={{ marginBottom: '1rem' }}>
                    <Text 
                      className={"typoBody2"} 
                      type="secondary"
                      style={{ 
                        maxWidth: '300px',
                        display: 'block',
                        textAlign: 'right'
                      }}
                    >
                      {data.data.bio}
                    </Text>
                  </div>
                )}
                {data.data.interests && data.data.interests.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {data.data.interests.slice(0, 3).join(' • ')}
                      {data.data.interests.length > 3 && ` +${data.data.interests.length - 3} more`}
                    </Text>
                  </div>
                )}
                {data.data.website && (
                  <div>
                    <a 
                      href={data.data.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#1890ff', 
                        textDecoration: 'none',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px'
                      }}
                    >
                      <Icon icon="eva:external-link-fill" width="12px" />
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Box>
    </div>
  );
};

export default ProfileHead;
