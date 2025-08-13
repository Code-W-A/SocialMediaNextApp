"use client";
import { Flex, Spin, Typography, Alert, Card, Button, Space } from "antd";
import React, { useEffect, useMemo, useCallback } from "react";
import Post from "./Post";
import PostSkeleton from "./PostSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyPostsFeed, getPosts } from "@/actions/post";
import { useInView } from "react-intersection-observer";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLanguage } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import Iconify from "@/components/Iconify";
import { useRouter } from "next/navigation";

const Posts = ({ id = "all" }) => {
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const { isPremium } = useSubscription();
  const router = useRouter();
  
  // Stable query key
  const queryKey = useMemo(() => ["posts", id, currentUser?.id], [id, currentUser?.id]);
  
  // Stable query function
  const queryFn = useCallback(({ pageParam = null }) => {
    if (id === "all") {
      // For main feed, get all public posts
      return getMyPostsFeed(currentUser?.id, pageParam);
    } else {
      // For specific user profile, get their posts
      return getPosts(pageParam, id);
    }
  }, [id, currentUser?.id]);

  // to know when the last element is in view
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Start loading 100px before the element is in view
  });

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
    enabled: !!currentUser?.id, // Only run when we have a current user
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    retry: 1, // Fewer retries to prevent long hangs
    gcTime: 1000 * 60 * 10, // keep cache for smoother back/forward nav
    meta: {
      onErrorMessage: t('posts.failedToLoadFallback') || 'Nu am putut încărca postările. Reîncearcă. '
    }
  });

  // Get all posts from all pages for real-time interactions - memoized
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    const posts = data.pages.flatMap(page => page?.data || []);
    
    // Debug logging for posts with comments
    posts.forEach(post => {
      if (post.comments && post.comments.length > 0) {
        console.log("📝 Posts.jsx - Post with comments:", {
          postId: post.id,
          commentsCount: post.comments.length,
          comments: post.comments.map(comment => ({
            id: comment.id,
            comment: comment.comment?.substring(0, 30) + "...",
            authorId: comment.authorId,
            authorData: comment.author,
            authorName: (() => {
              const firstName = comment.author?.first_name || comment.author?.firstName || "";
              const lastName = comment.author?.last_name || comment.author?.lastName || "";
              const fullName = `${firstName} ${lastName}`.trim();
              return fullName || comment.author?.username || "NO_NAME";
            })()
          }))
        });
      }
    });
    
    return posts;
  }, [data?.pages]);

  const [parent] = useAutoAnimate();

  // Stable fetchNextPage effect
  useEffect(() => {
    // if the last element is in view and there is a next page, fetch the next page
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, inView, fetchNextPage, isFetchingNextPage]);

  // Stable function for checking last view ref
  const checkLastViewRef = useCallback((index, page) => {
    return index === page.data.length - 1;
  }, []);

  if (!currentUser?.id) {
    return (
      <Flex vertical align="center" gap={"large"}>
        <Typography>Please log in to view posts</Typography>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex vertical gap={"small"}>
        <Alert type="error" showIcon message={t('posts.failedToLoadFallback') || 'Nu am putut încărca postările.'} description={error.message} />
        <Flex>
          <Typography.Link onClick={() => fetchNextPage()}>Încearcă din nou</Typography.Link>
        </Flex>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex vertical gap="large">
        {[1, 2, 3].map((index) => (
          <PostSkeleton key={index} />
        ))}
      </Flex>
    );
  }

  if (isSuccess) {
    return (
      <Flex vertical gap="large" ref={parent}>
        {data?.pages?.map((page, pageIdx) =>
          page?.data?.flatMap((post, index) => {
            const elements = [];
            const isLastPost = checkLastViewRef(index, page);
            const keyBase = `${pageIdx}-${post?.id || index}`;

            if (isLastPost) {
              elements.push(
                <div ref={ref} key={`${keyBase}-post`}>
                  <Post data={post} queryId={id} />
                </div>
              );
            } else {
              elements.push(
                <div key={`${keyBase}-post`}>
                  <Post data={post} queryId={id} />
                </div>
              );
            }

            // Insert upsell after every 5 posts in main feed for non-premium
            const overallIndex = pageIdx * (page?.data?.length || 0) + index + 1;
            const shouldShowUpsell = id === 'all' && !isPremium && overallIndex % 5 === 0;
            if (shouldShowUpsell) {
              elements.push(
                <Card
                  key={`${keyBase}-upsell`}
                  hoverable
                  style={{
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #fff7e6 0%, #fff1b8 100%)',
                    border: '1px solid #ffe58f',
                    padding: 16
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #ffd666, #ffe58f)'
                    }}>
                      <Iconify icon="mdi:crown" width="28px" style={{ color: '#ad6800' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Typography.Text strong style={{ color: '#ad6800', fontSize: 16 }}>
                        {t('premium.upsellCardTitle')}
                      </Typography.Text>
                      <div style={{ marginTop: 6 }}>
                        <Typography.Text type="secondary" style={{ color: '#8c6d1f' }}>
                          {t('premium.upsellCardSubtitle')}
                        </Typography.Text>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Iconify icon="fluent:top-speed-20-filled" width="18px" style={{ color: '#d48806' }} />
                          <Typography.Text style={{ color: '#8c6d1f', fontWeight: 600, fontSize: 12 }}>
                            {t('premium.priorityCompatibility')}
                          </Typography.Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Iconify icon="mdi:heart" width="18px" style={{ color: '#d4380d' }} />
                          <Typography.Text style={{ color: '#8c6d1f', fontWeight: 600, fontSize: 12 }}>
                            {t('premium.moreMatches')}
                          </Typography.Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Iconify icon="mdi:rocket-launch" width="18px" style={{ color: '#531dab' }} />
                          <Typography.Text style={{ color: '#8c6d1f', fontWeight: 600, fontSize: 12 }}>
                            {t('premium.increasedVisibility')}
                          </Typography.Text>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                        <Typography.Text style={{ color: '#8c6d1f', fontSize: 12 }}>
                          {t('premium.monthlyPrice')}
                        </Typography.Text>
                        <Button
                          type="primary"
                          onClick={() => router.push('/premium')}
                          style={{
                            background: '#faad14',
                            borderColor: '#faad14',
                            color: '#000',
                            fontWeight: 700,
                            borderRadius: 999,
                            height: 32
                          }}
                          icon={<Iconify icon="mdi:crown" width="16px" />}
                        >
                          {t('premium.upsellCardCTA')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }

            return elements;
          })
        )}

        {(isFetchingNextPage) && (
          <Flex vertical gap="large" style={{ padding: '1rem 0' }}>
            {[1, 2].map((index) => (
              <PostSkeleton key={`loading-more-${index}`} />
            ))}
          </Flex>
        )}

        {/* Show empty state if no posts */}
        {data?.pages?.length > 0 && data?.pages?.every(page => (page?.data || []).length === 0) && (
          <Flex vertical align="center" gap={"large"} style={{ padding: '2rem' }}>
            <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
              {id === "all" 
                ? t('posts.noPostsAvailable')
                : "Nu sunt postări disponibile."}
            </Typography.Text>
          </Flex>
        )}
      </Flex>
    );
  }

  return null;
};

export default Posts;
