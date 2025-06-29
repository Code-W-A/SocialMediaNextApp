"use client";

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import Iconify from '@/components/Iconify';

const PremiumBadge = ({ 
  user, 
  size = 'default', 
  showText = true, 
  style = {},
  showTooltip = true
}) => {
  // Check if user has premium subscription
  const isPremium = user?.subscription?.isPremium || 
                   user?.subscription?.status === 'active' || 
                   user?.subscription?.status === 'trialing' ||
                   user?.subscriptionActive !== undefined; // Check for subscriptionActive property

  if (!isPremium) {
    return null;
  }

  const badgeStyle = {
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#000',
    border: '1px solid #FFD700',
    borderRadius: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
    ...style
  };

  const iconSize = size === 'small' ? '12px' : size === 'large' ? '16px' : '14px';
  const fontSize = size === 'small' ? '11px' : size === 'large' ? '14px' : '12px';
  const padding = size === 'small' ? '2px 6px' : size === 'large' ? '6px 12px' : '4px 8px';

  const badge = (
    <Tag style={{ ...badgeStyle, fontSize, padding }}>
      <CrownOutlined style={{ fontSize: iconSize }} />
      {showText && 'Premium'}
    </Tag>
  );

  if (showTooltip) {
    return (
      <Tooltip title="Cont Premium - Prioritate în compatibilități">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default PremiumBadge; 