"use client";

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import Iconify from '@/components/Iconify';

const PremiumBadge = ({ 
  user, 
  size = 'default', 
  showText = true, 
  style = {} 
}) => {
  // Check if user has premium subscription
  const isPremium = user?.subscription?.isPremium || 
                   user?.subscription?.status === 'active' || 
                   user?.subscription?.status === 'trialing';

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
    ...style
  };

  const iconSize = size === 'small' ? '12px' : size === 'large' ? '16px' : '14px';
  const fontSize = size === 'small' ? '11px' : size === 'large' ? '14px' : '12px';

  return (
    <Tooltip title="Utilizator Premium - Profil verificat">
      <Tag style={{ ...badgeStyle, fontSize }}>
        <CrownOutlined style={{ fontSize: iconSize }} />
        {showText && 'Premium'}
      </Tag>
    </Tooltip>
  );
};

export default PremiumBadge; 