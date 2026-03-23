import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { usePulses } from '../hooks/usePulses';
import { useNotifications } from '../hooks/useNotifications';
import { useCountdown } from '../hooks/useCountdown';
import { computeStreak } from '../lib/streak';
import type { Pulse, Contact, UserProfile } from '../types';

interface CountdownInfo {
  label: string;
  timeString: string;
  isUrgent: boolean;
  isOpenWindow: boolean;
}

interface AppContextType {
  // Auth
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Data
  contacts: Contact[];
  pulses: Pulse[];
  streak: number;
  addContact: (name: string, relation: string, email: string) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  isPulsing: boolean;
  pulseSuccess: boolean;
  sendPulse: () => Promise<void>;

  // UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  errorMsg: string | null;
  successMsg: string | null;
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;

  // Notifications
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;

  // Countdown
  countdown: CountdownInfo;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4500);
  }, []);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  const auth = useAuth(showError);
  const { contacts, addContact, removeContact } = useContacts(auth.user?.id, showError);
  const { pulses, isPulsing, pulseSuccess, sendPulse } = usePulses(auth.user?.id, showError, showSuccess);
  const { permission: notificationPermission, requestPermission: requestNotificationPermission } =
    useNotifications(pulses);
  const countdown = useCountdown();

  const streak = useMemo(() => computeStreak(pulses), [pulses]);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('pulse-theme') === 'dark'
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('pulse-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const value: AppContextType = {
    ...auth,
    contacts,
    pulses,
    streak,
    addContact,
    removeContact,
    isPulsing,
    pulseSuccess,
    sendPulse,
    activeTab,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
    errorMsg,
    successMsg,
    showError,
    showSuccess,
    notificationPermission,
    requestNotificationPermission,
    countdown,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
