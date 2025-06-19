"use client";
import React, { useState, useEffect } from "react";
import css from "@/styles/ProfileView.module.css";
import ProfileHead from "../ProfileHead";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUserProfile } from "@/actions/user";
import ProfileBody from "../ProfileBody";
import FollowPersonsBody from "../FollowPersonsBody";
import ProfileEditSection from "../ProfileEditSection";
import { useUser } from "@/hooks/useFirebaseAuth";
import { Button, Typography, Alert, Tabs } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import { 
  checkProfileCompletion, 
  getDisplayName, 
  getUsername 
} from "@/utils/profileHelpers";

const { Title, Text } = Typography;

const ProfileView = ({ userId }) => {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("1");
  const [showEditSection, setShowEditSection] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });

  // Check if this is the current user's profile
  const isCurrentUserProfile = currentUser?.id === userId;

  // Check if profile is incomplete
  const isProfileIncomplete = data?.data?.isIncomplete && isCurrentUserProfile;

  // Check if profile needs completion based on missing essential data
  const needsProfileCompletion = () => {
    if (!isCurrentUserProfile) return false;
    
    const userData = data?.data || currentUser;
    if (!userData) return true;

    // Check for essential fields
    const hasBasicInfo = (userData.first_name || userData.firstName) && 
                        (userData.last_name || userData.lastName) && 
                        userData.username;
    
    const hasImages = userData.images && userData.images.length > 0;
    
    return !hasBasicInfo || !hasImages || isProfileIncomplete;
  };

  useEffect(() => {
    // Auto-show edit section if profile needs completion
    if (needsProfileCompletion() && !showEditSection) {
      setShowEditSection(true);
      setSelectedTab("edit");
    }
  }, [data, isCurrentUserProfile]);

  const handleEditSuccess = () => {
    setShowEditSection(false);
    setSelectedTab("1");
    // Refresh user data
    queryClient.invalidateQueries(['user', userId]);
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
    {
      key: "2",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="ph:heart-fill" width="20px" />
          Followers
        </span>
      ),
      children: <FollowPersonsBody type={"followers"} id={userId} />
    },
    {
      key: "3",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="fluent:people-20-filled" width="20px" />
          Following
        </span>
      ),
      children: <FollowPersonsBody type={"following"} id={userId} />
    }
  ];

  // Add edit tab for current user
  if (isCurrentUserProfile) {
    tabItems.push({
      key: "edit",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:edit-fill" width="20px" />
          Edit Profile
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
  }

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        {/* Incomplete Profile Alert */}
        {needsProfileCompletion() && selectedTab !== "edit" && (
          <Alert
            message="Complete Your Profile"
            description={
              <div>
                Your profile is missing some essential information. 
                <Button 
                  type="link" 
                  style={{ padding: 0, marginLeft: '8px' }}
                  onClick={() => setSelectedTab("edit")}
                >
                  Complete it now →
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
                Edit Profile
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
            onChange={setSelectedTab}
            items={tabItems}
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
