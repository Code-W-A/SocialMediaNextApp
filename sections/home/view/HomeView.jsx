"use client";

import React, { Suspense } from "react";
import css from "@/styles/Home.module.css";
import PostGenerator from "@/components/Post/PostGenerator";
import Posts from "@/components/Post/Posts";
// import PopularTrends from "@/components/PopularTrends"; // Temporarily disabled
import OnlineCompatibleUsers from "@/components/FriendsSuggestion";
import { Space, Spin, Typography } from "antd";
import { useIsMobile } from "@/hooks/useIsMobile";

const HomeView = () => {
  const isMobile = useIsMobile();

  return (
    <div className={css.wrapper}>
      <div className={css.postsArea}>
        {/* Mobile: Show OnlineCompatibleUsers above PostGenerator */}
        {isMobile && (
          <div className={css.mobileCompatibleUsers}>
            <OnlineCompatibleUsers />
          </div>
        )}

        {/* post generator on top */}
        <PostGenerator />

        {/* posts */}
        <Posts />
      </div>

      {/* Desktop: Show OnlineCompatibleUsers in right sidebar */}
      {!isMobile && (
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
      )}
    </div>
  );
};

export default HomeView;
