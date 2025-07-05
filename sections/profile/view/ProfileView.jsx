"use client";
import React, { useState, useEffect } from "react";
import css from "@/styles/ProfileView.module.css";
import ProfileHead from "../ProfileHead";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUserProfile } from "@/actions/user";
import ProfileBody from "../ProfileBody";
// TEMPORARILY COMMENTED OUT - FOLLOWERS/FOLLOWING FUNCTIONALITY
// import FollowPersonsBody from "../FollowPersonsBody";
import ProfileEditSection from "../ProfileEditSection";
import AccountSettings from "../AccountSettings";
import { useUser } from "@/hooks/useFirebaseAuth";
import { Button, Typography, Alert, Tabs, Dropdown, Menu, Modal, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import Iconify from "@/components/Iconify";
import PWAInstallSection from "@/components/PWAInstallSection";
import { 
  checkProfileCompletion, 
  getDisplayName, 
  getUsername,
  shouldForceProfileCompletion 
} from "@/utils/profileHelpers";
import { checkProfileCompleteness } from "@/utils/onboardingHelpers";
import { useLanguage } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { ExclamationCircleOutlined, CrownOutlined, HeartFilled } from "@ant-design/icons";
import { areUsersCompatible, saveResonanceRequest, removeCompatibility } from "@/actions/admin";
import { getMainProfileImage } from "@/utils/imageHelpers";

const { Title, Text } = Typography;

const ProfileView = ({ userId }) => {
  console.log('🔍 [ProfileView] Component rendered with userId:', userId);
  
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const { isPremium } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("1");
  const [showEditSection, setShowEditSection] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIncompatibilityModal, setShowIncompatibilityModal] = useState(false);
  const [isCompatible, setIsCompatible] = useState(true);
  const [compatibilityChecked, setCompatibilityChecked] = useState(false);
  const [isResonating, setIsResonating] = useState(false);
  const [resonanceSuccess, setResonanceSuccess] = useState(false);
  const [isRemovingCompatibility, setIsRemovingCompatibility] = useState(false);
  const [showRemoveCompatibilityModal, setShowRemoveCompatibilityModal] = useState(false);
  
  // Check if redirected from OnboardingGuard for profile completion
  const forceComplete = searchParams.get('complete') === 'true';
  console.log('🔄 [ProfileView] Force complete parameter:', forceComplete);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });

  console.log('📊 [ProfileView] Query state:', {
    userId,
    isLoading,
    isError,
    hasData: !!data,
    bannerUrl: data?.data?.banner_url,
    imageUrl: data?.data?.image_url
  });

  // Check if this is the current user's profile
  const isCurrentUserProfile = currentUser?.id === userId;

  console.log('👤 [ProfileView] Profile ownership:', {
    currentUserId: currentUser?.id,
    profileUserId: userId,
    isCurrentUserProfile
  });

  // Check if profile is incomplete
  const isProfileIncomplete = data?.data?.isIncomplete && isCurrentUserProfile;

  // Check if profile needs completion based on missing essential data
  const needsProfileCompletion = () => {
    if (!isCurrentUserProfile) return false;
    
    const userData = data?.data || currentUser;
    if (!userData) return true;

    // Only force profile completion if explicitly redirected from onboarding
    if (forceComplete) {
      console.log('🚨 [ProfileView] Forced profile completion due to complete=true parameter');
      return true;
    }

    // No longer forcing profile completion based on missing bio/location
    console.log('✅ [ProfileView] Profile completion not forced - user can access app freely');
    return false;
  };

  // Check if user is forced to complete profile (can't navigate away)
  const isProfileCompletionForced = needsProfileCompletion() && isCurrentUserProfile;

  // Check compatibility for other users
  useEffect(() => {
    const checkUserCompatibility = async () => {
      if (!currentUser?.id || !userId || isCurrentUserProfile || compatibilityChecked) {
        return;
      }

      try {
        console.log('🔍 [ProfileView] Checking compatibility between users:', {
          currentUserId: currentUser.id,
          profileUserId: userId
        });
        
        const isCompatible = await areUsersCompatible(currentUser.id, userId);
        console.log('🔍 [ProfileView] Compatibility result:', isCompatible);
        
        setIsCompatible(isCompatible);
        setCompatibilityChecked(true);
        
        // If not compatible, show modal (for both premium and non-premium users)
        if (!isCompatible) {
          setShowIncompatibilityModal(true);
        }
      } catch (error) {
        console.error('❌ [ProfileView] Error checking compatibility:', error);
        // On error, assume compatible to not block legitimate access
        setIsCompatible(true);
        setCompatibilityChecked(true);
      }
    };

    checkUserCompatibility();
  }, [currentUser?.id, userId, isCurrentUserProfile, isPremium, compatibilityChecked]);

  // Handle userId changes - ensure fresh data
  useEffect(() => {
    console.log('🔄 [ProfileView] userId changed, ensuring fresh data');
    console.log('📊 [ProfileView] Previous query cache for userId:', userId);
    
    // Reset tab when switching profiles
    setSelectedTab("1");
    setShowEditSection(false);
    
    // Reset compatibility state
    setIsCompatible(true);
    setCompatibilityChecked(false);
    setShowIncompatibilityModal(false);
    setIsResonating(false);
    setResonanceSuccess(false);
    
    // Force refresh for the new user
    queryClient.invalidateQueries(['user', userId]);
  }, [userId, queryClient]);

  useEffect(() => {
    // Auto-show edit section if profile needs completion
    if (needsProfileCompletion() && !showEditSection) {
      console.log('📝 [ProfileView] Profile needs completion, showing edit section');
      console.log('📝 [ProfileView] Force complete parameter:', forceComplete);
      setShowEditSection(true);
      setSelectedTab("edit");
    }
  }, [data, isCurrentUserProfile, forceComplete]);

  // Prevent tab changes if profile completion is forced
  const handleTabChange = (key) => {
    if (isProfileCompletionForced && key !== "edit" && key !== "settings") {
      return; // Don't allow tab change except to edit or settings
    }
    setSelectedTab(key);
  };

  const handleEditSuccess = async () => {
    console.log('🎉 [ProfileView] handleEditSuccess called');
    console.log('📱 Current tab before reset:', selectedTab);
    console.log('🔄 Refreshing user data for userId:', userId);
    
    setShowEditSection(false);
    setSelectedTab("1");
    
    // Refresh user data from React Query cache
    queryClient.invalidateQueries(['user', userId]);
    
    // Small delay to ensure data propagation, then check if redirect needed
    setTimeout(() => {
      console.log('🔄 [ProfileView] Checking if still needs redirect...');
      
      // Force a navigation to home to trigger OnboardingGuard re-check
      if (fromOnboardingRedirect) {
        console.log('🏠 [ProfileView] Redirecting to home after profile completion');
        
        // Clear any potential route cache by forcing a hard navigation
        if (typeof window !== 'undefined') {
          window.location.href = '/home';
        } else {
          router.push('/home');
        }
      }
    }, 2000); // Increased delay to 2 seconds
    
    console.log('✅ [ProfileView] Profile refresh completed');
  };

  const handleEditProfile = () => {
    setShowEditSection(true);
    setSelectedTab("edit");
  };

  // Handle incompatibility modal actions
  const handleBackToFeed = () => {
    setShowIncompatibilityModal(false);
    setResonanceSuccess(false); // Reset success state
    router.push('/home');
  };

  const handleSubscribeToPremium = () => {
    setShowIncompatibilityModal(false);
    router.push('/premium');
  };

  // Handle resonance request for premium users
  const handleResonate = async () => {
    if (!currentUser?.id || !userId) return;
    
    try {
      setIsResonating(true);
      await saveResonanceRequest(currentUser.id, userId);
      setResonanceSuccess(true); // Show success state instead of closing modal
    } catch (error) {
      console.error('Error saving resonance request:', error);
      message.error(t('premium.notCompatibleDialog.resonateError'));
    } finally {
      setIsResonating(false);
    }
  };

  // Handle removing compatibility
  const handleRemoveCompatibility = async () => {
    if (!currentUser?.id || !userId) return;
    
    try {
      setIsRemovingCompatibility(true);
      await removeCompatibility({ userId: currentUser.id, targetUserId: userId });
      
      // Update compatibility state
      setIsCompatible(false);
      setCompatibilityChecked(true);
      setShowRemoveCompatibilityModal(false);
      
      message.success(t('premium.compatibilityRemoved') || 'Compatibility removed successfully');
      
      // Refresh any related queries
      queryClient.invalidateQueries(['user', userId]);
      queryClient.invalidateQueries(['compatibilities']);
      
    } catch (error) {
      console.error('Error removing compatibility:', error);
      message.error(t('premium.compatibilityRemoveError') || 'Failed to remove compatibility');
    } finally {
      setIsRemovingCompatibility(false);
    }
  };

  const showRemoveCompatibilityConfirm = () => {
    setShowRemoveCompatibilityModal(true);
  };

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If error (very rare now), show generic error
  if (isError) {
    return (
      <div className={css.wrapper}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Alert
            message="Something went wrong"
            description="An error occurred while loading the profile. Please try again."
            type="error"
            showIcon
            action={
              <Button onClick={() => router.push('/home')}>
                Go to Home
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // Create enriched data combining fetched data with current user info for incomplete profiles
  const enrichedData = data ? {
    ...data,
    data: {
      ...data.data,
      // Use current user data as fallback for incomplete profiles
      first_name: data.data.first_name || (isCurrentUserProfile ? currentUser?.firstName || currentUser?.first_name : null),
      last_name: data.data.last_name || (isCurrentUserProfile ? currentUser?.lastName || currentUser?.last_name : null),
      username: data.data.username || (isCurrentUserProfile ? currentUser?.username : null),
      email_address: data.data.email_address || (isCurrentUserProfile ? currentUser?.email : null),
      image_url: data.data.image_url || (isCurrentUserProfile ? currentUser?.imageUrl || currentUser?.image_url : null),
      bio: data.data.bio || (isCurrentUserProfile ? currentUser?.bio : null),
      images: data.data.images || (isCurrentUserProfile ? currentUser?.images : []),
    }
  } : null;

  const profileCompletion = enrichedData ? checkProfileCompletion(enrichedData, currentUser) : null;

  // Define tabs
  const tabItems = [
    {
      key: "1",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="solar:user-id-bold" width="20px" />
          Profile
        </span>
      ),
      children: (
        <ProfileBody
          userId={userId}
          data={enrichedData}
          isLoading={isLoading}
          isError={false}
        />
      )
    },
    // TEMPORARILY COMMENTED OUT - FOLLOWERS/FOLLOWING FUNCTIONALITY
    // {
    //   key: "2",
    //   label: (
    //     <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Iconify icon="ph:heart-fill" width="20px" />
    //       Followers
    //     </span>
    //   ),
    //   children: <FollowPersonsBody type={"followers"} id={userId} />
    // },
    // {
    //   key: "3",
    //   label: (
    //     <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Iconify icon="fluent:people-20-filled" width="20px" />
    //       Following
    //     </span>
    //   ),
    //   children: <FollowPersonsBody type={"following"} id={userId} />
    // }
  ];

  // Add edit tab for current user
  if (isCurrentUserProfile) {
    tabItems.push({
      key: "edit",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:edit-fill" width="20px" />
          {t('userProfile.editProfile')}
          {needsProfileCompletion() && (
            <span style={{ 
              background: '#ff4d4f', 
              color: 'white', 
              borderRadius: '50%', 
              width: '8px', 
              height: '8px',
              marginLeft: '4px' 
            }} />
          )}
        </span>
      ),
      children: (
        <ProfileEditSection 
          userData={enrichedData}
          onUpdateSuccess={handleEditSuccess}
          forceEdit={needsProfileCompletion()}
          fromOnboardingRedirect={forceComplete}
        />
      )
    });

    // Add account settings tab
    tabItems.push({
      key: "settings",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:settings-fill" width="20px" />
          {t('accountSettings.title')}
        </span>
      ),
      children: <AccountSettings />
    });
  }

  // Create dropdown menu for mobile
  const createDropdownMenu = () => {
    const items = tabItems.map(item => ({
      key: item.key,
      label: item.label,
      disabled: isProfileCompletionForced && item.key !== "edit" && item.key !== "settings"
    }));

    return {
      items,
      onClick: ({ key }) => {
        if (isProfileCompletionForced && key !== "edit" && key !== "settings") {
          return;
        }
        setSelectedTab(key);
      }
    };
  };

  // Get current tab info
  const getCurrentTabInfo = () => {
    const currentTab = tabItems.find(tab => tab.key === selectedTab);
    return currentTab ? currentTab.label : "Profile";
  };

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Cosmic Incompatibility Modal */}
        <Modal
          open={showIncompatibilityModal}
          onCancel={handleBackToFeed}
          footer={null}
          centered
          width={450}
          maskClosable={false}
          closable={false}
          styles={{
            mask: {
              backdropFilter: 'blur(8px)',
              background: 'rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 20px',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #fff5f8 100%)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background cosmic pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }} />
            
            {/* Person's profile image */}
            <div style={{ 
              position: 'relative',
              zIndex: 1,
              marginBottom: '20px' 
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '0 auto',
                border: '4px solid #667eea',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                background: 'white'
              }}>
                <img 
                  src={getMainProfileImage(data?.data?.images) || data?.data?.image_url || "/images/placeholder-avatar.png"}
                  alt={getDisplayName(data?.data) || "Profile"}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              </div>
              
              {/* Cosmic sparkles around image */}
              <div style={{ position: 'absolute', top: '-10px', right: '20px', fontSize: '20px' }}>✨</div>
              <div style={{ position: 'absolute', bottom: '10px', left: '15px', fontSize: '16px' }}>💫</div>
              <div style={{ position: 'absolute', top: '20px', left: '10px', fontSize: '14px' }}>🌟</div>
            </div>
            
            {/* Show success message or regular dialog */}
            {resonanceSuccess ? (
              // Success state
              <>
                <Typography.Title level={3} style={{ 
                  marginBottom: '12px',
                  background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {t('premium.notCompatibleDialog.resonanceSuccessTitle')}
                </Typography.Title>
                
                <Typography.Paragraph style={{ 
                  fontSize: '15px', 
                  marginBottom: '16px',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  {t('premium.notCompatibleDialog.resonanceSuccessMessage', { 
                    name: getDisplayName(data?.data) || t('common.thisPerson')
                  })}
                </Typography.Paragraph>
                
                <Typography.Paragraph style={{ 
                  fontSize: '14px', 
                  marginBottom: '24px',
                  color: '#52c41a',
                  lineHeight: '1.4',
                  fontStyle: 'italic'
                }}>
                  {t('premium.notCompatibleDialog.resonanceSuccessAdvice')}
                </Typography.Paragraph>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <Button 
                    type="primary"
                    onClick={handleBackToFeed}
                    style={{ 
                      height: '44px',
                      borderRadius: '22px',
                      background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '32px',
                      paddingRight: '32px'
                    }}
                  >
                    {t('premium.notCompatibleDialog.backToFeed')}
                  </Button>
                </div>
              </>
            ) : (
              // Regular dialog
              <>
                <Typography.Title level={3} style={{ 
                  marginBottom: '12px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {t('premium.notCompatibleDialog.title', { 
                    name: getDisplayName(data?.data) || t('common.thisPerson')
                  })}
                </Typography.Title>
                
                <Typography.Paragraph style={{ 
                  fontSize: '15px', 
                  marginBottom: '20px',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  {t('premium.notCompatibleDialog.subtitle')}
                </Typography.Paragraph>
                
                {/* Message differs based on premium status */}
                {isPremium ? (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    marginBottom: '24px',
                    color: 'white',
                    position: 'relative'
                  }}>
                    <HeartFilled style={{ fontSize: '24px', marginBottom: '8px', color: '#FFB6C1' }} />
                    <Typography.Text style={{ color: 'white', fontSize: '15px', display: 'block', lineHeight: '1.5' }}>
                      {t('premium.notCompatibleDialog.resonateMessage', { 
                        name: getDisplayName(data?.data) || t('common.thisPerson')
                      })}
                    </Typography.Text>
                  </div>
                ) : (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    marginBottom: '8px',
                    color: 'white',
                    position: 'relative'
                  }}>
                    <CrownOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#FFD700' }} />
                    <Typography.Text style={{ color: 'white', fontSize: '15px', display: 'block', lineHeight: '1.5', marginBottom: '8px' }}>
                      {t('premium.notCompatibleDialog.premiumMessage', { 
                        name: getDisplayName(data?.data) || t('common.thisPerson')
                      })}
                    </Typography.Text>
                    <Typography.Text style={{ color: '#FFD700', fontSize: '14px', display: 'block', fontWeight: 'bold' }}>
                      {t('premium.notCompatibleDialog.premiumCta')}
                    </Typography.Text>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
                  <Button 
                    onClick={handleBackToFeed}
                    style={{ 
                      width: '100%',
                      height: '44px',
                      borderRadius: '22px',
                      border: '2px solid #ddd',
                      fontWeight: '500'
                    }}
                  >
                    {t('premium.notCompatibleDialog.takeMeBackToFeed')}
                  </Button>
                  
                  {isPremium ? (
                    <Button 
                      type="primary"
                      onClick={handleResonate}
                      loading={isResonating}
                      style={{ 
                        width: '100%',
                        height: '44px',
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '15px'
                      }}
                      icon={<HeartFilled />}
                    >
                      {t('premium.notCompatibleDialog.resonate', { 
                        name: getDisplayName(data?.data) || t('common.thisPerson')
                      })}
                    </Button>
                  ) : (
                    <Button 
                      type="primary"
                      onClick={handleSubscribeToPremium}
                      style={{ 
                        width: '100%',
                        height: '44px',
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '15px'
                      }}
                      icon={<CrownOutlined />}
                    >
                      {t('premium.notCompatibleDialog.subscribeToPremium')}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>

        {/* Remove Compatibility Modal */}
        <Modal
          open={showRemoveCompatibilityModal}
          onCancel={() => setShowRemoveCompatibilityModal(false)}
          footer={null}
          centered
          width={400}
          maskClosable={true}
          closable={true}
          styles={{
            mask: {
              backdropFilter: 'blur(8px)',
              background: 'rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 20px',
            background: 'linear-gradient(135deg, #fff5f5 0%, #fff9f9 100%)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Person's profile image */}
            <div style={{ 
              position: 'relative',
              zIndex: 1,
              marginBottom: '20px' 
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                margin: '0 auto',
                border: '4px solid #ff4d4f',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(255, 77, 79, 0.3)',
                background: 'white'
              }}>
                <img 
                  src={getMainProfileImage(data?.data?.images) || data?.data?.image_url || "/images/placeholder-avatar.png"}
                  alt={getDisplayName(data?.data) || "Profile"}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              </div>
            </div>
            
            <Typography.Title level={3} style={{ 
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {t('premium.removeCompatibilityDialog.title', { name: getDisplayName(data?.data) }) || `Remove Compatibility with ${getDisplayName(data?.data)}?`}
            </Typography.Title>
            
            <Typography.Paragraph style={{ 
              fontSize: '15px', 
              marginBottom: '20px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              {t('premium.removeCompatibilityDialog.message') || 'Are you sure you want to remove your compatibility? You will no longer be able to see each other\'s posts or send messages.'}
            </Typography.Paragraph>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Button 
                onClick={() => setShowRemoveCompatibilityModal(false)}
                style={{ 
                  width: '100%',
                  height: '44px',
                  borderRadius: '22px',
                  border: '2px solid #ddd',
                  fontWeight: '500'
                }}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              
              <Button 
                danger
                onClick={handleRemoveCompatibility}
                loading={isRemovingCompatibility}
                style={{ 
                  width: '100%',
                  height: '44px',
                  borderRadius: '22px',
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: 'white'
                }}
                icon={<ExclamationCircleOutlined />}
              >
                {t('premium.removeCompatibilityDialog.confirm') || 'Remove Compatibility'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Floating Remove Compatibility Button - Only show when compatible with someone else */}
        {!isCurrentUserProfile && isCompatible && compatibilityChecked && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <Button
              type="primary"
              danger
              size="large"
              onClick={showRemoveCompatibilityConfirm}
              style={{
                borderRadius: '50px',
                height: '50px',
                paddingLeft: '20px',
                paddingRight: '20px',
                background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(255, 77, 79, 0.3)',
                fontWeight: '600'
              }}
              icon={<HeartFilled />}
            >
              Remove Compatibility
            </Button>
          </div>
        )}

        {/* Forced Profile Completion Alert */}
        {isProfileCompletionForced && selectedTab !== "edit" && (
          <Alert
            message={forceComplete ? "Complete Your Profile to Continue" : t('userProfile.completionRequired')}
            description={
              <div>
                {forceComplete ? (
                  <>
                    To use the app, please complete your profile by adding the missing information below.
                    {(() => {
                      const userData = data?.data || currentUser;
                      const profileStatus = userData ? checkProfileCompleteness(userData) : null;
                      return profileStatus && profileStatus.missingFields.length > 0 ? (
                        <div style={{ marginTop: '8px' }}>
                          <strong>Missing:</strong> {profileStatus.missingFields.join(', ')}
                        </div>
                      ) : null;
                    })()}
                  </>
                ) : (
                  t('userProfile.completionRequiredDesc')
                )}
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: '1rem' }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => setSelectedTab("edit")}
              >
                {forceComplete ? "Complete Profile" : t('userProfile.completeProfileNow')}
              </Button>
            }
          />
        )}

        {/* Regular Profile Completion Alert */}
        {needsProfileCompletion() && !isProfileCompletionForced && selectedTab !== "edit" && (
          <Alert
            message={t('userProfile.completeProfile')}
            description={
              <div>
                {t('userProfile.completeProfileDesc')}
                <Button 
                  type="link" 
                  style={{ padding: 0, marginLeft: '8px' }}
                  onClick={() => setSelectedTab("edit")}
                >
                  {t('userProfile.completeItNow')} →
                </Button>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: '1rem' }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => setSelectedTab("edit")}
              >
                {t('userProfile.editProfile')}
              </Button>
            }
          />
        )}

        {/* Profile Head */}
        <ProfileHead
          data={enrichedData}
          isLoading={isLoading}
          isError={false}
          userId={userId}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          getDisplayName={getDisplayName}
          getUsername={getUsername}
          onEditProfile={handleEditProfile}
          isCurrentUserProfile={isCurrentUserProfile}
        />

        {/* PWA Install Section - only for current user */}
        {isCurrentUserProfile && !isProfileCompletionForced && (
          <PWAInstallSection />
        )}

        {/* Profile Content with Tabs */}
        <div style={{ marginTop: '1rem' }}>
          {isMobile ? (
            // Mobile: Show dropdown menu
            <div style={{ marginBottom: '1rem' }}>
              <Dropdown
                menu={createDropdownMenu()}
                trigger={['click']}
                placement="bottomCenter"
              >
                <Button
                  style={{
                    width: '100%',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'white',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    padding: '0 16px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {getCurrentTabInfo()}
                  </span>
                  <Iconify icon="eva:more-vertical-fill" width="20px" />
                </Button>
              </Dropdown>
              
              {/* Tab Content */}
              <div style={{ marginTop: '1rem' }}>
                {tabItems.find(tab => tab.key === selectedTab)?.children}
              </div>
            </div>
          ) : (
            // Desktop: Show regular tabs
          <Tabs
            activeKey={selectedTab}
            onChange={handleTabChange}
            items={tabItems.map(item => ({
              ...item,
              disabled: isProfileCompletionForced && item.key !== "edit" && item.key !== "settings"
            }))}
            size="large"
            tabBarStyle={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '0 1rem',
              marginBottom: '1rem'
            }}
          />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
