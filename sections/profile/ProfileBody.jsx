import React from "react";
import css from "@/styles/ProfileView.module.css";
// TEMPORARILY COMMENTED OUT - FOLLOWERS/FOLLOWING FUNCTIONALITY
// import FollowButton from "./FollowButton";
// import FollowInfoBox from "./FollowInfoBox";
import OnlineCompatibleUsers from "@/components/FriendsSuggestion";
import PostGenerator from "@/components/Post/PostGenerator";
import Posts from "@/components/Post/Posts";
import CompatibilityCard from "@/components/CompatibilityCard";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/actions/user";
const ProfileBody = ({ userId, data }) => {
  const { user: currentUser } = useUser();
  const isCurrentUser = currentUser?.id === userId;

  // Get profile user data for compatibility
  const { data: profileUserData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId && !isCurrentUser,
  });

  const profileUser = data?.data || profileUserData?.data;

  return (
    <div className={css.profileBody}>
      <div className={css.left}>
        <div className={css.sticky}>
          {/* TEMPORARILY COMMENTED OUT - FOLLOW FUNCTIONALITY */}
          {/* {!isCurrentUser && <FollowButton id={userId} />} */}

          {/* Compatibility Card - only show for other users */}
          {!isCurrentUser && (
            <CompatibilityCard 
              currentUser={currentUser} 
              profileUser={profileUser}
            />
          )}

          {/* TEMPORARILY COMMENTED OUT - FOLLOWERS/FOLLOWING INFO */}
          {/* <FollowInfoBox id={userId} /> */}
          <OnlineCompatibleUsers />
        </div>
      </div>
      <div className={css.right}>
        {isCurrentUser && <PostGenerator />}
        <Posts id={userId} />
      </div>
    </div>
  );
};

export default ProfileBody;
