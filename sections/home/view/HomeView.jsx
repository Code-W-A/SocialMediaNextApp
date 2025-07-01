import React, { Suspense } from "react";
import css from "@/styles/Home.module.css";
import PostGenerator from "@/components/Post/PostGenerator";
import Posts from "@/components/Post/Posts";
// import PopularTrends from "@/components/PopularTrends"; // Temporarily disabled
import OnlineCompatibleUsers from "@/components/FriendsSuggestion";
import OnboardingGuard from "@/components/OnboardingGuard";
import { Space, Spin, Typography } from "antd";
const HomeView = () => {
  return (
    <OnboardingGuard>
      <div className={css.wrapper}>
        <div className={css.postsArea}>
          {/* post generator on top */}
          <PostGenerator />

          {/* posts */}
          <Posts />
        </div>

        <div className={css.rightSide}>
          {/* PopularTrends temporarily disabled */}
          {/* <Suspense
            fallback={
              <Space direction="vertical">
                <Spin />
                <Typography className="typoH4">Loading trends...</Typography>
              </Space>
            }
          >
            <PopularTrends />
          </Suspense> */}

          <OnlineCompatibleUsers />
        </div>
      </div>
    </OnboardingGuard>
  );
};

export default HomeView;
