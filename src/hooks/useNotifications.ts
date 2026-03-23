import { useState, useEffect, useCallback } from 'react';
import type { Pulse } from '../types';
import { getCurrentWindow, getTodayString } from './usePulses';

export function useNotifications(pulses: Pulse[]) {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // Schedule in-app reminder notifications while tab is open
  useEffect(() => {
    if (permission !== 'granted') return;

    const check = () => {
      const window = getCurrentWindow();
      if (window === 'closed') return;

      const today = getTodayString();
      const hasSent = pulses.some(p => p.dateString === today && p.type === window);
      if (hasSent) return;

      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      const isWarningTime =
        // 30 min before morning window closes (10:30 AM)
        (h === 10 && m === 30) ||
        // 10 min before morning window closes (10:50 AM)
        (h === 10 && m === 50) ||
        // 30 min before evening window closes (11:30 PM)
        (h === 23 && m === 30) ||
        // 10 min before evening window closes (11:50 PM)
        (h === 23 && m === 50);

      if (!isWarningTime) return;

      const label = window === 'morning' ? 'Morning' : 'Evening';
      const minutesLeft = window === 'morning'
        ? (11 * 60) - (h * 60 + m)
        : (24 * 60) - (h * 60 + m);

      new Notification('Our Pulse', {
        body: `${label} window closes in ${minutesLeft} minutes — don't forget to check in.`,
        icon: '/icons/icon.svg',
        tag: `pulse-reminder-${window}`,
      });
    };

    // Check every minute
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [permission, pulses]);

  // Warn before leaving if window is open and pulse not sent
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const window = getCurrentWindow();
      if (window === 'closed') return;
      const today = getTodayString();
      const hasSent = pulses.some(p => p.dateString === today && p.type === window);
      if (!hasSent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    globalThis.addEventListener('beforeunload', handleBeforeUnload);
    return () => globalThis.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pulses]);

  return { permission, requestPermission };
}
