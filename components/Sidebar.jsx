"use client";
import React, { useCallback, useEffect, useState } from "react";
import Box from "./Box";
import css from "@/styles/Sidebar.module.css";
import { sidebarRoutes } from "@/lib/sidebar";
import { Typography, message } from "antd";
import Iconify from "./Iconify";
import cx from "classnames";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import SidebarContainer from "./SidebarContainer";
import { useSettingsContext } from "@/context/settings/settings-context";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { getUserDisplayName } from "@/utils/profileHelpers";

const Sidebar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  
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
  }, [pathname, handleDrawerClose]);

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
              <Link
                // if the route is profile, then add the person query
                href={
                  route.route === `/profile/${user?.id}`
                    ? `${route.route}?person=${getUserDisplayName(user)}`
                    : `${route.route}`
                }
                key={index}
                className={cx(css.item, isActive(route))}
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
                  {route.name}
                </Typography>
              </Link>
            ))}

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
              <Typography className="typoSubtitle2">Sign out</Typography>
            </div>
          </Box>
        </div>
      </SidebarContainer>
    )
  );
};

export default Sidebar;
