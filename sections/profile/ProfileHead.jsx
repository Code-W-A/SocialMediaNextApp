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
  // Crop functionality state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);

  console.log('🔧 [ProfileHead-State] Current banner crop modal state:', {
    showCropModal,
    cropImageUrl: cropImageUrl ? 'SET' : 'NULL',
    currentBanner: banner ? 'SET' : 'NULL',
    dataBannerUrl: data?.data?.banner_url ? 'SET' : 'NULL',
    isCurrentUserProfile,
    isLoading
  });

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

  const serverFixImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/fix-image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Server processing failed');
    const data = await res.json();
    return { url: data.url, fileName: data.fileName };
  };

  const handleBannerChange = async (e) => {
    console.log('🚀 [ProfileHead-handleBannerChange] STARTING - Banner change triggered');
    const file = e.target.files[0];
    
    if (!file) {
      console.log('🚫 [ProfileHead-handleBannerChange] No file selected, returning');
      return;
    }
    
    console.log('📄 [ProfileHead-handleBannerChange] File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validate image with new validation utils
    console.log('🔍 [ProfileHead-handleBannerChange] Validating image file...');
    const validation = validateImageFile(file, 'BANNER_IMAGE');
    
    if (!validation.isValid) {
      console.error('❌ [ProfileHead-handleBannerChange] File validation failed:', {
        errors: validation.errors,
        warnings: validation.warnings
      });
      message.error(validation.errors.join(', '));
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ [ProfileHead-handleBannerChange] File validation warnings:', validation.warnings);
      validation.warnings.forEach(warning => message.warning(warning));
    }

    console.log('✅ [ProfileHead-handleBannerChange] File validation passed');

    // Force server processing for all banner images
    console.log('⏳ [ProfileHead-handleBannerChange] Starting server processing...');
    const hide = message.loading('Processing banner image...', 0);
    
    try {
      console.log('🔧 [ProfileHead-handleBannerChange] Force processing banner through server for standardization...');
      const serverResult = await serverFixImage(file);
      console.log('✅ [ProfileHead-handleBannerChange] Banner image standardized on server:', {
        url: serverResult.url,
        fileName: serverResult.fileName
      });
      
      hide();
      
      // After server processing, ALWAYS show crop modal
      console.log('🎭 [ProfileHead-handleBannerChange] Opening crop modal with server-processed banner image');
      console.log('🎭 [ProfileHead-handleBannerChange] Setting crop modal state:', {
        currentShowCropModal: showCropModal,
        serverImageUrl: serverResult.url
      });
      
      setCropImageUrl(serverResult.url);
      setShowCropModal(true);
      
      // Store server data for later use after crop
      window.tempBannerServerData = serverResult;
      console.log('💾 [ProfileHead-handleBannerChange] Stored banner server data in window.tempBannerServerData:', window.tempBannerServerData);
      
      message.success(t('profileEdit.bannerStandardizedServer') || 'Banner image standardized successfully! Now crop it ✨');
      console.log('🎭 [ProfileHead-handleBannerChange] Crop modal should be visible now');
      
    } catch (serverError) {
      console.error('❌ [ProfileHead-handleBannerChange] Server processing failed:', {
        error: serverError,
        message: serverError.message,
        stack: serverError.stack
      });
      hide();
      message.error('This banner image cannot be processed. Please try a different image.');
      return;
    }
    
    // Clear the input value so the same file can be selected again
    console.log('🧹 [ProfileHead-handleBannerChange] Clearing input value for reuse');
    e.target.value = '';
    console.log('✅ [ProfileHead-handleBannerChange] COMPLETED - Banner processing initiated');
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
                accept="image/jpeg,image/jpg,image/png"
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
          console.log('❌ [ProfileHead-CropModal] User cancelled banner crop modal');
          setShowCropModal(false);
          setCropImageUrl(null);
          console.log('🧹 [ProfileHead-CropModal] Cleaned up banner crop modal state');
        }}
        onCropComplete={(cropResult) => {
          console.log('🎭 [ProfileHead-onCropComplete] STARTING - Banner crop completed with result:', {
            hasPreview: !!cropResult.preview,
            hasFile: !!cropResult.file,
            fileSize: cropResult.file?.size,
            fileName: cropResult.file?.name,
            previewUrlLength: cropResult.preview?.length
          });
          
          // Check if we have server data from forced processing
          const serverData = window.tempBannerServerData;
          console.log('💾 [ProfileHead-onCropComplete] Checking for banner server data:', {
            hasServerData: !!serverData,
            serverUrl: serverData?.url,
            serverFileName: serverData?.fileName
          });
          
          if (serverData) {
            console.log('🌐 [ProfileHead-onCropComplete] Using server-processed banner data');
            // Use server-processed image URL directly for banner
            console.log('📸 [ProfileHead-onCropComplete] Setting banner to server URL:', serverData.url);
            setBanner(serverData.url);
            
            console.log('💾 [ProfileHead-onCropComplete] Calling mutate with banner data:', {
              userId: currentUser?.id,
              bannerUrl: serverData.url,
              prevBannerId: data?.data?.banner_id
            });
            
            mutate({
              id: currentUser?.id,
              banner: serverData.url, // Use server URL directly
              prevBannerId: data?.data?.banner_id,
            });
            
            // Clean up temp data
            delete window.tempBannerServerData;
            console.log('🧹 [ProfileHead-onCropComplete] Cleaned up window.tempBannerServerData');
          } else {
            console.log('📁 [ProfileHead-onCropComplete] Using cropped file for banner (fallback)');
            // Convert cropped file to base64 for upload (fallback)
            const reader = new FileReader();
            reader.onload = () => {
              console.log('📸 [ProfileHead-onCropComplete] FileReader completed, setting banner');
              setBanner(reader.result);
              mutate({
                id: currentUser?.id,
                banner: reader.result,
                prevBannerId: data?.data?.banner_id,
              });
            };
            reader.readAsDataURL(cropResult.file);
          }
          
          // Close modal and cleanup
          console.log('🎭 [ProfileHead-onCropComplete] Closing crop modal and cleaning up...');
          setShowCropModal(false);
          setCropImageUrl(null);
          
          // Show success message
          message.success(t('imageCrop.cropSuccessful') || 'Banner cropped successfully!');
          console.log('✅ [ProfileHead-onCropComplete] COMPLETED - Banner crop process finished successfully');
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
