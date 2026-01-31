'use client';

import { useCallback, useRef } from 'react';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.7;
    }

    // Reset and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      // Autoplay may be blocked by browser policy
      console.warn('Could not play notification sound:', err);
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return { play, setVolume };
}
