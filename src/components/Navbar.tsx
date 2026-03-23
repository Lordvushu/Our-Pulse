import { Heart, Users, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

const tabs = [
  { id: 'dashboard', icon: Heart, label: 'Pulse' },
  { id: 'contacts', icon: Users, label: 'Circle' },
  { id: 'history', icon: HistoryIcon, label: 'History' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
];

export function Navbar() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg border-t border-pulse-blue/10 dark:border-white/10 px-2 py-3 flex justify-around items-center z-50 safe-area-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 min-w-[60px] py-1 px-3 rounded-xl transition-colors ${
            activeTab === tab.id
              ? 'text-pulse-cyan'
              : 'text-pulse-blue/50 dark:text-sky-100/40'
          }`}
        >
          <tab.icon
            size={20}
            strokeWidth={activeTab === tab.id ? 2.5 : 1.75}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
