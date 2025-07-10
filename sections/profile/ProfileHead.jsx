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
import SimpleImageCrop from "@/components/ImageCrop/SimpleImageCrop";
import { validateImageFile, cleanupImagePreview } from "@/utils/imageValidation";
import { message } from "antd";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const router = useRouter();
  const inputRef = useRef(null);
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);
  // Crop functionality state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);

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
    
    // Set loading state based on whether we're waiting for data
    if (isLoading || (!data && !isError)) {
      setBannerLoading(true);
      setBanner(null);
      console.log('⏳ [ProfileHead] Setting banner loading state');
    } else if (data) {
      // Data is available, process banner
      if (data?.data?.banner_url) {
        console.log('🖼️ [ProfileHead] Setting banner to:', data.data.banner_url);
        setBannerLoading(true); // Show loading while image loads
        setBanner(data.data.banner_url);
      } else {
        console.log('🚫 [ProfileHead] No banner URL, using default');
        setBannerLoading(false);
        setBanner(null);
      }
    } else {
      console.log('❌ [ProfileHead] Error state, using default banner');
      setBannerLoading(false);
      setBanner(null);
    }
  }, [data?.data?.banner_url, userId, isLoading, isError]);

  // Additional useEffect to handle profile changes
  useEffect(() => {
    console.log('🔄 [ProfileHead] Profile changed, resetting banner state');
    console.log('📊 [ProfileHead] New userId:', userId);
    
    // Reset banner state when profile changes
    setBanner(null);
    setBannerLoading(true);
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

    // Validate image with new validation utils
    const validation = validateImageFile(file, 'BANNER_IMAGE');
    
    if (!validation.isValid) {
      console.error('❌ [ProfileHead] File validation failed:', validation.errors);
      message.error(validation.errors.join(', '));
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ [ProfileHead] File validation warnings:', validation.warnings);
      validation.warnings.forEach(warning => message.warning(warning));
    }

    console.log('✅ [ProfileHead] Valid image file, opening crop modal...');
    const previewUrl = URL.createObjectURL(file);
    setCropImageUrl(previewUrl);
    setShowCropModal(true);
    
    // Clear the input value so the same file can be selected again
    e.target.value = '';
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

  // Function to get all user images for preview gallery
  const getAllUserImages = () => {
    let images = [];
    
    if (isCurrentUserProfile) {
      // For current user, try multiple sources
      images = currentUser?.images || data?.data?.images || [];
    } else {
      // For other users
      images = data?.data?.images || [];
    }
    
    // If no images array but has legacy image_url, create a single image object
    if (images.length === 0) {
      const legacyImageUrl = isCurrentUserProfile 
        ? (currentUser?.imageUrl || currentUser?.image_url || data?.data?.image_url)
        : data?.data?.image_url;
      
      if (legacyImageUrl && legacyImageUrl !== "/images/placeholder-avatar.png") {
        images = [{
          fileUri: legacyImageUrl,
          fileName: 'profile-image',
          isMain: true
        }];
      }
    }
    
    // Sort images: main photo first, then the rest
    return [...images].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1; // Main photo first
      if (!a.isMain && b.isMain) return 1;  // Main photo first
      return 0; // Keep original order for non-main photos
    });
  };

  if (isError) return <div>Error loading profile</div>;

  // Determine banner source with logging
  const bannerSrc = banner || "/images/banner.jpg";
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
        <div className={css.banner} onClick={() => !bannerLoading && setBannerPreview(true)}>
          {bannerLoading ? (
            // Show skeleton during loading
            <div style={{ 
              width: '100%', 
              height: '15rem', 
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Skeleton.Image 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  borderRadius: '1rem 1rem 0 0'
                }}
                active
              />
              {/* Overlay for better skeleton appearance */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                borderRadius: '1rem 1rem 0 0'
              }} />
            </div>
          ) : (
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
              onLoad={() => {
                console.log('✅ [ProfileHead] Banner image loaded:', bannerSrc);
                setBannerLoading(false);
              }}
              onError={(e) => {
                console.error('❌ [ProfileHead] Banner image failed to load:', bannerSrc, e);
                setBannerLoading(false);
              }}
            />
          )}

          {isCurrentUserProfile && !bannerLoading && (
            <div
              className={css.editButton}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
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

      {/* Banner Image Crop Modal */}
      <SimpleImageCrop
        visible={showCropModal}
        onCancel={() => {
          setShowCropModal(false);
          setCropImageUrl(null);
        }}
        onCropComplete={(cropResult) => {
          // Convert cropped file to base64 for upload
          const reader = new FileReader();
          reader.onload = () => {
            setBanner(reader.result);
            mutate({
              id: currentUser?.id,
              banner: reader.result,
              prevBannerId: data?.data?.banner_id,
            });
          };
          reader.readAsDataURL(cropResult.file);
          
          // Close modal and cleanup
          setShowCropModal(false);
          setCropImageUrl(null);
          
          // Show success message
          message.success(t('imageCrop.cropSuccessful') || 'Banner cropped successfully!');
        }}
        imageUrl={cropImageUrl}
        title={t('imageCrop.cropBannerImage') || 'Crop Banner Image'}
        aspectRatios={[
          { label: 'Widescreen', value: 16/9, icon: 'eva:monitor-fill' },
          { label: 'Ultra Wide', value: 21/9, icon: 'eva:tv-fill' },
          { label: 'Wide', value: 2/1, icon: 'eva:crop-fill' },
          { label: 'Standard', value: 3/2, icon: 'eva:image-fill' }
        ]}
        defaultAspectRatio={16/9}
      />

      <Box>
        <div className={css.footer}>
          {/* profile */}
          <div className={css.profileContainer}>
            <div className={css.profileImage}>
              {(() => {
                const allImages = getAllUserImages();
                
                // If user has multiple images, create preview group for slide functionality
                if (allImages.length > 1) {
                  return (
                    <Image.PreviewGroup>
                      {/* Main profile image - visible */}
                      <Image
                        src={getProfileImage()}
                        alt="profile"
                        preview={{
                          mask: (
                            <div style={{ color: 'white', textAlign: 'center' }}>
                              <Icon icon="eva:eye-fill" style={{ fontSize: '20px' }} />
                              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                View All Photos ({allImages.length})
                              </div>
                            </div>
                          )
                        }}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                      
                      {/* Hidden images for gallery slide - only non-main images */}
                      {allImages.slice(1).map((image, index) => (
                        <Image
                          key={`hidden-${index}`}
                          src={image.fileUri}
                          alt={`Photo ${index + 2}`}
                          style={{ display: 'none' }}
                          preview={{
                            visible: false
                          }}
                        />
                      ))}
                    </Image.PreviewGroup>
                  );
                } else {
                  // Single image or no images - normal preview
                  return (
                    <Image
                      src={getProfileImage()}
                      alt="profile"
                      preview={{ mask: null }}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  );
                }
              })()}
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
