import React from 'react';
import { Badge } from 'antd';
import Iconify from './Iconify';

const NotificationBadge = ({ 
  icon, 
  width = "24px", 
  color, 
  count = 0, 
  showZero = false,
  maxCount = 99,
  size = "default",
  style = {}
}) => {
  const badgeSize = size === "small" ? "small" : "default";
  
  return (
    <Badge 
      count={count} 
      showZero={showZero}
      overflowCount={maxCount}
      size={badgeSize}
      style={{
        zIndex: 1,
        ...style
      }}
    >
      <Iconify 
        icon={icon} 
        width={width} 
        style={{ color }}
      />
    </Badge>
  );
};

export default NotificationBadge; 