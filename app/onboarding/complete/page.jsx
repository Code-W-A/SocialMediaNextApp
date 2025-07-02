"use client";
import React, { useEffect } from "react";
import { Button, Typography, Result } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/lib/i18n";
import layoutCss from "@/styles/onboardingLayout.module.css";

const { Title, Text } = Typography;

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

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