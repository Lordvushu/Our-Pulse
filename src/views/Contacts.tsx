import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Plus, Trash2, Users, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export function Contacts() {
  const { contacts, addContact, removeContact } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', relation: '', email: '' });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await addContact(form.name, form.relation, form.email);
    setForm({ name: '', relation: '', email: '' });
    setIsAdding(false);
    setSaving(false);
  };

  const cancel = () => {
    setForm({ name: '', relation: '', email: '' });
    setIsAdding(false);
  };

  return (
    <motion.div
      key="contacts"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="space-y-5"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-pulse-blue dark:text-sky-50">Your Circle</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end text-white rounded-full shadow-md shadow-pulse-cyan/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add contact form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="glass-card p-5 space-y-4 overflow-hidden"
          >
            <p className="text-[10px] uppercase tracking-wider font-bold text-pulse-label/70 dark:text-sky-100/50">
              New circle member
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-pulse-blue/40 dark:text-sky-100/40 ml-1">Name *</label>
                <input
                  type="text" required value={form.name} onChange={set('name')} autoFocus
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-pulse-blue/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-cyan/30 dark:text-sky-100 placeholder:text-pulse-blue/25"
                  placeholder="Mum"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-pulse-blue/40 dark:text-sky-100/40 ml-1">Relation</label>
                <input
                  type="text" value={form.relation} onChange={set('relation')}
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-pulse-blue/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-cyan/30 dark:text-sky-100 placeholder:text-pulse-blue/25"
                  placeholder="Family"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-pulse-blue/40 dark:text-sky-100/40 ml-1">Email Address *</label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-pulse-blue/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-cyan/30 dark:text-sky-100 placeholder:text-pulse-blue/25"
                placeholder="mum@example.com"
              />
              <p className="text-[10px] text-pulse-blue/35 dark:text-sky-100/25 ml-1">Required to receive pulse alerts</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit" disabled={saving}
                className="flex-1 bg-pulse-blue dark:bg-sky-700 text-white text-xs font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving ? 'Adding…' : 'Add Member'}
              </button>
              <button
                type="button" onClick={cancel}
                className="px-4 border border-pulse-blue/15 dark:border-white/10 text-pulse-blue/60 dark:text-sky-100/50 text-xs font-bold rounded-lg hover:bg-pulse-blue/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Contact list */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users size={52} className="mx-auto text-pulse-blue/20 dark:text-sky-100/15" />
            <div>
              <p className="text-sm font-medium text-pulse-blue/50 dark:text-sky-100/40">Your circle is empty</p>
              <p className="text-xs text-pulse-label/40 dark:text-sky-100/30 mt-1">
                Add people who should receive your check-in emails
              </p>
            </div>
          </div>
        ) : (
          contacts.map(contact => (
            <motion.div
              layout
              key={contact.id}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-full bg-pulse-label/10 dark:bg-sky-900/40 border-2 border-pulse-label/15 dark:border-sky-700/40 flex items-center justify-center text-pulse-label dark:text-sky-200 font-bold text-base shrink-0">
                  {contact.initial}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-pulse-blue dark:text-sky-100 truncate">{contact.name}</h3>
                  {contact.relation && (
                    <p className="text-[10px] text-pulse-blue/40 dark:text-sky-100/40 uppercase tracking-wider">{contact.relation}</p>
                  )}
                  {contact.email && (
                    <p className="text-[11px] text-pulse-label/50 dark:text-sky-100/35 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={10} className="shrink-0" />
                      {contact.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeContact(contact.id)}
                className="p-2 text-red-400/50 hover:text-red-500 active:text-red-600 transition-colors shrink-0 ml-2"
                aria-label={`Remove ${contact.name}`}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
