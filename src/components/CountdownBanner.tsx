import { useApp } from '../context/AppContext';

export function CountdownBanner() {
  const { countdown } = useApp();
  const { label, timeString, isUrgent, isOpenWindow } = countdown;

  return (
    <div
      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-center transition-colors ${
        isUrgent
          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50'
          : isOpenWindow
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30'
          : 'bg-pulse-blue/5 dark:bg-white/5 border border-pulse-blue/10 dark:border-white/10'
      }`}
    >
      <span
        className={`text-[11px] uppercase tracking-wider font-bold ${
          isUrgent
            ? 'text-amber-700 dark:text-amber-400'
            : isOpenWindow
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-pulse-label/60 dark:text-sky-100/40'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-sm font-bold tabular-nums ${
          isUrgent
            ? 'text-amber-800 dark:text-amber-300'
            : isOpenWindow
            ? 'text-emerald-800 dark:text-emerald-300'
            : 'text-pulse-blue/70 dark:text-sky-100/60'
        }`}
      >
        {timeString}
      </span>
    </div>
  );
}
