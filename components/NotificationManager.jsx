"use client";
import React from 'react';
import { useUser } from "@/hooks/useFirebaseAuth";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPopup from "./NotificationPopup";

const NotificationManager = () => {
  const { user } = useUser();
  const { unreadMessagesCount, newCompatibilitiesCount, markCompatibilitiesAsSeen } = useNotifications(user);

  return (
    <NotificationPopup
      user={user}
      unreadMessagesCount={unreadMessagesCount}
      newCompatibilitiesCount={newCompatibilitiesCount}
      onMarkCompatibilitiesAsSeen={markCompatibilitiesAsSeen}
    />
  );
};

export default NotificationManager; 