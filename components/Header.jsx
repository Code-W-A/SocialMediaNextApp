"use client";
import React from "react";
import css from "@/styles/Header.module.css";
import { Flex, Dropdown, message, Button } from "antd";
import Image from "next/image";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { Avatar } from "antd";
import Box from "./Box";
import ModeButton from "./ModeButton";
import SidebarButton from "./SidebarButton";
import Iconify from "./Iconify";
import { useRouter } from "next/navigation";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getUserDisplayName, shouldBlockNavigation } from "@/utils/profileHelpers";
import { useSubscription } from "@/hooks/useSubscription";
import { CrownOutlined } from "@ant-design/icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import useIsMobile from "@/hooks/useIsMobile";

const Header = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      message.success(t('common.success'));
      router.push("/sign-in");
    } else {
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

  const userMenuItems = [
    {
      key: 'profile',
      label: t('common.profile'),
      icon: <Iconify icon="eva:person-fill" width="16px" />,
      onClick: () => router.push(`/profile/${user?.id}?person=${getUserDisplayName(user)}`)
    },
    {
      key: 'premium',
      label: isPremium ? t('premium.title') : t('premium.title'),
      icon: <CrownOutlined style={{ color: '#FFD700' }} />,
      onClick: () => handleNavigation('/premium')
    },
    {
      key: 'settings',
      label: t('common.settings'),
      icon: <Iconify icon="eva:settings-fill" width="16px" />,
      onClick: () => handleNavigation('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('common.logout'),
      icon: <Iconify icon="eva:log-out-fill" width="16px" />,
      onClick: handleLogout,
      danger: true
    },
  ];
  
    return (
    <header className={`${css.wrapper} ${isMobile ? css.mobileWrapper : ''}`}>
      <Box style={{ height: "100%" }}>
        <div className={`${css.container} ${isMobile ? css.mobileContainer : ''}`}>
          {/* Sidebar button - only on desktop tablet */}
          {!isMobile && (
            <div className={css.sidebarButton}>
              <SidebarButton />
            </div>
          )}

          {/* Logo - only on desktop */}
          {!isMobile && (
            <div className={css.logo}>
              <Iconify 
                icon="eva:star-fill" 
                width="24px" 
                style={{ color: '#FFD700' }} 
              />
              <span className={css.logoText}>
                YDestiny
              </span>
              <span className={css.logoSubtext}>
                Calea Destinului
              </span>
            </div>
          )}
          
          {/* Actions */}
          <Flex 
            gap={isMobile ? 20 : 15} 
            align="center" 
            className={`${css.actions} ${isMobile ? css.mobileActions : ''}`}
          > 
            {/* Premium Button */}
            {!isPremium && (
              <Button
                type="primary"
                size="small"
                icon={<CrownOutlined />}
                onClick={() => handleNavigation('/premium')}
                className={`${css.premiumButton} ${isMobile ? css.mobilePremiumButton : ''}`}
              >
                {!isMobile && <span className={css.premiumText}>{t('common.premium')}</span>}
              </Button>
            )}
              
            <LanguageSwitcher 
              size="small" 
              className={`${css.languageSwitcher} ${isMobile ? css.mobileLanguageSwitcher : ''}`} 
              mobileOnly={isMobile} 
            />
            
            {/* Desktop only elements */}
            {!isMobile && (
              <>
                <ModeButton className={css.modeButton} />
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                  trigger={['click']}
                  className={css.userDropdown}
                >
                  <Avatar 
                    src={getMainProfileImage(user?.images)} 
                    size={40} 
                    style={{ cursor: 'pointer' }}
                  />
                </Dropdown>
              </>
            )}
          </Flex>
        </div>
      </Box>
    </header>
  );
};

export default Header;
