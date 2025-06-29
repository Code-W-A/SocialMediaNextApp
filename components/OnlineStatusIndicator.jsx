"use client";
import React, { useState, useEffect } from "react";
import { subscribeToUserOnlineStatus, getTimeSinceLastSeen } from "@/actions/chat";

const OnlineStatusIndicator = ({ 
  userId, 
  showText = true, 
  size = "small",
  position = "bottom-right" 
}) => {
  const [onlineStatus, setOnlineStatus] = useState({
    isOnline: false,
    lastSeen: null,
    lastActivity: null
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserOnlineStatus(userId, (status) => {
      setOnlineStatus(status);
    });

    return unsubscribe;
  }, [userId]);

  const getDotSize = () => {
    switch (size) {
      case "small": return "8px";
      case "medium": return "12px";
      case "large": return "16px";
      default: return "8px";
    }
  };

  const getPosition = () => {
    switch (position) {
      case "top-right": return { top: "2px", right: "2px" };
      case "bottom-right": return { bottom: "2px", right: "2px" };
      case "bottom-left": return { bottom: "2px", left: "2px" };
      case "top-left": return { top: "2px", left: "2px" };
      default: return { bottom: "2px", right: "2px" };
    }
  };

  const getStatusColor = () => {
    switch (onlineStatus.status) {
      case 'online': return "#52c41a";  // Green
      case 'away': return "#faad14";    // Yellow
      case 'offline': 
      default: return "#d9d9d9";        // Gray
    }
  };

  const getStatusText = () => {
    if (onlineStatus.isOnline && onlineStatus.status === 'online') {
      return "Active now";
    }
    
    if (onlineStatus.status === 'away') {
      return "Away";
    }
    
    if (onlineStatus.lastSeen) {
      return `Last seen ${getTimeSinceLastSeen(onlineStatus.lastSeen)}`;
    }
    
    return "Offline";
  };

  if (!userId) return null;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px',
      fontSize: '12px',
      color: '#666'
    }}>
      {/* Status Dot */}
      <div
        style={{
          width: getDotSize(),
          height: getDotSize(),
          borderRadius: "50%",
          backgroundColor: getStatusColor(),
          border: "2px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
          flexShrink: 0,
          position: "relative"
        }}
      >
        {/* Pulse animation for online status */}
        {onlineStatus.status === 'online' && (
          <div
            style={{
              position: "absolute",
              top: "-2px",
              left: "-2px",
              right: "-2px",
              bottom: "-2px",
              borderRadius: "50%",
              backgroundColor: "#52c41a",
              opacity: 0.3,
              animation: "pulse 2s infinite"
            }}
          />
        )}
      </div>

      {/* Status Text */}
      {showText && (
        <span style={{ 
          fontSize: '12px',
          color: onlineStatus.status === 'online' ? '#52c41a' : 
                 onlineStatus.status === 'away' ? '#faad14' : '#999',
          fontWeight: onlineStatus.status === 'online' ? '500' : '400'
        }}>
          {getStatusText()}
        </span>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

// Avatar wrapper component with online status
export const OnlineStatusAvatar = ({ 
  children, 
  userId, 
  size = "small",
  position = "bottom-right" 
}) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {children}
      <div
        style={{
          position: "absolute",
          ...getPosition(position),
          zIndex: 10
        }}
      >
        <OnlineStatusIndicator 
          userId={userId} 
          showText={false} 
          size={size}
        />
      </div>
    </div>
  );
};

// Helper function for positioning
const getPosition = (position) => {
  switch (position) {
    case "top-right": return { top: "2px", right: "2px" };
    case "bottom-right": return { bottom: "2px", right: "2px" };
    case "bottom-left": return { bottom: "2px", left: "2px" };
    case "top-left": return { top: "2px", left: "2px" };
    default: return { bottom: "2px", right: "2px" };
  }
};

export default OnlineStatusIndicator; 