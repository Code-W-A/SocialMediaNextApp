"use client";
import React, { useEffect, useState } from "react";
import { Button, Typography, Progress, Card } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import { getOnboardingProgress, checkOnboardingStatus } from "@/utils/onboardingHelpers";
import Iconify from "@/components/Iconify";
import LanguageSelector from "@/components/LanguageSelector";
import css from "@/styles/AuthPages.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";
import { useLanguage } from "@/lib/i18n";

const { Title, Text } = Typography;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
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

  // Check if onboarding is already complete and redirect to home
  useEffect(() => {
    if (user) {
      const status = checkOnboardingStatus(user);
      if (status.isComplete) {
        router.push('/home');
      }
    }
  }, [user, router]);

  // Handle logout and redirect to login
  const handleGoBackToLogin = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/sign-in');
      } else {
        console.error('Logout failed:', result.error);
        // Still redirect even if logout fails
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if logout fails
      router.push('/sign-in');
    }
  };

  // Handle go back to landing page
  const handleGoBackToLandingPage = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      } else {
        console.error('Logout failed:', result.error);
        // Still redirect even if logout fails
        router.push('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if logout fails
      router.push('/');
    }
  };

  // Get real onboarding progress
  const progress = user ? getOnboardingProgress(user) : { 
    completedSteps: 0, 
    totalSteps: 3, 
    percentage: 0, 
    hasPhotos: false, 
    hasProfile: false, 
    hasQuestionnaire: false 
  };

  const onboardingSteps = [
    {
      title: t('onboarding.addProfilePhotos'),
      description: t('onboarding.addProfilePhotosDesc'),
      icon: "eva:camera-fill",
      route: "/onboarding/photos",
      completed: progress.hasPhotos
    },
    {
      title: t('onboarding.tellUsAboutYourself'),
      description: t('onboarding.tellUsAboutYourselfDesc'),
      icon: "eva:edit-fill",
      route: "/onboarding/profile",
      completed: progress.hasInterests
    },
    {
      title: t('onboarding.answerQuestions'),
      description: t('onboarding.answerQuestionsDesc'),
      icon: "eva:question-mark-circle-fill",
      route: "/onboarding/questionnaire",
      completed: progress.hasQuestionnaire
    }
  ];

  const handleStart = () => {
    // Find the first incomplete step or default to photos
    const nextStep = progress.nextStep || onboardingSteps[0].route;
    router.push(nextStep);
  };

  return (
    <div className={layoutCss.singleColumnLayout}>
      {/* Go Back to Landing Page Button */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 10 
      }}>
        <Button
          type="text"
          onClick={handleGoBackToLandingPage}
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
            transition: 'all 0.2s ease',
            '@media (max-width: 768px)': {
              fontSize: '12px',
              padding: '6px 8px'
            }
          }}
        >
          <span style={{ 
            display: isMobile ? 'none' : 'inline' 
          }}>
            {t('onboarding.goBackToLandingPage')}
          </span>
        </Button>
      </div>

      {/* Language Selector */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 10 
      }}>
        <LanguageSelector size="small" showIcon={false} showText={false} />
      </div>

      {/* Header Section */}
      <div className={layoutCss.headerSection}>
        <div className={css.authHeader}>
          <Title level={2} className={css.authTitle} style={{ margin: "0 0 0.5rem" }}>
            {t('onboarding.welcome')}
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            {t('onboarding.subtitle')}
          </Text>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
            {t('onboarding.progress', { completed: progress.completedSteps, total: progress.totalSteps })}
          </Text>
          <Progress 
            percent={progress.percentage} 
            strokeColor={{
              '0%': 'var(--primary)',
              '100%': 'var(--primary)',
            }}
            trailColor="#f0f0f0"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className={layoutCss.contentSection}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {onboardingSteps.map((step, index) => (
            <Card 
              key={index}
              style={{ 
                border: step.completed ? "1.5px solid #52c41a" : "1.5px solid #e8e8e8",
                borderRadius: "12px",
                background: step.completed ? "#f6ffed" : "#fff",
                cursor: "default"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: step.completed ? "#52c41a" : "var(--primary-low)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Iconify 
                    icon={step.completed ? "eva:checkmark-fill" : step.icon} 
                    width="24px" 
                    style={{ color: step.completed ? "#fff" : "var(--primary)" }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Title level={5} style={{ margin: 0, marginBottom: "4px" }}>
                      {step.title}
                    </Title>
                    {step.completed && (
                      <Text style={{ color: "#52c41a", fontSize: "12px", fontWeight: "600" }}>
                        {t('onboarding.completed')}
                      </Text>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {step.description}
                  </Text>
                </div>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  borderRadius: "50%", 
                  background: step.completed ? "#52c41a" : "#f0f0f0",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                  <Text style={{ 
                    color: step.completed ? "#fff" : "#999", 
                    fontSize: "14px", 
                    fontWeight: "600" 
                  }}>
                    {index + 1}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className={layoutCss.footerSection}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Button
            type="primary"
            size="large"
            onClick={handleStart}
            className={css.authButton}
            style={{ 
              width: "100%",
              maxWidth: "300px",
              height: "48px",
              borderRadius: "12px",
              fontWeight: "500"
            }}
          >
            {progress.completedSteps === 0 ? t('onboarding.startSetup') : 
             progress.completedSteps === progress.totalSteps ? t('onboarding.reviewProfile') : 
             t('onboarding.continueSetup')}
          </Button>
          
          <Button
            type="text"
            size="middle"
            onClick={handleGoBackToLogin}
            style={{ 
              color: '#666',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {t('onboarding.goBackToLogin')}
          </Button>
        </div>
      </div>
    </div>
  );
} 