"use client";
import React from "react";
import { Button, Typography, Result } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useFirebaseAuth";
import layoutCss from "@/styles/onboardingLayout.module.css";

const { Title, Text } = Typography;

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoToHome = () => {
    router.push("/home");
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
              Welcome to YDestiny!
            </Title>
          }
          subTitle={
            <div>
              <Text style={{ fontSize: "16px", color: "#666", display: "block", marginBottom: "0.5rem" }}>
                Your profile is now complete and ready to make connections!
              </Text>
              <Text style={{ fontSize: "14px", color: "#999" }}>
                You can always update your profile information later in settings.
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
              Start Exploring
            </Button>
          }
        />
      </div>
    </div>
  );
} 