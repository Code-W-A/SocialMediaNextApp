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
import PremiumBadge from "@/components/PremiumBadge";
import { hasCompletedQuestionnaire, debugUserData } from '@/utils/onboardingHelpers';

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

  console.log('🎭 [ProfileHead] Component rendered with:', {
    userId,
    isCurrentUserProfile,
    bannerUrl: data?.data?.banner_url,
    currentBanner: banner,
    isLoading
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      console.log('✅ [ProfileHead] Banner updated successfully');
      toast.success("Banner updated successfully!");
    },
    onError: (error) => {
      console.error('❌ [ProfileHead] Banner update failed:', error);
      toast.error("Something wrong happened. Try again!");
    },
  });

  // Reset banner when user changes or component mounts
  useEffect(() => {
    console.log('🔄 [ProfileHead] useEffect triggered - setting banner from data');
    console.log('📊 [ProfileHead] Data banner URL:', data?.data?.banner_url);
    console.log('📊 [ProfileHead] Current banner state:', banner);
    console.log('📊 [ProfileHead] Is loading:', isLoading);
    
    // Only update banner if not loading and data is available
    if (!isLoading && data) {
      if (data?.data?.banner_url) {
        console.log('🖼️ [ProfileHead] Setting banner to:', data.data.banner_url);
        setBanner(data.data.banner_url);
      } else {
        console.log('🚫 [ProfileHead] No banner URL, setting to null');
        setBanner(null);
      }
    } else {
      console.log('⏳ [ProfileHead] Still loading or no data, skipping banner update');
    }
  }, [data?.data?.banner_url, userId, isLoading]); // Added isLoading dependency

  // Additional useEffect to handle profile changes
  useEffect(() => {
    console.log('🔄 [ProfileHead] Profile changed, resetting banner state');
    console.log('📊 [ProfileHead] New userId:', userId);
    
    // Reset banner state when profile changes
    setBanner(null);
    setBannerPreview(false);
  }, [userId]);

  // Check if user has completed questionnaire using centralized function
  const checkQuestionnaireCompletion = () => {
    const userData = data?.data || currentUser;
    console.log("🔍 [ProfileHead] Checking questionnaire completion");
    
    // Use centralized function with consistent logic
    return hasCompletedQuestionnaire(userData);
  };

  // Handle questionnaire restart
  const handleRestartQuestionnaire = () => {
    router.push('/onboarding/questionnaire');
  };

  const handleBannerChange = async (e) => {
    console.log('📸 [ProfileHead] Banner change triggered');
    const file = e.target.files[0];
    
    if (!file) {
      console.log('🚫 [ProfileHead] No file selected');
      return;
    }
    
    console.log('📄 [ProfileHead] File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (file && file.type.startsWith("image/")) {
      console.log('✅ [ProfileHead] Valid image file, processing...');
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        console.log('📤 [ProfileHead] File read successfully, updating banner');
        setBanner(reader.result);
        mutate({
          id: currentUser?.id,
          banner: reader.result,
          prevBannerId: data?.data?.banner_id,
        });
      };

      reader.onerror = (error) => {
        console.error('❌ [ProfileHead] File read error:', error);
        toast.error("Failed to read image file");
      };
    } else {
      console.error('❌ [ProfileHead] Invalid file type:', file.type);
      toast.error("Please select a valid image file");
    }
  };

  // Function to get profile image with multiple fallbacks
  const getProfileImage = () => {
    let profileImage;
    
    if (isCurrentUserProfile) {
      // For current user, try multiple sources
      profileImage = getMainProfileImage(currentUser?.images) || 
                    currentUser?.imageUrl || 
                    currentUser?.image_url || 
                    data?.data?.image_url || 
                    "/images/placeholder-avatar.png";
      
      console.log('👤 [ProfileHead] Current user profile image:', {
        fromUserImages: getMainProfileImage(currentUser?.images),
        fromImageUrl: currentUser?.imageUrl,
        fromImageUrlAlt: currentUser?.image_url,
        fromDataUrl: data?.data?.image_url,
        final: profileImage
      });
    } else {
      // For other users
      profileImage = data?.data?.image_url || 
                    getMainProfileImage(data?.data?.images) || 
                    "/images/placeholder-avatar.png";
      
      console.log('👥 [ProfileHead] Other user profile image:', {
        userId,
        fromDataUrl: data?.data?.image_url,
        fromDataImages: getMainProfileImage(data?.data?.images),
        final: profileImage
      });
    }
    
    return profileImage;
  };

  if (isError) return <div>Error loading profile</div>;

  // Determine banner source with logging
  const bannerSrc = banner || "/images/banner.png";
  console.log('🖼️ [ProfileHead] Rendering banner:', {
    bannerState: banner,
    bannerSrc,
    isCurrentUserProfile,
    dataExists: !!data?.data,
    bannerUrl: data?.data?.banner_url
  });

  return (
    <div className={css.container}>
      <Spin spinning={isPending}>
        <div className={css.banner} onClick={() => setBannerPreview(true)}>
          <Image
            src={bannerSrc}
            alt="banner"
            preview={{
              mask: null,
              visible: bannerPreview,
              onVisibleChange: (visible) => setBannerPreview(visible),
            }}
            width={"100%"}
            height={"15rem"}
            onLoad={() => console.log('✅ [ProfileHead] Banner image loaded:', bannerSrc)}
            onError={(e) => console.error('❌ [ProfileHead] Banner image failed to load:', bannerSrc, e)}
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
                      <PremiumBadge 
                        user={isCurrentUserProfile ? currentUser : data?.data} 
                        size="small" 
                        showText={false}
                      />
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
                          {checkQuestionnaireCompletion() && (
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
              <div style={{ textAlign: 'center' }}>
                {/* Bio above interests */}
                {data.data.bio && (
                  <div style={{ marginBottom: '1rem' }}>
                    <Text 
                      className={"typoBody2"} 
                      type="secondary"
                      style={{ 
                    
                        textAlign: 'center'
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
