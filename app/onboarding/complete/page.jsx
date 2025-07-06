"use client";
import React, { useEffect, useState } from "react";
import { Button, Typography, Result } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/lib/i18n";
import layoutCss from "@/styles/onboardingLayout.module.css";
import Iconify from "@/components/Iconify";

const { Title, Text } = Typography;

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { user, refreshUser, signOut } = useAuth();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle logout and redirect to login
  const handleGoBackToLogin = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/sign-in');
      } else {
        console.error('Logout failed:', result.error);
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/sign-in');
    }
  };

  // Refresh user data when component mounts to ensure onboardingCompleted is updated
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    if (user) {
      refreshUserData();
    }
  }, [user?.id, refreshUser]);

  const handleGoToHome = async () => {
    try {
      // Force refresh user data before redirecting to ensure onboardingCompleted is true
      await refreshUser();
      
      // Clean up all temporary onboarding data from localStorage
      if (user?.id) {
        localStorage.removeItem(`onboarding_photos_${user.id}`);
        localStorage.removeItem(`onboarding_profile_${user.id}`);
        localStorage.removeItem(`onboarding_questionnaire_${user.id}`);
        console.log('🧹 Cleaned up all temporary onboarding data from localStorage');
      }
      
      // Add a small delay to ensure all changes have propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push("/home");
    } catch (error) {
      console.error('Error refreshing user before redirect:', error);
      // Still redirect even if refresh fails
      router.push("/home");
    }
  };

  return (
    <div className={layoutCss.singleColumnLayout}>
      {/* Go Back to Login Button */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 10 
      }}>
        <Button
          type="text"
          onClick={handleGoBackToLogin}
          icon={<Iconify icon="eva:arrow-back-fill" width="16px" />}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ 
            display: isMobile ? 'none' : 'inline' 
          }}>
            {t('onboarding.goBackToLogin')}
          </span>
        </Button>
      </div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        height: "100%",
        textAlign: "center"
      }}>
        <Result
          icon={
            <div style={{
              fontSize: "64px",
              marginBottom: "1rem"
            }}>
              🎉
            </div>
          }
          title={
            <Title level={2} style={{ color: "var(--primary)", margin: "0 0 1rem" }}>
              {t('onboarding.welcomeToYDestiny')}
            </Title>
          }
          subTitle={
            <div>
              <Text style={{ fontSize: "16px", color: "#666", display: "block", marginBottom: "0.5rem" }}>
                {t('onboarding.profileComplete')}
              </Text>
              <Text style={{ fontSize: "14px", color: "#999" }}>
                {t('onboarding.updateProfileLater')}
              </Text>
            </div>
          }
          extra={
            <Button
              type="primary"
              size="large"
              onClick={handleGoToHome}
              style={{
                height: "48px",
                borderRadius: "12px",
                fontWeight: "500",
                minWidth: "200px"
              }}
            >
              {t('onboarding.startExploring')}
            </Button>
          }
        />
      </div>
    </div>
  );
} 