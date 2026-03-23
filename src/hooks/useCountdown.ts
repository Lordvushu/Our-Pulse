import { useState, useEffect } from 'react';

interface CountdownInfo {
  label: string;
  timeString: string;
  isUrgent: boolean; // < 15 min remaining in an open window
  isOpenWindow: boolean; // currently inside a pulse window
}

function compute(): CountdownInfo {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const total = h * 3600 + m * 60 + s;

  const MORNING_START = 5 * 3600;
  const MORNING_END = 11 * 3600;
  const EVENING_START = 20 * 3600;
  const MIDNIGHT = 24 * 3600;

  let label: string;
  let remaining: number;
  let isOpenWindow: boolean;

  if (total >= MORNING_START && total < MORNING_END) {
    label = 'Morning window closes in';
    remaining = MORNING_END - total;
    isOpenWindow = true;
  } else if (total >= EVENING_START) {
    label = 'Evening window closes in';
    remaining = MIDNIGHT - total;
    isOpenWindow = true;
  } else if (total < MORNING_START) {
    label = 'Morning window opens in';
    remaining = MORNING_START - total;
    isOpenWindow = false;
  } else {
    // Between MORNING_END and EVENING_START
    label = 'Evening window opens in';
    remaining = EVENING_START - total;
    isOpenWindow = false;
  }

  const isUrgent = isOpenWindow && remaining < 15 * 60;

  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const timeString = hrs > 0
    ? `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { label, timeString, isUrgent, isOpenWindow };
}

export function useCountdown(): CountdownInfo {
  const [info, setInfo] = useState<CountdownInfo>(compute);

  useEffect(() => {
    const interval = setInterval(() => setInfo(compute()), 1000);
    return () => clearInterval(interval);
  }, []);

  return info;
}
