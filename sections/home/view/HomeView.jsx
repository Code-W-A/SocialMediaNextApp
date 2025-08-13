"use client";

import React, { Suspense, useEffect } from "react";
import css from "@/styles/Home.module.css";
import PostGenerator from "@/components/Post/PostGenerator";
import Posts from "@/components/Post/Posts";
import { useQueryClient } from "@tanstack/react-query";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
// import PopularTrends from "@/components/PopularTrends"; // Temporarily disabled
import OnlineCompatibleUsers from "@/components/FriendsSuggestion";
import OnboardingGuard from "@/components/OnboardingGuard";
import { Space, Spin, Typography, Card, Button } from "antd";
import Iconify from "@/components/Iconify";
import { useSubscription } from "@/hooks/useSubscription";
import { FEATURE_FLAGS, loadFlagsFromEnv } from "@/utils/featureFlags";
import { useRouter } from "next/navigation";
const HomeView = () => {
  const { isPremium } = useSubscription();
  const flags = loadFlagsFromEnv();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Preload prima pagină a feed-ului după mount pentru first paint mai rapid
  useEffect(() => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ["posts", "all", undefined],
      queryFn: ({ pageParam = null }) => import("@/actions/post").then(m => m.getMyPostsFeed(undefined, pageParam)),
      initialPageParam: null,
    }).catch(() => {});
  }, [queryClient]);
  
  return (
    <OnboardingGuard>
      <div className={css.wrapper}>
        <div className={css.postsArea}>
          {/* post generator on top */}
          <PostGenerator />

          {/* posts with local error boundary */}
          <ErrorBoundaryWrapper>
            <Posts />
          </ErrorBoundaryWrapper>
        </div>

        <div className={css.rightSide}>
          {flags.PREMIUM_WHO_LIKED_YOU_UPSELL && !isPremium && (
            <Card 
              style={{ borderRadius: '12px', marginBottom: '1rem', background: 'linear-gradient(135deg, #fffbea, #ffffff)' }}
              bodyStyle={{ padding: '12px 16px', border: '1px solid #ffe58f', borderRadius: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Iconify icon="mdi:eye" width="18px" style={{ color: '#faad14' }} />
                  <Typography.Text strong style={{ color: '#ad6800' }}>
                    Vezi cine te-a plăcut
                  </Typography.Text>
                </div>
                <Button 
                  size="small"
                  onClick={() => router.push('/premium')}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: 8
                  }}
                  icon={<Iconify icon="eva:crown-fill" width="14px" />}
                >
                  Premium
                </Button>
              </div>
            </Card>
          )}
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
