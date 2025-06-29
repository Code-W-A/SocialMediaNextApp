"use client";

import React from 'react';
import { Alert, Button, Progress, Typography, Space } from 'antd';
import { CrownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { getUserLimits, getRemainingDailyActions } from '@/utils/premiumHelpers';

const { Text } = Typography;

const PremiumLimitBanner = ({ 
  action, 
  currentUsage = 0, 
  style = {},
  showUpgrade = true,
  compact = false 
}) => {
  const { isPremium } = useSubscription();
  const router = useRouter();

  // Don't show for premium users
  if (isPremium) {
    return null;
  }

  const limits = getUserLimits({ isPremium: false });
  const limit = limits[action?.toUpperCase()];
  const remaining = getRemainingDailyActions(action, currentUsage, { isPremium: false });

  if (limit === Infinity) {
    return null;
  }

  const percentage = (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentUsage >= limit;

  const getActionName = (action) => {
    const actionNames = {
      DAILY_POSTS: 'postări',
      DAILY_FEED_VIEWS: 'vizualizări feed',
      DAILY_MATCHES: 'match-uri',
      ACTIVE_CONVERSATIONS: 'conversații active',
    };
    return actionNames[action?.toUpperCase()] || 'acțiuni';
  };

  const getMessage = () => {
    if (isAtLimit) {
      return `Ai atins limita zilnică de ${limit} ${getActionName(action)}. Upgrade la Premium pentru acces nelimitat!`;
    }
    if (isNearLimit) {
      return `Aproape de limită! Îți mai rămân ${remaining} ${getActionName(action)} astăzi.`;
    }
    return `${remaining} din ${limit} ${getActionName(action)} rămase astăzi.`;
  };

  const getAlertType = () => {
    if (isAtLimit) return 'error';
    if (isNearLimit) return 'warning';
    return 'info';
  };

  if (compact) {
    return (
      <div style={{ 
        padding: '8px 12px', 
        background: isAtLimit ? '#fff2f0' : '#f6ffed',
        border: `1px solid ${isAtLimit ? '#ffccc7' : '#b7eb8f'}`,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style 
      }}>
        <div style={{ flex: 1 }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            {currentUsage}/{limit} {getActionName(action)}
          </Text>
          <Progress 
            percent={percentage} 
            size="small" 
            showInfo={false}
            strokeColor={isAtLimit ? '#ff4d4f' : isNearLimit ? '#faad14' : '#52c41a'}
          />
        </div>
        {showUpgrade && (
          <Button 
            size="small" 
            type="primary"
            icon={<CrownOutlined />}
            onClick={() => router.push('/premium')}
            style={{ 
              marginLeft: '8px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              color: '#000'
            }}
          >
            Premium
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert
      type={getAlertType()}
      showIcon
      icon={<InfoCircleOutlined />}
      message={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <Text strong>{getMessage()}</Text>
            <div style={{ marginTop: '8px' }}>
              <Progress 
                percent={percentage} 
                size="small"
                strokeColor={isAtLimit ? '#ff4d4f' : isNearLimit ? '#faad14' : '#52c41a'}
                format={() => `${currentUsage}/${limit}`}
              />
            </div>
          </div>
          {showUpgrade && (
            <Button 
              type="primary"
              icon={<CrownOutlined />}
              onClick={() => router.push('/premium')}
              style={{ 
                marginLeft: '16px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                color: '#000',
                fontWeight: '600'
              }}
            >
              Upgrade la Premium
            </Button>
          )}
        </div>
      }
      style={style}
    />
  );
};

export default PremiumLimitBanner; 