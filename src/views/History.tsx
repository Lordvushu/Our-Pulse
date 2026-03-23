import { History as HistoryIcon, MapPin, Sunrise, Sunset } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export function History() {
  const { pulses } = useApp();

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-pulse-blue dark:text-sky-50">Pulse History</h2>
        <span className="text-[10px] uppercase tracking-wider font-bold text-pulse-label/45 dark:text-sky-100/35">
          {pulses.length} total
        </span>
      </div>

      <div className="relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-pulse-blue/10 dark:before:bg-sky-800/50">
        {pulses.length === 0 ? (
          <div className="text-center py-16 space-y-3 pl-10">
            <HistoryIcon size={52} className="mx-auto text-pulse-blue/20 dark:text-sky-100/15" />
            <div>
              <p className="text-sm font-medium text-pulse-blue/50 dark:text-sky-100/40">No history yet</p>
              <p className="text-xs text-pulse-label/40 dark:text-sky-100/30 mt-1">Your pulses will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pulses.map(pulse => (
              <div key={pulse.id} className="relative pl-12">
                <div
                  className={`absolute left-3 top-4 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 shadow-sm z-10 ${
                    pulse.type === 'morning' ? 'bg-pulse-cyan' : 'bg-pulse-blue'
                  }`}
                />
                <div className="glass-card p-4 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      {pulse.type === 'morning'
                        ? <Sunrise size={12} className="text-pulse-cyan" />
                        : <Sunset size={12} className="text-pulse-blue/60 dark:text-sky-400" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-pulse-blue/45 dark:text-sky-100/40">
                        {pulse.type} pulse
                      </span>
                    </div>
                    <span className="text-[10px] text-pulse-blue/35 dark:text-sky-100/30">
                      {new Date(pulse.timestamp).toLocaleDateString([], {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-pulse-cyan shrink-0" />
                      <span className="text-xs font-medium text-pulse-blue dark:text-sky-100">
                        {pulse.location.city || 'Unknown location'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-pulse-blue dark:text-sky-200">
                      {new Date(pulse.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
