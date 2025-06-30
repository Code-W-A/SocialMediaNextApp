"use client";
import React, { useCallback, useMemo } from "react";
import Box from "./Box";
import css from "@/styles/FollowSuggestions.module.css";
import { Alert, Avatar, Flex, Skeleton, Typography, Badge } from "antd";
import { getOnlineCompatibleUsers } from "@/actions/admin";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useQuery } from "@tanstack/react-query";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getDisplayName } from "@/utils/profileHelpers";
import Iconify from "./Iconify";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Add the relativeTime plugin
dayjs.extend(relativeTime);

const OnlineCompatibleUsers = () => {
  const { user: currentUser } = useUser();
  
  // Stable query key
  const queryKey = useMemo(() => ["user", "onlineCompatibleUsers", currentUser?.id], [currentUser?.id]);
  
  // Stable query function
  const queryFn = useCallback(() => getOnlineCompatibleUsers(currentUser?.id), [currentUser?.id]);
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes (reduced from 3 minutes)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    retry: 2, // Retry failed requests only 2 times
  });

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'online':
        return '#52c41a'; // Green
      case 'away':
        return '#faad14'; // Yellow/Orange
      default:
        return '#d9d9d9'; // Gray
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'online':
        return 'mdi:circle';
      case 'away':
        return 'mdi:circle';
      default:
        return 'mdi:circle-outline';
    }
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoize skeleton items to prevent recreation
  const skeletonItems = useMemo(() => (
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Flex key={i} gap={"1rem"} align="center">
          <Badge dot color="#52c41a">
            <Avatar size={40} />
          </Badge>
          <Flex vertical flex={1}>
            <Typography.Text className={"typoBody2"} strong>
              <Skeleton.Input active size={"small"} />
            </Typography.Text>
            <Typography.Text
              className={"typoCaption"}
              strong
              type="secondary"
            >
              <Skeleton.Input
                active
                size={"small"}
                style={{ height: ".5rem", marginTop: ".4rem" }}
              />
            </Typography.Text>
          </Flex>
        </Flex>
      ))
  ), []);

  return (
    <div className={css.wrapper}>
      <Box>
        <div className={css.container}>
          <div className={css.title}>
            <Flex align="center" justify="space-between">
              <Typography className={"typoSubtitle1"}>
                Utilizatori Compatibili Online
              </Typography>
              <Iconify 
                icon="material-symbols:refresh" 
                width={18} 
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={handleRefresh}
              />
            </Flex>
          </div>

          {isLoading && (
            <Flex vertical gap={"1rem"}>
              {skeletonItems}
            </Flex>
          )}

          {isError && (
            <Alert
              message="Error"
              description="Unable to fetch online users. Try again later"
              type="error"
              showIcon
            />
          )}

          {/* online users */}
          {!isLoading && !isError && data?.length > 0 ? (
            <Flex vertical gap={"1rem"}>
              {data.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}?person=${getDisplayName(user)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Flex 
                    gap={"1rem"} 
                    align="center" 
                    style={{ 
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f5f5f5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Avatar with online status */}
                    <div style={{ position: 'relative' }}>
                      <Avatar 
                        size={40} 
                        src={getMainProfileImage(user?.images)}
                      >
                        {user?.first_name?.[0] || user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0]}
                      </Avatar>
                      {/* Online status indicator */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(user.status),
                          border: '2px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Iconify 
                          icon={getStatusIcon(user.status)}
                          width={8}
                          color="white"
                        />
                      </div>
                    </div>

                    {/* User info */}
                    <Flex vertical flex={1}>
                      <Typography.Text 
                        className={"typoSubtitle2"} 
                        ellipsis
                        strong
                      >
                        {getDisplayName(user)}
                      </Typography.Text>
                      <Flex align="center" gap="4px">
                        <Typography.Text 
                          className={"typoCaption"} 
                          type="secondary"
                          style={{ 
                            color: getStatusColor(user.status),
                            textTransform: 'capitalize'
                          }}
                        >
                          {user.status === 'online' ? 'Online' : 
                           user.status === 'away' ? 'Away' : 
                           `Last seen ${dayjs(user.lastSeen).fromNow()}`}
                        </Typography.Text>
                      </Flex>
                    </Flex>

                    {/* Message icon */}
                    <div style={{ opacity: 0.6 }}>
                      <Iconify 
                        icon="material-symbols:chat-bubble-outline" 
                        width={18}
                        color="var(--primary)"
                      />
                    </div>
                  </Flex>
                </Link>
              ))}
            </Flex>
          ) : (
            !isLoading && !isError && (
              <Flex vertical align="center" gap={"large"} style={{ padding: '1rem' }}>
                <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
                  Nu sunt utilizatori compatibili online în acest moment.
                </Typography.Text>
              </Flex>
            )
          )}
        </div>
      </Box>
      
      <style jsx>{`
        .hover-bg:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
      `}</style>
    </div>
  );
};

export default OnlineCompatibleUsers;
