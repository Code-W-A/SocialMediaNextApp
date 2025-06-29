"use client";

import { useV1Migration } from '@/hooks/useV1Migration';
import { useUser } from '@/hooks/useFirebaseAuth';
import V1WelcomeDialog from './V1WelcomeDialog';

export default function V1MigrationWrapper({ children }) {
  const { user } = useUser();
  const {
    showWelcomeDialog,
    handleWelcomeShown,
    isMarkingWelcomeShown,
    isV1User,
    isMigrated
  } = useV1Migration();

  return (
    <>
      {children}
      
      {/* V1 Welcome Dialog */}
      <V1WelcomeDialog
        visible={showWelcomeDialog}
        onClose={handleWelcomeShown}
        loading={isMarkingWelcomeShown}
        userName={user?.firstName || user?.name || "prietene"}
      />
    </>
  );
} 