"use client";
import { Flex, Spin, Typography } from "antd";
import React, { useEffect, useMemo, useCallback } from "react";
import Post from "./Post";
import PostSkeleton from "./PostSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyPostsFeed, getPosts } from "@/actions/post";
import { useInView } from "react-intersection-observer";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLanguage } from "@/lib/i18n";

const Posts = ({ id = "all" }) => {
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  
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
    retry: 2, // Retry failed requests only 2 times
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
      <Flex vertical align="center" gap={"large"}>
        <Typography.Text type="danger">
          Something went wrong: {error.message}
        </Typography.Text>
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
        {data?.pages?.map((page) =>
          page?.data?.map((post, index) => {
            const isLastPost = checkLastViewRef(index, page);
            return isLastPost ? (
              <div ref={ref} key={post?.id}>
                <Post data={post} queryId={id} />
              </div>
            ) : (
              <div key={post?.id}>
                <Post data={post} queryId={id} />
              </div>
            );
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
        {data?.pages?.every(page => page?.data?.length === 0) && (
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
