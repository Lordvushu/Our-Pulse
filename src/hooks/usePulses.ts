import { useState, useEffect, useCallback } from 'react';
import { supabase, mapPulse } from '../lib/supabase';
import { reverseGeocode } from '../lib/geocode';
import type { Pulse, PulseType } from '../types';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getCurrentWindow = (): PulseType | 'closed' => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 20) return 'evening';
  return 'closed';
};

const getPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error('Geolocation not supported'), { code: -1 }));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 60000,
    });
  });

export function usePulses(
  userId: string | undefined,
  showError: (msg: string) => void,
  showSuccess: (msg: string) => void,
) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [pulsesLoading, setPulsesLoading] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseSuccess, setPulseSuccess] = useState(false);

  const fetchPulses = useCallback(async (uid: string) => {
    setPulsesLoading(true);
    // Load 60 days for streak calculation
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceStr = since.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pulses')
      .select('*')
      .eq('user_id', uid)
      .gte('date_string', sinceStr)
      .order('sent_at', { ascending: false });

    if (!error && data) setPulses(data.map(mapPulse));
    setPulsesLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) { setPulses([]); return; }
    fetchPulses(userId);
  }, [userId, fetchPulses]);

  const sendPulse = useCallback(async () => {
    if (!userId) return;

    const window = getCurrentWindow();
    if (window === 'closed') {
      showError('No pulse window is open right now.');
      return;
    }

    const today = getTodayString();
    const alreadySent = pulses.some(p => p.dateString === today && p.type === window);
    if (alreadySent) {
      showError(`You've already sent your ${window} pulse today.`);
      return;
    }

    setIsPulsing(true);

    try {
      const position = await getPosition();
      const { latitude: lat, longitude: lng } = position.coords;

      // Geocode in parallel with DB insert prep (non-blocking)
      const cityPromise = reverseGeocode(lat, lng);

      const city = await cityPromise;

      const { data, error } = await supabase
        .from('pulses')
        .insert({ user_id: userId, type: window, lat, lng, city, date_string: today })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          showError(`You've already sent your ${window} pulse today.`);
        } else {
          showError('Failed to send pulse. Please try again.');
        }
        return;
      }

      const newPulse = mapPulse(data);
      setPulses(prev => [newPulse, ...prev]);
      setPulseSuccess(true);
      showSuccess('Pulse sent! Your circle has been notified. 💙');
      setTimeout(() => setPulseSuccess(false), 3000);

      // Fire-and-forget email notifications
      supabase.functions.invoke('send-pulse-email', {
        body: { pulseId: data.id },
      }).catch(console.error);

    } catch (err: unknown) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr.code === 1) {
        showError('Please enable location access to send a pulse.');
      } else if (geoErr.code === 3) {
        showError('Location request timed out. Please try again.');
      } else if ((err as Error).message === 'Geolocation not supported') {
        showError('Your browser does not support location access.');
      } else {
        showError('Something went wrong. Please try again.');
      }
    } finally {
      setIsPulsing(false);
    }
  }, [userId, pulses, showError, showSuccess]);

  return { pulses, pulsesLoading, isPulsing, pulseSuccess, sendPulse };
}

export { getCurrentWindow, getTodayString };
