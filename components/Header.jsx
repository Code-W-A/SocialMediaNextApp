"use client";
import React from "react";
import css from "@/styles/Header.module.css";
import { Flex, Dropdown, message } from "antd";
import Image from "next/image";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { Avatar } from "antd";
import Box from "./Box";
import ModeButton from "./ModeButton";
import SidebarButton from "./SidebarButton";
import Iconify from "./Iconify";
import { useRouter } from "next/navigation";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getUserDisplayName } from "@/utils/profileHelpers";

const Header = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      message.success("Logged out successfully!");
      router.push("/sign-in");
    } else {
      message.error("Failed to logout. Please try again.");
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <Iconify icon="eva:person-fill" width="16px" />,
      onClick: () => router.push(`/profile/${user?.id}?person=${getUserDisplayName(user)}`)
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Iconify icon="eva:settings-fill" width="16px" />,
      onClick: () => router.push('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <Iconify icon="eva:log-out-fill" width="16px" />,
      onClick: handleLogout,
      danger: true
    },
  ];
  
  return (
    <header className={css.wrapper}>
      <Box style={{ height: "100%" }}>
        <div className={css.container}>
          {/* sidbear button */}
          <div className={css.sidebarButton}>
            <SidebarButton />
          </div>

          {/* logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '8px 16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
          }}>
            <Iconify 
              icon="eva:star-fill" 
              width="24px" 
              style={{ color: '#FFD700' }} 
            />
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              YDestiny
            </span>
            <span style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Calea Destinului
            </span>
          </div>
          
          {/* actions */}
          <Flex gap={25} align="center"> 
            <ModeButton />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
            >
              <Avatar 
                src={getMainProfileImage(user?.images)} 
                size={40} 
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Flex>
        </div>
      </Box>
    </header>
  );
};

export default Header;
