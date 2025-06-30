"use client";
import React, { useState, useEffect } from "react";
import css from "@/styles/BottomNavbar.module.css";
import { Typography, Avatar, Dropdown, message } from "antd";
import Iconify from "./Iconify";
import cx from "classnames";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { sidebarRoutes } from "@/lib/sidebar";
import { useSettingsContext } from "@/context/settings/settings-context";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getUserDisplayName, shouldBlockNavigation } from "@/utils/profileHelpers";

const BottomNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { settings: { theme } } = useSettingsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        message.success("Signed out successfully!");
        router.push("/sign-in");
      } else {
        message.error("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      message.error("Something went wrong. Please try again.");
    }
  };

  const handleNavigation = (path) => {
    if (shouldBlockNavigation(user, path)) {
      message.warning("Please complete your profile before accessing other parts of the application.");
      router.push(`/profile/${user?.id}?person=${getUserDisplayName(user)}`);
      return;
    }
    router.push(path);
  };

  const handleNavClick = (e, route) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetPath = route.route === `/profile/${user?.id}`
      ? `${route.route}?person=${getUserDisplayName(user)}`
      : route.route;
    
    if (route.route.includes('/profile') || !shouldBlockNavigation(user, route.route)) {
      router.push(targetPath);
    } else {
      handleNavigation(route.route);
    }
  };

  const profileMenuItems = [
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
      onClick: () => handleNavigation('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <Iconify icon="eva:log-out-fill" width="16px" />,
      onClick: handleSignOut,
      danger: true
    },
  ];

  const isActive = (route) => {
    if (route.route === pathname) return css.active;
  };

  const activeColor = (route) => {
    if (isActive(route)) return "var(--primary)";
    return theme === 'dark' ? '#ccc' : '#666';
  };

  if (!mounted) return null;

  return (
    <div className={`${css.wrapper} ${theme === 'dark' ? css.dark : css.light}`}>
      <div className={css.container}>
        {/* Navigation Items */}
        {sidebarRoutes(user).slice(0, 4).map((route, index) => (
          <div
            key={index}
            className={cx(css.navItem, isActive(route))}
            onClick={(e) => handleNavClick(e, route)}
            onTouchStart={(e) => e.currentTarget.style.opacity = '0.7'}
            onTouchEnd={(e) => e.currentTarget.style.opacity = '1'}
            role="button"
            tabIndex={0}
            aria-label={route.name}
          >
            <div className={css.iconContainer}>
              <Iconify 
                icon={route.icon} 
                width="24px" 
                style={{ color: activeColor(route) }}
              />
              {isActive(route) && <div className={css.activeIndicator} />}
            </div>
            <Typography.Text 
              className={css.label}
              style={{ color: activeColor(route) }}
            >
              {route.name}
            </Typography.Text>
          </div>
        ))}

        {/* Profile/More Menu with Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          placement="topRight"
          arrow={{ pointAtCenter: true }}
          trigger={['click']}
        >
          <div 
            className={cx(css.navItem, pathname.includes('profile') ? css.active : '')}
            role="button"
            tabIndex={0}
            aria-label="More options"
          >
            <div className={css.iconContainer}>
              <Avatar 
                src={getMainProfileImage(user?.images)} 
                size={28}
                style={{ 
                  border: pathname.includes('profile') ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer'
                }}
              />
              {pathname.includes('profile') && <div className={css.activeIndicator} />}
            </div>
            <Typography.Text 
              className={css.label}
              style={{ 
                color: pathname.includes('profile') ? 'var(--primary)' : (theme === 'dark' ? '#ccc' : '#666'),
                cursor: 'pointer'
              }}
            >
              More
            </Typography.Text>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default BottomNavbar; 