import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Heart, Users, Bell, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export function OnboardingFlow() {
  const { addContact, updateProfile, requestNotificationPermission, notificationPermission } = useApp();
  const [step, setStep] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', relation: '', email: '' });
  const [adding, setAdding] = useState(false);
  const [contactAdded, setContactAdded] = useState(false);

  const handleAddContact = async (e: FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await addContact(contactForm.name, contactForm.relation, contactForm.email);
    setContactAdded(true);
    setAdding(false);
  };

  const complete = async () => {
    await updateProfile({ onboarding_complete: true });
  };

  const set = (key: keyof typeof contactForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setContactForm(prev => ({ ...prev, [key]: e.target.value }));

  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end mx-auto flex items-center justify-center shadow-xl shadow-pulse-cyan/30">
          <Heart size={36} className="text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-serif text-4xl text-pulse-blue mb-2">Welcome</h2>
          <p className="text-pulse-label/70 text-sm leading-relaxed">
            Our Pulse helps the people who care about you know you're safe.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { icon: '☀️', title: 'Morning check-in', desc: '5 AM – 11 AM · Tap the button, share your location' },
          { icon: '🌙', title: 'Evening check-in', desc: '8 PM – 12 AM · A second pulse to end the day' },
          { icon: '💙', title: 'Your circle is notified', desc: 'An email goes to everyone who cares about you' },
          { icon: '🚨', title: 'Missed? They reach out', desc: 'No pulse means your circle knows to check in' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-3 bg-sky-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-pulse-blue dark:text-sky-100">{item.title}</p>
              <p className="text-xs text-pulse-label/80 dark:text-sky-300/80 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setStep(1)}
        className="w-full bg-gradient-to-r from-pulse-btn-start to-pulse-btn-end text-white font-semibold py-4 rounded-xl shadow-lg shadow-pulse-cyan/20 flex items-center justify-center gap-2"
      >
        Get Started <ChevronRight size={16} />
      </button>
    </motion.div>,

    // Step 1: Add first contact
    <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-pulse-label/10 dark:bg-sky-900/40 mx-auto flex items-center justify-center">
          <Users size={24} className="text-pulse-label dark:text-sky-300" />
        </div>
        <h2 className="font-serif text-3xl text-pulse-blue dark:text-sky-50">Your Circle</h2>
        <p className="text-sm text-pulse-label/80 dark:text-sky-300/80">
          Add at least one person who should receive your check-in emails.
        </p>
      </div>

      {contactAdded ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 mx-auto flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-pulse-blue dark:text-sky-100">{contactForm.name} added!</p>
            <p className="text-xs text-pulse-label/70 dark:text-sky-300/70 mt-1">They'll receive email alerts when you check in.</p>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-pulse-btn-start to-pulse-btn-end text-white font-semibold py-4 rounded-xl shadow-lg shadow-pulse-cyan/20 flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-pulse-label ml-1">Name</label>
            <input
              type="text" required value={contactForm.name} onChange={set('name')}
              className="w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 placeholder:text-slate-400"
              placeholder="Mum"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-pulse-label ml-1">Relation</label>
            <input
              type="text" value={contactForm.relation} onChange={set('relation')}
              className="w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 placeholder:text-slate-400"
              placeholder="Family"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-pulse-label ml-1">Email Address <span className="text-red-400">*</span></label>
            <input
              type="email" required value={contactForm.email} onChange={set('email')}
              className="w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 placeholder:text-slate-400"
              placeholder="mum@example.com"
            />
            <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70 ml-1">They'll receive an email when you check in</p>
          </div>
          <button
            type="submit" disabled={adding}
            className="w-full bg-pulse-blue dark:bg-sky-700 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {adding ? 'Adding…' : 'Add to Circle'}
          </button>
        </form>
      )}
    </motion.div>,

    // Step 2: Notifications
    <motion.div key="notify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 mx-auto flex items-center justify-center">
          <Bell size={24} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="font-serif text-3xl text-pulse-blue dark:text-sky-50">Reminders</h2>
        <p className="text-sm text-pulse-label/80 dark:text-sky-300/80">
          Get a nudge before each window closes so you never miss a check-in.
        </p>
      </div>

      <div className="glass-card p-4 space-y-3">
        {[
          { time: '10:30 AM', label: 'Morning closing soon' },
          { time: '10:50 AM', label: 'Last chance — morning window' },
          { time: '11:30 PM', label: 'Evening closing soon' },
          { time: '11:50 PM', label: 'Last chance — evening window' },
        ].map(r => (
          <div key={r.time} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-pulse-cyan shrink-0" />
            <span className="text-xs font-semibold text-pulse-blue dark:text-sky-100 w-16">{r.time}</span>
            <span className="text-xs text-pulse-label/80 dark:text-sky-300">{r.label}</span>
          </div>
        ))}
      </div>

      {notificationPermission === 'granted' ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 justify-center">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">Notifications enabled</span>
        </div>
      ) : (
        <button
          onClick={requestNotificationPermission}
          className="w-full bg-gradient-to-r from-pulse-btn-start to-pulse-btn-end text-white font-semibold py-4 rounded-xl shadow-lg shadow-pulse-cyan/20 flex items-center justify-center gap-2"
        >
          <Bell size={16} /> Enable Notifications
        </button>
      )}

      <button onClick={complete} className="w-full text-xs text-pulse-label/70 dark:text-sky-300/70 hover:text-pulse-label dark:hover:text-sky-200 py-2 transition-colors">
        {notificationPermission === 'granted' ? 'Finish setup →' : 'Skip for now'}
      </button>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-6 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-pulse-cyan'
                  : i < step
                  ? 'w-3 bg-pulse-cyan/40'
                  : 'w-3 bg-pulse-blue/15 dark:bg-white/15'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </motion.div>
    </div>
  );
}
