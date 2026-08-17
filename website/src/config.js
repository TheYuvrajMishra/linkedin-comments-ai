// Global Application Configuration & Feature Flags
// Set VITE_WAITLIST_MODE="true" (or omit) for Waitlist Mode
// Set VITE_WAITLIST_MODE="false" for Live Mode (Subscriptions & Extension Active)

export const WAITLIST_MODE = (import.meta.env.VITE_WAITLIST_MODE ?? 'true') !== 'false';
export const WAITLIST_TARGET = 100;
