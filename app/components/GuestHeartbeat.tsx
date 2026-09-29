'use client';

import { useEffect } from 'react';
import { useMembership } from '@/app/context/MembershipContext';

export default function GuestHeartbeat() {
  const { auth } = useMembership();

  useEffect(() => {
    // If user is signed in, do not count as guest
    if (auth.isAuthenticated) return;

    let sessionId: string | null = null;
    try {
      sessionId = sessionStorage.getItem('mpcs_guest_sid');
      if (!sessionId) {
        sessionId = 'gst_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        sessionStorage.setItem('mpcs_guest_sid', sessionId);
      }
    } catch {
      sessionId = 'gst_' + Math.random().toString(36).substring(2, 11);
    }

    const sendPing = () => {
      // Don't ping if page is hidden to save resources
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      fetch('/api/stats/active-guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(() => {});
    };

    // Immediate ping
    sendPing();

    // Pulse every 45 seconds
    const interval = setInterval(sendPing, 45000);

    // Also ping when page visibility changes to visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendPing();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth.isAuthenticated]);

  return null;
}
