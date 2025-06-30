"use client";
import React, { useCallback, useEffect, useState } from "react";
import Box from "./Box";
import css from "@/styles/Sidebar.module.css";
import { sidebarRoutes } from "@/lib/sidebar";
import { Typography, message, Divider } from "antd";
import Iconify from "./Iconify";
import cx from "classnames";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import SidebarContainer from "./SidebarContainer";
import { useSettingsContext } from "@/context/settings/settings-context";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { getUserDisplayName, shouldBlockNavigation } from "@/utils/profileHelpers";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const Sidebar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    settings: { isSidebarOpen },
    setSettings,
  } = useSettingsContext();

  const handleDrawerClose = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      isSidebarOpen: false,
    }));
  }, [setSettings]);

  useEffect(() => {
    if (isSidebarOpen) {
      handleDrawerClose();
    }
  }, [pathname, handleDrawerClose, isSidebarOpen]);

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

  const isActive = (route) => {
    if (route.route === pathname) return css.active;
  };

  const activeColor = (route) => {
    return isActive(route) && "var(--primary)";
  };

  return (
    mounted && (
      <SidebarContainer
        isDrawrOpen={isSidebarOpen}
        setIsDrawerOpen={handleDrawerClose}
      >
        <div className={css.wrapper}>
          <Box className={css.container}>
            {sidebarRoutes(user).map((route, index) => (
              <div
                key={index}
                className={cx(css.item, isActive(route))}
                onClick={() => {
                  const targetPath = route.route === `/profile/${user?.id}`
                    ? `${route.route}?person=${getUserDisplayName(user)}`
                    : route.route;
                  
                  if (route.route.includes('/profile') || !shouldBlockNavigation(user, route.route)) {
                    router.push(targetPath);
                  } else {
                    handleNavigation(route.route);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* icon */}
                <Typography style={{ color: activeColor(route) }}>
                  <Iconify icon={route.icon} width={"20px"} />
                </Typography>

                {/* name */}
                <Typography
                  className="typoSubtitle2"
                  style={{ color: activeColor(route) }}
                >
                  {t(`nav.${route.key}`)}
                </Typography>
              </div>
            ))}

            <Divider style={{ margin: '12px 0' }} />
            
            {/* Language Switcher */}
            <div className={css.item} style={{ padding: '8px 12px' }}>
              <LanguageSwitcher size="small" style={{ width: '100%' }} />
            </div>

            <div
              className={cx(css.item)}
              onClick={handleSignOut}
              style={{ cursor: "pointer" }}
            >
              {/* icon */}
              <Typography>
                <Iconify icon={"solar:logout-2-bold"} width={"20px"} />
              </Typography>

              {/* name */}
              <Typography className="typoSubtitle2">{t('common.logout')}</Typography>
            </div>
          </Box>
        </div>
      </SidebarContainer>
    )
  );
};

export default Sidebar;
