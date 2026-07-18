/**
 * useLocalClock.ts
 * SSR-safe live clock hook that updates every second.
 */
'use client';
import { useState, useEffect } from 'react';

export function useLocalClock(format: 'time' | 'datetime' = 'time'): string {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (format === 'datetime') {
        setDisplay(now.toLocaleString([], {
          month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }));
      } else {
        setDisplay(now.toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }));
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [format]);

  return display;
}
