"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import useOnlineStatus from "@/hooks/useOnlineStatus";

const OnlineStatusManager = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize online status tracking for current user
  useOnlineStatus(user?.id);
  
  return children;
};

export default OnlineStatusManager; 