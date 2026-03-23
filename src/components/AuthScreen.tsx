import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export function AuthScreen() {
  const { signIn, signUp, showError } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password);
        if (error) showError(error);
      } else {
        if (!form.name.trim()) {
          showError('Please enter your name.');
          return;
        }
        const { error } = await signUp(form.email, form.password, form.name.trim());
        if (error) showError(error);
        // On successful signup, Supabase sends a confirmation email
        // In dev with email confirmations off, the session starts immediately
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 space-y-8"
      >
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end mx-auto flex items-center justify-center shadow-lg shadow-pulse-cyan/30">
            <Heart size={28} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-serif text-5xl text-pulse-blue">Our Pulse</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-pulse-label/80 font-bold mt-1">
              We show up for each other
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-pulse-label ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                className="w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 transition-all placeholder:text-slate-400"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-pulse-label ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              className="w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 transition-all placeholder:text-slate-400"
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-pulse-label ml-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={set('password')}
              className="w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 transition-all placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pulse-btn-start to-pulse-btn-end text-white font-semibold py-4 rounded-xl shadow-lg shadow-pulse-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs text-pulse-label/70 hover:text-pulse-blue dark:text-sky-300/70 dark:hover:text-sky-200 transition-colors"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Onyx Mercer byline */}
        <div className="text-center pt-2 border-t border-sky-200 dark:border-sky-800/50">
          <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/60 tracking-wider">
            An <span className="font-semibold text-pulse-label dark:text-sky-300">Onyx Mercer</span> product &nbsp;·&nbsp; © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
