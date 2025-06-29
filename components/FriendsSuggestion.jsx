"use client";
import React from "react";
import Box from "./Box";
import css from "@/styles/FollowSuggestions.module.css";
import { Alert, Avatar, Flex, Skeleton, Typography, Badge, Button } from "antd";
import { getOnlineCompatibleUsers } from "@/actions/admin";
import { useUser } from "@/hooks/useFirebaseAuth";
import { useQuery } from "@tanstack/react-query";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getDisplayName } from "@/utils/profileHelpers";
import Iconify from "./Iconify";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";

// Add the relativeTime plugin
dayjs.extend(relativeTime);

const OnlineCompatibleUsers = () => {
  const { currentUser } = useUser();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", "onlineCompatibleUsers", currentUser?.id],
    queryFn: () => getOnlineCompatibleUsers(currentUser?.id),
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time for online status
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes to update online status
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#52c41a'; // Green
      case 'away':
        return '#faad14'; // Yellow/Orange
      default:
        return '#d9d9d9'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return 'mdi:circle';
      case 'away':
        return 'mdi:circle';
      default:
        return 'mdi:circle-outline';
    }
  };

  const handleMessageClick = (e, userId, userName) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/messages?userId=${userId}&userName=${encodeURIComponent(userName)}`);
  };

  return (
    <div className={`${css.wrapper} ${isMobile ? css.mobileWrapper : ''}`}>
      <Box>
        <div className={`${css.container} ${isMobile ? css.mobileContainer : ''}`}>
          <div className={css.title}>
            <Flex align="center" justify="space-between">
              <Typography className={"typoSubtitle1"}>
                Utilizatori Compatibili Online
              </Typography>
              <Iconify 
                icon="material-symbols:refresh" 
                width={18} 
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={() => refetch()}
              />
            </Flex>
          </div>

          {isLoading && (
            // skeleton
            <Flex vertical={!isMobile} horizontal={isMobile} gap={"1rem"} style={isMobile ? { overflowX: 'auto', paddingBottom: '8px' } : {}}>
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Flex key={i} gap={"1rem"} align="center" vertical={isMobile} style={isMobile ? { minWidth: '120px', flexShrink: 0 } : {}}>
                    <Badge dot color="#52c41a">
                      <Avatar size={isMobile ? 60 : 40} />
                    </Badge>
                    <Flex vertical flex={1} align={isMobile ? "center" : "flex-start"}>
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
                ))}
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
            <Flex 
              vertical={!isMobile} 
              horizontal={isMobile} 
              gap={"1rem"} 
              style={isMobile ? { 
                overflowX: 'auto', 
                paddingBottom: '8px',
                scrollBehavior: 'smooth'
              } : {}}
            >
              {data.map((user) => (
                <div
                  key={user.id}
                  style={isMobile ? { 
                    minWidth: '140px', 
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  } : {}}
                >
                  <Link
                    href={`/profile/${user.id}?person=${getDisplayName(user)}`}
                    style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                  >
                    <Flex 
                      gap={isMobile ? "8px" : "1rem"} 
                      align="center" 
                      vertical={isMobile}
                      style={{ 
                        padding: isMobile ? '12px 8px' : '8px',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer',
                        width: '100%'
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
                          size={isMobile ? 60 : 40} 
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
                            width: isMobile ? 16 : 12,
                            height: isMobile ? 16 : 12,
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
                            width={isMobile ? 10 : 8}
                            color="white"
                          />
                        </div>
                      </div>

                      {/* User info */}
                      <Flex vertical flex={1} align={isMobile ? "center" : "flex-start"}>
                        <Typography.Text 
                          className={isMobile ? "typoCaption" : "typoSubtitle2"} 
                          ellipsis
                          strong
                          style={isMobile ? { textAlign: 'center', fontSize: '12px' } : {}}
                        >
                          {getDisplayName(user)}
                        </Typography.Text>
                        <Flex align="center" gap="4px">
                          <Typography.Text 
                            className={"typoCaption"} 
                            type="secondary"
                            style={{ 
                              color: getStatusColor(user.status),
                              textTransform: 'capitalize',
                              fontSize: isMobile ? '10px' : '12px',
                              textAlign: isMobile ? 'center' : 'left'
                            }}
                          >
                            {user.status === 'online' ? 'Online' : 
                             user.status === 'away' ? 'Away' : 
                             `Last seen ${dayjs(user.lastSeen).fromNow()}`}
                          </Typography.Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Link>
                  
                  {/* Message button */}
                  <Button
                    type="primary"
                    size={isMobile ? "small" : "middle"}
                    style={isMobile ? { 
                      marginTop: '8px', 
                      fontSize: '11px',
                      height: '28px',
                      width: '100%'
                    } : { 
                      marginLeft: 'auto',
                      marginTop: '4px'
                    }}
                    onClick={(e) => handleMessageClick(e, user.id, getDisplayName(user))}
                  >
                    {t('common.message')}
                  </Button>
                </div>
              ))}
            </Flex>
          ) : (
            !isLoading && !isError && (
              <Flex 
                vertical 
                align="center" 
                gap="1rem" 
                style={{ padding: '2rem 1rem', textAlign: 'center' }}
              >
                <Iconify 
                  icon="material-symbols:person-off-outline" 
                  width={40}
                  color="#d9d9d9"
                />
                <Typography.Text type="secondary">
                  Nu sunt utilizatori compatibili online momentan
                </Typography.Text>
                <Typography.Text 
                  type="secondary" 
                  style={{ fontSize: '12px' }}
                >
                  Încearcă din nou mai târziu
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
