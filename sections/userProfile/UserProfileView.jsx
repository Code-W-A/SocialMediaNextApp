"use client";
import React, { useState } from "react";
import css from "@/styles/UserProfileView.module.css";
import UserProfileHead from "./UserProfileHead";
import UserProfileBody from "./UserProfileBody";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/actions/user";
import { useUser } from "@/hooks/useFirebaseAuth";
import { Button, Typography, Alert, Tabs, Spin } from "antd";
import { useRouter } from "next/navigation";
import Iconify from "@/components/Iconify";
import Posts from "@/components/Post/Posts";
import { 
  getDisplayName, 
  getUsername 
} from "@/utils/profileHelpers";
import { areUsersCompatible } from "@/actions/admin";

const { Title, Text } = Typography;

const UserProfileView = ({ userId }) => {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("1");

  // Fetch user data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });

  // Check if users are compatible
  const { data: isCompatible } = useQuery({
    queryKey: ["compatibility", currentUser?.id, userId],
    queryFn: () => areUsersCompatible(currentUser?.id, userId),
    enabled: !!currentUser?.id && !!userId && currentUser?.id !== userId,
  });

  // Redirect if user tries to view their own profile
  if (currentUser?.id === userId) {
    router.push('/profile');
    return null;
  }

  // Error state
  if (isError) {
    return (
      <div className={css.wrapper}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Alert
            message="User Not Found"
            description="The user profile you're looking for doesn't exist or is no longer available."
            type="error"
            showIcon
            action={
              <Button onClick={() => router.push('/matches')}>
                Back to Matches
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={css.wrapper}>
        <div className={css.container}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Spin size="large" />
            <Typography.Text type="secondary">Loading profile...</Typography.Text>
          </div>
        </div>
      </div>
    );
  }

  // Not compatible warning
  if (isCompatible === false && data?.data) {
    return (
      <div className={css.wrapper}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Alert
            message="Not Compatible"
            description="You and this user are not marked as compatible. You can only view profiles of users you're compatible with."
            type="warning"
            showIcon
            action={
              <Button onClick={() => router.push('/matches')}>
                Back to Matches
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const userData = data;

  // Define tabs
  const tabItems = [
    {
      key: "1",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:file-text-fill" width="20px" />
          Posts
        </span>
      ),
      children: (
        <div style={{ marginTop: '1rem' }}>
          {/* Show user's posts */}
          <Posts id={userId} />
        </div>
      )
    },
    {
      key: "2",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="solar:user-id-bold" width="20px" />
          Profile
        </span>
      ),
      children: (
        <UserProfileBody
          userId={userId}
          userData={userData}
          currentUser={currentUser}
          isLoading={isLoading}
        />
      )
    },
    {
      key: "3",
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:heart-fill" width="20px" />
          Compatibility
        </span>
      ),
      children: (
        <UserProfileBody
          userId={userId}
          userData={userData}
          currentUser={currentUser}
          isLoading={isLoading}
          showCompatibility={true}
        />
      )
    }
  ];

  return (
    <div className={css.wrapper} style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className={css.container}>
        {/* Profile Head */}
        <UserProfileHead
          userData={userData}
          currentUser={currentUser}
          isLoading={isLoading}
          userId={userId}
          getDisplayName={getDisplayName}
          getUsername={getUsername}
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

export default UserProfileView; 