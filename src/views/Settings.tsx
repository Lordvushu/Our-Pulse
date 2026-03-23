import { useState } from 'react';
import { User as UserIcon, ChevronRight, LogOut, Moon, Sun, Bell, BellOff, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const {
    profile, signOut, isDarkMode, toggleDarkMode,
    notificationPermission, requestNotificationPermission,
    updateProfile,
  } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);

  const saveName = async () => {
    if (!nameInput.trim() || nameInput === profile?.name) { setEditingName(false); return; }
    setSaving(true);
    await updateProfile({ name: nameInput.trim() });
    setSaving(false);
    setEditingName(false);
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      <h2 className="font-serif text-2xl text-pulse-blue dark:text-sky-50">Settings</h2>

      {/* Profile */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-pulse-blue/5 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end flex items-center justify-center text-white text-lg font-bold shrink-0">
            {profile?.name?.charAt(0).toUpperCase() ?? <UserIcon size={22} />}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                />
                <button onClick={saveName} disabled={saving} className="p-1.5 bg-emerald-500 rounded-full text-white">
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <h3 className="text-sm font-bold text-pulse-blue dark:text-sky-100 truncate">{profile?.name}</h3>
            )}
            <p className="text-xs text-pulse-label/70 dark:text-sky-300/80 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { setNameInput(profile?.name ?? ''); setEditingName(true); }}
          className="w-full p-4 text-left text-xs font-bold text-pulse-blue dark:text-sky-100/70 hover:bg-pulse-blue/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
        >
          Edit Name
          <ChevronRight size={14} className="text-pulse-blue/50 dark:text-sky-300/50" />
        </button>
      </div>

      {/* Appearance */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDarkMode ? <Moon size={16} className="text-sky-400" /> : <Sun size={16} className="text-amber-500" />}
          <div>
            <p className="text-xs font-bold text-pulse-blue dark:text-sky-100/80">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70">Change appearance</p>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`w-11 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-sky-500' : 'bg-slate-300'}`}
          role="switch"
          aria-checked={isDarkMode}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Notifications */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notificationPermission === 'granted'
            ? <Bell size={16} className="text-pulse-cyan" />
            : <BellOff size={16} className="text-pulse-label dark:text-sky-300" />
          }
          <div>
            <p className="text-xs font-bold text-pulse-blue dark:text-sky-100/80">Reminders</p>
            <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70">
              {notificationPermission === 'granted'
                ? 'Enabled — you\'ll be reminded before windows close'
                : notificationPermission === 'denied'
                ? 'Blocked in browser settings'
                : 'Tap to enable reminders'}
            </p>
          </div>
        </div>
        {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
          <button
            onClick={requestNotificationPermission}
            className="text-[10px] font-bold uppercase tracking-wider text-pulse-cyan hover:underline"
          >
            Enable
          </button>
        )}
        {notificationPermission === 'granted' && (
          <Check size={16} className="text-emerald-500 shrink-0" />
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full glass-card p-4 text-red-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>

      <div className="glass-card p-4 text-center space-y-1">
        <p className="text-[11px] font-bold text-pulse-blue/70 dark:text-sky-200">Our Pulse</p>
        <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70">
          Version 1.0.0 &nbsp;·&nbsp; An <span className="font-semibold">Onyx Mercer</span> product
        </p>
        <p className="text-[9px] text-pulse-label/60 dark:text-sky-300/60">© 2026 Onyx Mercer (Pty) Ltd.</p>
      </div>
    </motion.div>
  );
}
