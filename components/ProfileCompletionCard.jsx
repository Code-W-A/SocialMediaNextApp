"use client";
import React from 'react';
import { Card, Row, Col, Space, Typography, Button } from 'antd';
import { useRouter } from 'next/navigation';
import Iconify from './Iconify';

const { Title, Text } = Typography;

const ProfileCompletionCard = ({ 
  profileCompletion, 
  onComplete, 
  showCard = true 
}) => {
  const router = useRouter();

  const handleCompleteProfile = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/onboarding/profile');
    }
  };

  if (!showCard || !profileCompletion || profileCompletion.isComplete) {
    return null;
  }

  return (
    <Card style={{ marginBottom: "1rem", border: "1px solid #faad14" }}>
      <Row gutter={[16, 16]} align="middle">
        <Col flex={1}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Iconify icon="eva:alert-triangle-fill" width="20px" color="#faad14" />
              <Title level={5} style={{ margin: 0, color: "#faad14" }}>
                Profile Incomplete ({profileCompletion.completionPercentage}% complete)
              </Title>
            </div>
            <Text type="secondary">
              Complete your profile to help others discover and connect with you better.
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Missing: {profileCompletion.missingFields.join(', ')}
            </Text>
          </Space>
        </Col>
        <Col>
          <Button type="primary" onClick={handleCompleteProfile}>
            Complete Profile
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default ProfileCompletionCard; 