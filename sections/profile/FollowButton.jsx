"use client";
import { getAllFollowersAndFollowings, updateFollow } from "@/actions/user";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Skeleton, Typography } from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FollowButton = ({ id }) => {
  const [followed, setFollowed] = useState(false);
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", currentUser?.id, "followInfo"],
    queryFn: () => getAllFollowersAndFollowings(currentUser?.id),
    enabled: !!currentUser,
    // 20 mins stale time
    staleTime: 1000 * 60 * 20,
  });

  // deciding the status of follow button
  useEffect(() => {
    if (data?.following?.map((person) => person?.followingId).includes(id)) {
      setFollowed(true);
    } else {
      setFollowed(false);
    }
  }, [data, setFollowed, id, isLoading]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateFollow,

    onMutate: ({ type }) => {
      setFollowed(!followed);
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      // profile user
      queryClient.cancelQueries(["user", id, "followInfo"]);
      // current user
      queryClient.cancelQueries(["user", currentUser?.id, "followInfo"]);

      // Snapshot the previous value
      const snapShotOfCurrentUser = queryClient.getQueryData([
        "user",
        currentUser?.id,
        "followInfo",
      ]);
      const snapShotOfProfileUser = queryClient.getQueryData([
        "user",
        id,
        "followInfo",
      ]);

      queryClient.setQueryData(
        ["user", currentUser?.id, "followInfo"],
        (old) => {
          return {
            ...old,
            following:
              type === "follow"
                ? [...old.following, { followingId: id }]
                : old.following.filter((person) => person.followingId !== id),
          };
        }
      );

      queryClient.setQueryData(["user", id, "followInfo"], (old) => {
        return {
          ...old,
          followers:
            type === "follow"
              ? [...old.followers, { followerId: currentUser?.id }]
              : old.followers.filter(
                  (person) => person.followerId !== currentUser?.id
                ),
        };
      });

      // Return a context object with the snapshotted value
      return { snapShotOfCurrentUser, snapShotOfProfileUser };
    },

    onError: (err, variables, context) => {
      setFollowed(!followed);

      queryClient.setQueryData(
        ["user", currentUser?.id, "followInfo"],
        context.snapShotOfCurrentUser
      );
      queryClient.setQueryData(
        ["user", id, "followInfo"],
        context.snapShotOfProfileUser
      );

      toast.error("Something wrong happened. Try again!");
      console.error("Something wrong happened. Try again!", err);
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(["user", currentUser?.id, "followInfo"]);
      queryClient.invalidateQueries(["user", id, "followInfo"]);
    },
  });

  if (isLoading)
    return (
      <Skeleton.Button active={true} size="large" style={{ width: "100%" }} />
    );

  if (isError)
    return <Alert message="Error while fetching data" type="error" />;

  // TEMPORARILY COMMENTED OUT - FOLLOW FUNCTIONALITY
  return null;
  
  /*
  return (
    <Button
      disabled={isPending}
      style={{
        background: followed 
          ? "linear-gradient(135deg, #f093fb15, #f5576c15)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: followed 
          ? "1px solid #f093fb50"
          : "none",
        borderRadius: "8px",
        boxShadow: followed 
          ? "0 2px 8px rgba(240, 147, 251, 0.2)"
          : "0 4px 12px rgba(102, 126, 234, 0.3)",
        width: "100%"
      }}
      onClick={() => mutate({ id, type: followed ? "unfollow" : "follow" })}
    >
      {isPending ? (
        <Typography className="typoSubtitle2" style={{ 
          color: followed ? "#f093fb" : "white" 
        }}>
          Se încarcă...
        </Typography>
      ) : (
        <Typography className="typoSubtitle2" style={{ 
          color: followed ? "#f093fb" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}>
          {followed ? (
            <>
              <span>🔗</span>
              <span>În rezonanță</span>
            </>
          ) : (
            <>
              <span>⭐</span>
              <span>Rezonez</span>
            </>
          )}
        </Typography>
      )}
    </Button>
  );
  */
};

export default FollowButton;
