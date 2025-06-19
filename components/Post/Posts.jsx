"use client";
import { Flex, Spin, Typography } from "antd";
import React, { useEffect } from "react";
import Post from "./Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyPostsFeed, getPosts } from "@/actions/post";
import { useInView } from "react-intersection-observer";
import { useUser } from "@/hooks/useFirebaseAuth";

const Posts = ({ id = "all" }) => {
  const { user: currentUser } = useUser();
  // to know when the last element is in view
  const { ref, inView } = useInView();

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
    queryKey: ["posts", id, currentUser?.id],
    queryFn: ({ pageParam = null }) => {
      if (id === "all") {
        // For main feed, get posts from compatible users + own posts
        return getMyPostsFeed(currentUser?.id, pageParam);
      } else {
        // For specific user profile, get their posts
        return getPosts(pageParam, id);
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.metaData?.lastCursor;
    },
    enabled: !!currentUser?.id, // Only run when we have a current user
  });

  useEffect(() => {
    // if the last element is in view and there is a next page, fetch the next page
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, inView, fetchNextPage]);

  const checkLastViewRef = (index, page) => {
    if (index === page.data.length - 1) {
      return true;
    } else return false;
  };

  if (!currentUser?.id) {
    return (
      <Flex vertical align="center" gap={"large"}>
        <Typography>Please log in to view posts</Typography>
      </Flex>
    );
  }

  if (error) {
    return <Typography>Something went wrong: {error.message}</Typography>;
  }

  if (isLoading) {
    return (
      <Flex vertical align="center" gap={"large"}>
        <Spin />
        <Typography>Loading...</Typography>
      </Flex>
    );
  }

  if (isSuccess) {
    return (
      <Flex vertical gap={"1rem"}>
        {data?.pages?.map((page) =>
          page?.data?.map((post, index) =>
            checkLastViewRef(index, page) ? (
              <div ref={ref} key={post?.id}>
                <Post data={post} queryId={id} />
              </div>
            ) : (
              <div key={post?.id}>
                <Post data={post} queryId={id} />
              </div>
            )
          )
        )}

        {(isLoading || isFetchingNextPage || isFetching) && (
          <Flex vertical align="center" gap={"large"}>
            <Spin />
            <Typography>Loading...</Typography>
          </Flex>
        )}

        {/* Show empty state if no posts */}
        {data?.pages?.every(page => page?.data?.length === 0) && (
          <Flex vertical align="center" gap={"large"} style={{ padding: '2rem' }}>
            <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
              {id === "all" 
                ? "Nu sunt postări disponibile. Începe să postezi sau conectează-te cu utilizatori compatibili!" 
                : "Nu sunt postări disponibile."}
            </Typography.Text>
          </Flex>
        )}
      </Flex>
    );
  }
};

export default Posts;
