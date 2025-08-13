// Centralized feature flags for safe, gradual rollout
// Default all to false for live safety; enable via env or code when ready

export const FEATURE_FLAGS = {
  // If true, read receipts are shown only to premium users
  PREMIUM_READ_RECEIPTS_ONLY: false,

  // If true, show Super Like UI (premium-gated)
  PREMIUM_SUPER_LIKES: false,

  // If true, show Boost UI (premium-gated)
  PREMIUM_BOOST: false,

  // If true, show advanced filters in Matches (premium-gated)
  PREMIUM_ADVANCED_FILTERS: false,

  // If true, show contextual upsell for "Who liked you" in Matches (non-premium only)
  PREMIUM_WHO_LIKED_YOU_UPSELL: false,

  // If true, show small inline upsell hints in UI (non-intrusive)
  PREMIUM_INLINE_UPSELLS: false,
};

// Optional: derive flags from env vars if provided
export const loadFlagsFromEnv = () => {
  try {
    FEATURE_FLAGS.PREMIUM_READ_RECEIPTS_ONLY =
      process.env.NEXT_PUBLIC_FLAG_PREMIUM_READ_RECEIPTS_ONLY === 'true' || FEATURE_FLAGS.PREMIUM_READ_RECEIPTS_ONLY;
    FEATURE_FLAGS.PREMIUM_SUPER_LIKES =
      process.env.NEXT_PUBLIC_FLAG_PREMIUM_SUPER_LIKES === 'true' || FEATURE_FLAGS.PREMIUM_SUPER_LIKES;
    FEATURE_FLAGS.PREMIUM_BOOST =
      process.env.NEXT_PUBLIC_FLAG_PREMIUM_BOOST === 'true' || FEATURE_FLAGS.PREMIUM_BOOST;
    FEATURE_FLAGS.PREMIUM_ADVANCED_FILTERS =
      process.env.NEXT_PUBLIC_FLAG_PREMIUM_ADVANCED_FILTERS === 'true' || FEATURE_FLAGS.PREMIUM_ADVANCED_FILTERS;
    FEATURE_FLAGS.PREMIUM_WHO_LIKED_YOU_UPSELL =
      process.env.NEXT_PUBLIC_FLAG_PREMIUM_WHO_LIKED_YOU_UPSELL === 'true' || FEATURE_FLAGS.PREMIUM_WHO_LIKED_YOU_UPSELL;
    FEATURE_FLAGS.PREMIUM_INLINE_UPSELLS =
      process.env.NEXT_PUBLIC_FLAG_PREMIUM_INLINE_UPSELLS === 'true' || FEATURE_FLAGS.PREMIUM_INLINE_UPSELLS;
  } catch (_) {
    // ignore
  }
  return FEATURE_FLAGS;
};


