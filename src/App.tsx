import { AnimatePresence } from 'motion/react';
import { Moon, Sun, ArrowLeft, LogOut } from 'lucide-react';
import { useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { OnboardingFlow } from './components/OnboardingFlow';
import { InstallPrompt } from './components/InstallPrompt';
import { Dashboard } from './views/Dashboard';
import { Contacts } from './views/Contacts';
import { History } from './views/History';
import { Settings } from './views/Settings';

export default function App() {
  const { user, profile, authLoading, activeTab, setActiveTab, isDarkMode, toggleDarkMode, signOut } = useApp();

  // Loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end mx-auto animate-pulse" />
          <p className="font-serif text-2xl text-pulse-blue dark:text-sky-100">Our Pulse</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="relative pb-24 pt-10 px-6 max-w-lg mx-auto min-h-screen flex flex-col">
      {/* Onboarding overlay */}
      {profile && !profile.onboarding_complete && <OnboardingFlow />}

      {/* Header */}
      <header className="text-center mb-7 animate-fade-up">
        {/* Left: back button or Onyx Mercer badge */}
        <div className="absolute top-6 left-6">
          {activeTab !== 'dashboard' ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="p-2 glass-card text-pulse-label hover:text-pulse-blue dark:text-sky-100/70 dark:hover:text-sky-100 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-pulse-blue/40 dark:text-sky-100/30">
              Onyx Mercer
            </span>
          )}
        </div>

        <h1 className="font-serif text-5xl text-pulse-blue dark:text-sky-50 mb-1">Our Pulse</h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-pulse-label dark:text-sky-100/55 font-medium">
          We show up for each other
        </p>

        {/* Right: dark mode + logout */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 glass-card text-pulse-label hover:text-pulse-blue dark:text-sky-100/55 dark:hover:text-sky-100 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={signOut}
            className="p-2 glass-card text-pulse-label/70 hover:text-red-500 dark:text-sky-100/50 dark:hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'contacts' && <Contacts />}
          {activeTab === 'history' && <History />}
          {activeTab === 'settings' && <Settings />}
        </AnimatePresence>
      </main>

      <Navbar />
      <Toast />
      <InstallPrompt />
    </div>
  );
}
