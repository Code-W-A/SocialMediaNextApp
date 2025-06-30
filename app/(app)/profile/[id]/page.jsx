import ProfileView from "@/sections/profile/view/ProfileView";
import React from "react";


export const generateMetadata = async ({ params, searchParams }) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return {
    title: `${resolvedSearchParams?.person}'s profile`,
    description: `Profile page of user ${resolvedParams?.id}`,
  };
};

const ProfilePage = async ({ params }) => {
  const resolvedParams = await params;
  return <ProfileView userId={resolvedParams?.id} />;
};

export default ProfilePage;
