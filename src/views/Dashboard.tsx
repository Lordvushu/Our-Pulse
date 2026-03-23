import { useMemo } from 'react';
import { Heart, MapPin, CheckCircle2, Plus, Sunrise, Sunset } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CountdownBanner } from '../components/CountdownBanner';

const MORNING_START = 5;
const MORNING_END = 11;
const EVENING_START = 20;

const getCurrentWindow = () => {
  const h = new Date().getHours();
  if (h >= 12) return 'evening';
  return 'morning';
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const formatLastPulse = (pulse: { timestamp: number; dateString: string; location: { city?: string } }) => {
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const time = new Date(pulse.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const city = pulse.location.city || 'Unknown';
  if (pulse.dateString === today) return `${city} · Today, ${time}`;
  if (pulse.dateString === yesterdayStr) return `${city} · Yesterday, ${time}`;
  return `${city} · ${new Date(pulse.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
};

export function Dashboard() {
  const { pulses, contacts, streak, isPulsing, pulseSuccess, sendPulse, setActiveTab } = useApp();

  const today = getTodayString();
  const currentWindow = getCurrentWindow();

  const todayPulses = useMemo(() => pulses.filter(p => p.dateString === today), [pulses, today]);
  const hasSentMorning = todayPulses.some(p => p.type === 'morning');
  const hasSentEvening = todayPulses.some(p => p.type === 'evening');

  const canSend = true; // testing: always allow sending

  const windowLabel =
    currentWindow === 'morning' ? 'Morning Window'
    : currentWindow === 'evening' ? 'Evening Window'
    : 'Window Closed';

  const windowTime =
    currentWindow === 'morning' ? '5 AM – 11 AM'
    : currentWindow === 'evening' ? '8 PM – 11:59 PM'
    : 'Opens at 5 AM or 8 PM';

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
      className="space-y-8"
    >
      {/* Intro */}
      <p className="text-center text-[13px] text-pulse-label dark:text-sky-200 leading-relaxed px-2 animate-fade-up">
        Check in twice a day — morning and evening. Your circle gets an email with your location.
        Miss both and they know to reach out.
      </p>

      {/* Today's status cards */}
      <div className="glass-card p-4 space-y-3 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <p className="text-[10px] uppercase tracking-widest font-bold text-pulse-label dark:text-sky-300">
          Today's Check-ins
        </p>
        <div className="flex gap-3">
          {[
            { icon: Sunrise, label: 'Morning', time: '5–11 AM', sent: hasSentMorning, active: currentWindow === 'morning' },
            { icon: Sunset,  label: 'Evening', time: '8–12 PM', sent: hasSentEvening, active: currentWindow === 'evening' },
          ].map(({ icon: Icon, label, time, sent, active }) => (
            <div
              key={label}
              className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                sent
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/60'
                  : active
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-600/50'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'
              }`}
            >
              <Icon size={16} className={
                sent ? 'text-emerald-500' : active ? 'text-pulse-cyan' : 'text-slate-400 dark:text-slate-500'
              } />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${
                  sent ? 'text-emerald-700 dark:text-emerald-400'
                  : active ? 'text-pulse-cyan'
                  : 'text-slate-500 dark:text-slate-400'
                }`}>{label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{time}</p>
              </div>
              {sent && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Countdown */}
      <div className="animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <CountdownBanner />
      </div>

      {/* Pulse button */}
      <div className="flex flex-col items-center gap-5 animate-fade-up" style={{ animationDelay: '0.12s' }}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-pulse-label dark:text-sky-300">{windowLabel}</p>
          <p className="text-[12px] text-pulse-blue/70 dark:text-sky-300/80">{windowTime}</p>
        </div>

        <button
          onClick={sendPulse}
          disabled={isPulsing || !canSend}
          className={`pulse-button ${
            pulseSuccess
              ? '!bg-emerald-500 !shadow-emerald-500/40'
              : canSend
              ? 'animate-float'
              : ''
          }`}
        >
          {pulseSuccess ? (
            <>
              <CheckCircle2 size={30} />
              <span className="text-[12px] uppercase tracking-wider font-semibold">Sent!</span>
            </>
          ) : (
            <>
              <Heart size={28} strokeWidth={1.5} />
              <span className="text-[12px] uppercase tracking-wider font-semibold">
                {isPulsing ? 'Sending…' : 'Send Pulse'}
              </span>
            </>
          )}
        </button>

        {pulses.length > 0 && (
          <div className="text-center">
            <span className="block text-[10px] uppercase tracking-wider text-pulse-blue/60 dark:text-sky-300/70 mb-1 font-semibold">
              Last Pulse
            </span>
            <p className="text-[13px] text-pulse-label dark:text-sky-200 font-medium flex items-center gap-1.5 justify-center">
              <MapPin size={12} className="text-pulse-cyan shrink-0" />
              {formatLastPulse(pulses[0])}
            </p>
          </div>
        )}
      </div>

      {/* Circle preview */}
      <section className="space-y-4 animate-fade-up" style={{ animationDelay: '0.18s' }}>
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] uppercase tracking-widest font-bold text-pulse-label dark:text-sky-300">
            Your Circle ({contacts.length})
          </h2>
          <button
            onClick={() => setActiveTab('contacts')}
            className="text-[10px] text-pulse-cyan font-bold uppercase hover:underline"
          >
            Manage
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {contacts.slice(0, 3).map((contact, idx) => (
            <div
              key={contact.id}
              className="flex flex-col items-center gap-2 animate-fade-up"
              style={{ animationDelay: `${0.25 + idx * 0.07}s` }}
            >
              <div className="w-[52px] h-[52px] rounded-full bg-sky-100 dark:bg-sky-900/50 border-2 border-sky-300 dark:border-sky-600/60 flex items-center justify-center text-pulse-label dark:text-sky-200 font-bold text-lg">
                {contact.initial}
              </div>
              <span className="text-xs font-semibold text-pulse-blue dark:text-sky-100">
                {contact.name.split(' ')[0]}
              </span>
            </div>
          ))}
          {contacts.length === 0 && (
            <button
              onClick={() => setActiveTab('contacts')}
              className="col-span-3 py-10 border-2 border-dashed border-sky-300 dark:border-sky-700/50 rounded-xl flex flex-col items-center gap-2 text-pulse-label/70 dark:text-sky-300/60 hover:text-pulse-label dark:hover:text-sky-200 hover:border-sky-400 transition-colors"
            >
              <Plus size={20} />
              <span className="text-[11px] uppercase tracking-widest font-bold">Add to circle</span>
            </button>
          )}
        </div>

        {contacts.length > 0 && (
          <button
            onClick={() => setActiveTab('contacts')}
            className="w-full border-2 border-sky-200 dark:border-sky-700/50 text-pulse-label dark:text-sky-200 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
          >
            + Add to circle
          </button>
        )}
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-sky-200 dark:border-sky-800/60 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <div className="glass-card p-4 text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-pulse-label dark:text-sky-300">
            Current Streak
          </span>
          <p className="font-serif text-[40px] leading-none text-pulse-blue dark:text-sky-50 mt-1">{streak}</p>
          <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70 mt-1 font-medium">days</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-pulse-label dark:text-sky-300">
            Total Pulses
          </span>
          <p className="font-serif text-[40px] leading-none text-pulse-blue dark:text-sky-50 mt-1">{pulses.length}</p>
          <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70 mt-1 font-medium">sent</p>
        </div>
      </div>

      <footer className="pt-5 border-t border-sky-200 dark:border-sky-800/50">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px flex-1 bg-sky-200 dark:bg-sky-800/50" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pulse-blue/50 dark:text-sky-300/50 px-1">
            Onyx Mercer
          </span>
          <div className="h-px flex-1 bg-sky-200 dark:bg-sky-800/50" />
        </div>
        <p className="text-center text-[10px] text-pulse-label/60 dark:text-sky-300/50">
          Our Pulse &nbsp;·&nbsp; © 2026 Onyx Mercer (Pty) Ltd. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
}
