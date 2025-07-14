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
import { openSupport } from "@/utils/supportHelpers";
import { useLanguage } from "@/lib/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationBadge from "./NotificationBadge";

const BottomNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { settings: { theme } } = useSettingsContext();
  const { t } = useLanguage();
  const { unreadMessagesCount, newCompatibilitiesCount, markCompatibilitiesAsSeen } = useNotifications(user);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        message.success(t('common.success'));
        router.push("/sign-in");
      } else {
        message.error(t('common.error'));
      }
    } catch (error) {
      console.error("Sign out error:", error);
      message.error(t('common.error'));
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

  const handleSupportClick = () => {
    console.log('🎧 [BottomNavbar] Support menu item clicked');
    try {
      openSupport();
      console.log('✅ [BottomNavbar] Support opened successfully');
    } catch (error) {
      console.error('❌ [BottomNavbar] Error opening support:', error);
      message.error(t('common.error'));
    }
  };

  const toggleNavbarVisibility = () => {
    setIsVisible(!isVisible);
  };

  const profileMenuItems = [
    {
      key: 'profile',
      label: t('common.profile'),
      icon: <Iconify icon="eva:person-fill" width="16px" />,
      onClick: () => router.push(`/profile/${user?.id}?person=${getUserDisplayName(user)}`)
    },
    // {
    //   key: 'settings',
    //   label: t('common.settings'),
    //   icon: <Iconify icon="eva:settings-fill" width="16px" />,
    //   onClick: () => handleNavigation('/settings')
    // },
    {
      key: 'contact',
      label: t('common.contact'),
      icon: <Iconify icon="eva:email-fill" width="16px" />,
      onClick: () => router.push('/contact')
    },
    // {
    //   key: 'support',
    //   label: t('common.support'),
    //   icon: <Iconify icon="eva:headphones-fill" width="16px" />,
    //   onClick: handleSupportClick
    // },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('common.logout'),
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

  // Helper function to render icon with notification badge
  const renderIconWithBadge = (route) => {
    if (route.route === '/messages') {
      return (
        <NotificationBadge
          icon={route.icon}
          width="24px"
          color={activeColor(route)}
          count={unreadMessagesCount}
          size="small"
        />
      );
    } else if (route.route === '/matches') {
      return (
        <NotificationBadge
          icon={route.icon}
          width="24px"
          color={activeColor(route)}
          count={newCompatibilitiesCount}
          size="small"
        />
      );
    } else {
      return (
        <Iconify 
          icon={route.icon} 
          width="24px" 
          style={{ color: activeColor(route) }}
        />
      );
    }
  };

  if (!mounted) return null;

  const routes = sidebarRoutes(user);
  const leftRoutes = routes.slice(0, 2);
  const rightRoutes = routes.slice(2, 4);

  return (
    <>
      {/* Main Navbar */}
      <div className={`${css.wrapper} ${theme === 'dark' ? css.dark : css.light} ${isVisible ? css.visible : css.hidden}`}>
        {/* Toggle Button positioned at top of navbar */}
        <div 
          className={css.toggleButton}
          onClick={toggleNavbarVisibility}
          role="button"
          tabIndex={0}
          aria-label="Toggle navbar"
        >
          <div className={`${css.toggleButtonInner} ${theme === 'dark' ? css.toggleDark : css.toggleLight}`}>
            <Iconify 
              icon="eva:chevron-down-fill" 
              width="28px" 
              style={{ 
                color: theme === 'dark' ? '#fff' : '#666',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
        </div>

        <div className={css.container}>
          {/* Left Navigation Items */}
          {leftRoutes.map((route, index) => (
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
                {renderIconWithBadge(route)}
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

          {/* Right Navigation Items */}
          {rightRoutes.map((route, index) => (
            <div
              key={index + 2}
              className={cx(css.navItem, isActive(route))}
              onClick={(e) => handleNavClick(e, route)}
              onTouchStart={(e) => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={(e) => e.currentTarget.style.opacity = '1'}
              role="button"
              tabIndex={0}
              aria-label={route.name}
            >
              <div className={css.iconContainer}>
                {renderIconWithBadge(route)}
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
                {t('common.more')}
              </Typography.Text>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Floating Toggle Button (visible when navbar is hidden) */}
      {!isVisible && (
        <div className={`${css.floatingToggle} ${theme === 'dark' ? css.toggleDark : css.toggleLight}`}>
          <div 
            className={css.floatingToggleButton}
            onClick={toggleNavbarVisibility}
            role="button"
            tabIndex={0}
            aria-label="Show navbar"
          >
            <div className={css.floatingToggleDecoration} />
            <Iconify 
              icon="eva:chevron-up-fill" 
              width="32px" 
              style={{ 
                color: theme === 'dark' ? '#fff' : '#666',
                zIndex: 2,
                position: 'relative'
              }}
            />
            <div className={css.floatingToggleDecoration} />
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavbar; 