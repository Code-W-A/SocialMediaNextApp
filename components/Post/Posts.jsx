"use client";
import { Flex, Spin, Typography, Button, Modal } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import Post from "./Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyPostsFeed, getPosts } from "@/actions/post";
import { useInView } from "react-intersection-observer";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useDailyUsageTracking } from "@/hooks/useDailyUsageTracking";
import { canPerformAction } from "@/utils/premiumHelpers";

const Posts = ({ id = "all" }) => {
  const { user: currentUser } = useUser();
  const { subscription, isPremium } = useSubscription();
  const { dailyUsage, incrementUsage } = useDailyUsageTracking();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  // to know when the last element is in view
  const { ref, inView } = useInView();

  // Check if user can view more posts
  const canViewFeed = canPerformAction('DAILY_FEED_VIEWS', dailyUsage, subscription);

  // Track feed view when component mounts (only for main feed)
  useEffect(() => {
    if (id === "all" && currentUser?.id && !hasTrackedView && !isPremium) {
      incrementUsage('DAILY_FEED_VIEWS');
      setHasTrackedView(true);
    }
  }, [id, currentUser?.id, hasTrackedView, incrementUsage, isPremium]);

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => ["posts", id, currentUser?.id], [id, currentUser?.id]);

  // Memoize query function to prevent recreation on every render
  const queryFn = useCallback(({ pageParam = null }) => {
    if (id === "all") {
      // For main feed, get posts from compatible users + own posts
      return getMyPostsFeed(currentUser?.id, pageParam);
    } else {
      // For specific user profile, get their posts
      return getPosts(pageParam, id);
    }
  }, [id, currentUser?.id]);

  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isSuccess,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => {
      return lastPage?.metaData?.lastCursor;
    },
    enabled: !!currentUser?.id && (isPremium || canViewFeed.canPerform || id !== "all"), // Disable for free users who reached limit on main feed
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    cacheTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if we have cached data
    refetchInterval: false, // Disable automatic refetching
  });

  // Memoize all posts to prevent unnecessary recalculations
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page?.data || []);
  }, [data?.pages]);

  const [parent] = useAutoAnimate();

  // Debounced fetch next page to prevent rapid scroll triggering
  const debounceFetchNextPage = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }, 300); // 300ms debounce
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    // if the last element is in view and there is a next page, fetch the next page
    if (inView && hasNextPage && !isFetchingNextPage) {
      debounceFetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, debounceFetchNextPage]);

  // Memoize ref check function
  const checkLastViewRef = useCallback((index, page) => {
    return index === page.data.length - 1;
  }, []);

  // Memoize loading state message
  const loadingMessage = useMemo(() => (
    <Flex vertical align="center" gap={"large"}>
      <Typography>Please log in to view posts</Typography>
    </Flex>
  ), []);

  // Memoize error message
  const errorMessage = useMemo(() => (
    <Typography>Something went wrong: {error?.message}</Typography>
  ), [error?.message]);

  // Memoize loading spinner
  const loadingSpinner = useMemo(() => (
    <Flex vertical align="center" gap={"large"}>
      <Spin />
      <Typography>Loading...</Typography>
    </Flex>
  ), []);

  // Memoize empty state
  const emptyState = useMemo(() => (
    <Flex vertical align="center" gap={"large"} style={{ padding: '2rem' }}>
      <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
        {id === "all" 
          ? "Nu sunt postări disponibile. Începe să postezi sau conectează-te cu utilizatori compatibili!" 
          : "Nu sunt postări disponibile."}
      </Typography.Text>
    </Flex>
  ), [id]);

  // Memoize fetching more spinner
  const fetchingMoreSpinner = useMemo(() => (
    <Flex vertical align="center" gap={"large"}>
      <Spin />
      <Typography>Loading...</Typography>
    </Flex>
  ), []);

  if (!currentUser?.id && !isLoading) {
    return loadingMessage;
  }

  if (error) {
    return errorMessage;
  }

  if (isLoading) {
    return loadingSpinner;
  }

  // Show limit reached message for free users on main feed
  if (id === "all" && !isPremium && !canViewFeed.canPerform) {
    return (
      <Flex vertical align="center" gap="large" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <CrownOutlined style={{ color: '#FFD700' }} />
          </div>
          
          <Typography.Title level={3} style={{ marginBottom: '16px' }}>
            Ai atins limita zilnică
          </Typography.Title>
          
          <Typography.Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
            Utilizatorii free pot vizualiza doar <strong>{canViewFeed.limit} feed-uri pe zi</strong>.
            Revino mâine sau fă upgrade la Premium pentru acces nelimitat.
          </Typography.Paragraph>
          
          <Button 
            type="primary" 
            size="large"
            onClick={() => window.location.href = '/premium'}
            style={{ 
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000'
            }}
          >
            <CrownOutlined /> Upgrade la Premium
          </Button>
        </div>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={"1rem"}>
      <Flex vertical gap={"1rem"} ref={parent}>
        {isSuccess &&
          data?.pages?.map((page, pageIndex) => {
            return (
              <React.Fragment key={pageIndex}>
                {page?.data?.map((post, index) => {
                  return (
                    <div
                      key={post?.id}
                      ref={checkLastViewRef(index, page) ? ref : null}
                    >
                      <Post data={post} queryId={id} />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
      </Flex>

      {/* Loading next page indicator */}
      {isFetchingNextPage && (
        <Flex justify="center" style={{ padding: '1rem' }}>
          <Spin />
        </Flex>
      )}

      {/* No more posts message */}
      {!hasNextPage && allPosts.length > 0 && (
        <Flex justify="center" style={{ padding: '2rem' }}>
          <Typography.Text type="secondary">
            Nu mai sunt postări de afișat
          </Typography.Text>
        </Flex>
      )}

      {/* Empty state */}
      {allPosts.length === 0 && !isLoading && (
        <Flex vertical align="center" gap="large" style={{ padding: '2rem' }}>
          <Typography.Title level={4}>
            {id === "all" ? "Nu sunt postări în feed" : "Nu sunt postări de afișat"}
          </Typography.Title>
          <Typography.Text type="secondary">
            {id === "all" ? "Urmărește mai mulți utilizatori pentru a vedea postările lor" : "Acest utilizator nu a postat încă nimic"}
          </Typography.Text>
        </Flex>
      )}
    </Flex>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(Posts);
