"use client";
import React from "react";
import { Button, Typography, Progress, Card } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import { getOnboardingProgress } from "@/utils/onboardingHelpers";
import Iconify from "@/components/Iconify";
import css from "@/styles/AuthPages.module.css";
import layoutCss from "@/styles/onboardingLayout.module.css";

const { Title, Text } = Typography;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

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
      title: "Add Profile Photos",
      description: "Upload your best photos to make a great first impression",
      icon: "eva:camera-fill",
      route: "/onboarding/photos",
      completed: progress.hasPhotos
    },
    {
      title: "Tell Us About Yourself",
      description: "Add a bio, location and interests",
      icon: "eva:edit-fill",
      route: "/onboarding/profile",
      completed: progress.hasProfile
    },
    {
      title: "Answer Questions",
      description: "Help us understand your preferences better",
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
      {/* Header Section */}
      <div className={layoutCss.headerSection}>
        <div className={css.authHeader}>
          <Title level={2} className={css.authTitle} style={{ margin: "0 0 0.5rem" }}>
            Welcome to YDestiny! 🎉
          </Title>
          <Text type="secondary" className={css.authSubtitle}>
            Complete these 3 steps to set up your profile and start connecting with amazing people
          </Text>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Text strong style={{ fontSize: "14px", color: "#666", marginBottom: "8px", display: "block" }}>
            Progress: {progress.completedSteps} of {progress.totalSteps} steps completed
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
              hoverable
              onClick={() => router.push(step.route)}
              style={{ 
                border: step.completed ? "1.5px solid #52c41a" : "1.5px solid #e8e8e8",
                borderRadius: "12px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                background: step.completed ? "#f6ffed" : "#fff"
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
                        ✓ Completed
                      </Text>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {step.description}
                  </Text>
                </div>
                <Iconify 
                  icon={step.completed ? "eva:edit-outline" : "eva:arrow-forward-fill"} 
                  width="20px" 
                  style={{ color: step.completed ? "#52c41a" : "#999" }} 
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className={layoutCss.footerSection}>
        <div style={{ display: "flex", justifyContent: "center" }}>
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
            {progress.completedSteps === 0 ? "Start Setup" : 
             progress.completedSteps === progress.totalSteps ? "Review Profile" : 
             "Continue Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
} 