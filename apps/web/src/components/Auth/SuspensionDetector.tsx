// Suspension Detector Component
import React from 'react';
import { useSuspensionDetector } from '@/hooks/useSuspensionDetector';

interface SuspensionDetectorProps {
  children: React.ReactNode;
  // Minutes of inactivity before checking session validity with Supabase
  inactivityCheckThresholdMinutes?: number;
  // How often to check for inactivity (in minutes)
  checkIntervalMinutes?: number;
}

/**
 * SuspensionDetector Component
 *
 * Wraps the application to detect system suspension and handle session validation.
 * This component implements Phase 3 of the robust authentication system:
 *
 * Features:
 * - Detects when the system/browser tab has been suspended
 * - Monitors user inactivity for extended periods
 * - Validates session when page becomes visible again
 * - Automatically logs out users if session expired during suspension
 * - Handles PWA background/foreground transitions
 *
 * Usage:
 * Wrap your authenticated app content with this component to enable
 * automatic suspension detection and session validation.
 */
export function SuspensionDetector({
  children,
  inactivityCheckThresholdMinutes = 30,
  checkIntervalMinutes = 1,
}: SuspensionDetectorProps) {
  // Initialize suspension detection
  useSuspensionDetector({
    inactivityCheckThresholdMinutes,
    checkIntervalMinutes,
  });

  // This component is purely functional - it doesn't render any UI
  // It just sets up the suspension detection logic and renders children
  return <>{children}</>;
}

// Export hook for direct usage if needed
export { useSuspensionDetector } from '@/hooks/useSuspensionDetector';

// Development helper component for monitoring suspension state
export function SuspensionDebugInfo() {
  const { isActive, lastActiveTime, getInactiveTimeMinutes } =
    useSuspensionDetector();

  if (process.env.VITE_ENABLE_DEBUG_LOGGING === 'true') {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50'>
      <div>Page: {isActive ? 'Active' : 'Hidden'}</div>
      <div>Last Active: {new Date(lastActiveTime).toLocaleTimeString()}</div>
      <div>Inactive: {getInactiveTimeMinutes().toFixed(1)}m</div>
    </div>
  );
}
