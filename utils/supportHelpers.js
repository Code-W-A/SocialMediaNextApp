// Support helper utilities
// This allows any component to trigger the support chat

let supportOpener = null;

export const setSupportOpener = (opener) => {
  console.log('🔧 [SupportHelpers] Setting support opener function');
  supportOpener = opener;
};

export const openSupport = () => {
  console.log('📞 [SupportHelpers] Attempting to open support chat');
  if (supportOpener) {
    console.log('✅ [SupportHelpers] Support opener found, calling it');
    supportOpener();
  } else {
    console.error('❌ [SupportHelpers] No support opener available - AdminChatSupport might not be mounted');
    // Fallback - try window global
    if (typeof window !== 'undefined' && window.openSupport) {
      console.log('🪟 [SupportHelpers] Using window fallback');
      window.openSupport();
    } else {
      console.error('💥 [SupportHelpers] No support mechanism available');
    }
  }
};

export const getSupportUnreadCount = () => {
  // This would need to be implemented if we want to show unread count in dropdowns
  // For now, return 0 as placeholder
  return 0;
}; 