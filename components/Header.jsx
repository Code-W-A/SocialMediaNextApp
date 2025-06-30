"use client";
import React from "react";
import css from "@/styles/Header.module.css";
import { Flex, Dropdown, message, Button } from "antd";
import Image from "next/image";
import { useUser, useAuth } from "@/hooks/useFirebaseAuth";
import { Avatar } from "antd";
import Box from "./Box";
import SidebarButton from "./SidebarButton";
import Iconify from "./Iconify";
import { useRouter } from "next/navigation";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getUserDisplayName, shouldBlockNavigation } from "@/utils/profileHelpers";
import { useSubscription } from "@/hooks/useSubscription";
import { CrownOutlined } from "@ant-design/icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import { openSupport } from "@/utils/supportHelpers";

const Header = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { t } = useLanguage();

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

  const handleSupportClick = () => {
    console.log('🎧 [Header] Support menu item clicked');
    try {
      openSupport();
      console.log('✅ [Header] Support opened successfully');
    } catch (error) {
      console.error('❌ [Header] Error opening support:', error);
      message.error('Failed to open support chat');
    }
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
      key: 'support',
      label: t('common.support'),
      icon: <Iconify icon="eva:headphones-fill" width="16px" />,
      onClick: handleSupportClick
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
          </div>
          
          {/* actions */}
          <Flex gap={15} align="center"> 
            {/* Premium Button */}
            {!isPremium && (
              <Button
                type="primary"
                size="small"
                icon={<CrownOutlined />}
                onClick={() => handleNavigation('/premium')}
                className={css.premiumButton}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: 'none',
                  color: '#000',
                  fontWeight: '600',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                }}
              >
                <span className={css.premiumText}>{t('common.premium')}</span>
              </Button>
            )}
              
            <LanguageSwitcher size="small" />
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
