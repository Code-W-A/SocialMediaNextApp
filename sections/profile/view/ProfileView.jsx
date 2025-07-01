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
import { Button, Typography, Alert, Tabs } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import { 
  checkProfileCompletion, 
  getDisplayName, 
  getUsername,
  shouldForceProfileCompletion 
} from "@/utils/profileHelpers";
import { useLanguage } from "@/lib/i18n";

const { Title, Text } = Typography;

const ProfileView = ({ userId }) => {
  console.log('🔍 [ProfileView] Component rendered with userId:', userId);
  
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("1");
  const [showEditSection, setShowEditSection] = useState(false);

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

    return shouldForceProfileCompletion({ data: userData }, currentUser);
  };

  // Check if user is forced to complete profile (can't navigate away)
  const isProfileCompletionForced = needsProfileCompletion() && isCurrentUserProfile;

  // Handle userId changes - ensure fresh data
  useEffect(() => {
    console.log('🔄 [ProfileView] userId changed, ensuring fresh data');
    console.log('📊 [ProfileView] Previous query cache for userId:', userId);
    
    // Reset tab when switching profiles
    setSelectedTab("1");
    setShowEditSection(false);
    
    // Force refresh for the new user
    queryClient.invalidateQueries(['user', userId]);
  }, [userId, queryClient]);

  useEffect(() => {
    // Auto-show edit section if profile needs completion
    if (needsProfileCompletion() && !showEditSection) {
      console.log('📝 [ProfileView] Profile needs completion, showing edit section');
      setShowEditSection(true);
      setSelectedTab("edit");
    }
  }, [data, isCurrentUserProfile]);

  // Prevent tab changes if profile completion is forced
  const handleTabChange = (key) => {
    if (isProfileCompletionForced && key !== "edit" && key !== "settings") {
      return; // Don't allow tab change except to edit or settings
    }
    setSelectedTab(key);
  };

  const handleEditSuccess = () => {
    console.log('🎉 [ProfileView] handleEditSuccess called');
    console.log('📱 Current tab before reset:', selectedTab);
    console.log('🔄 Refreshing user data for userId:', userId);
    
    setShowEditSection(false);
    setSelectedTab("1");
    
    // Refresh user data
    queryClient.invalidateQueries(['user', userId]);
    
    console.log('✅ [ProfileView] Profile refresh completed');
  };

  const handleEditProfile = () => {
    setShowEditSection(true);
    setSelectedTab("edit");
  };

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

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Forced Profile Completion Alert */}
        {isProfileCompletionForced && selectedTab !== "edit" && (
          <Alert
            message={t('userProfile.completionRequired')}
            description={
              <div>
                {t('userProfile.completionRequiredDesc')}
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
                {t('userProfile.completeProfileNow')}
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

        {/* Profile Content with Tabs */}
        <div style={{ marginTop: '1rem' }}>
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
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
