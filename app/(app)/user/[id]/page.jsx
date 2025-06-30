import UserProfileView from "@/sections/userProfile/UserProfileView";
import React from "react";

export const generateMetadata = async ({ params }) => {
  return {
    title: `User Profile - YDestiny`,
    description: `View user profile and compatibility information`,
  };
};

const UserProfilePage = ({ params }) => {
  return <UserProfileView userId={params?.id} />;
};

export default UserProfilePage; 