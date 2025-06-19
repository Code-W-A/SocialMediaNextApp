"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import useOnlineStatus from "@/hooks/useOnlineStatus";

const OnlineStatusManager = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Initialize online status tracking for current user
  useOnlineStatus(currentUser?.uid);
  
  return children;
};

export default OnlineStatusManager; 