'use client';

import { useEffect, useRef } from 'react';

export function LoginTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per session
    if (tracked.current) return;

    const trackLogin = async () => {
      try {
        await fetch('/api/auth/track-login', {
          method: 'POST',
        });
        tracked.current = true;
      } catch (error) {
        console.error('Failed to track login:', error);
      }
    };

    trackLogin();
  }, []);

  return null;
}
