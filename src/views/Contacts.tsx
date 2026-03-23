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

  const inputClass = "w-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-pulse-blue dark:text-sky-100 focus:outline-none focus:ring-2 focus:ring-pulse-cyan/40 placeholder:text-slate-400";
  const labelClass = "text-[10px] uppercase font-bold tracking-wider text-pulse-label dark:text-sky-300 ml-1";

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
          className="w-10 h-10 bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end text-white rounded-full shadow-md shadow-pulse-cyan/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="glass-card p-5 space-y-4 overflow-hidden"
          >
            <p className="text-[11px] uppercase tracking-wider font-bold text-pulse-label dark:text-sky-300">
              New circle member
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Name *</label>
                <input type="text" required value={form.name} onChange={set('name')} autoFocus className={inputClass} placeholder="Mum" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Relation</label>
                <input type="text" value={form.relation} onChange={set('relation')} className={inputClass} placeholder="Family" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Email Address *</label>
              <input type="email" required value={form.email} onChange={set('email')} className={inputClass} placeholder="mum@example.com" />
              <p className="text-[10px] text-pulse-label/70 dark:text-sky-300/70 ml-1">Required to receive pulse alerts</p>
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
                className="px-4 border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-sky-300 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
            <Users size={52} className="mx-auto text-sky-300 dark:text-sky-700" />
            <div>
              <p className="text-sm font-semibold text-pulse-blue/70 dark:text-sky-200">Your circle is empty</p>
              <p className="text-xs text-pulse-label/70 dark:text-sky-300/70 mt-1">
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
                <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/50 border-2 border-sky-300 dark:border-sky-600/60 flex items-center justify-center text-pulse-label dark:text-sky-200 font-bold text-base shrink-0">
                  {contact.initial}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-pulse-blue dark:text-sky-100 truncate">{contact.name}</h3>
                  {contact.relation && (
                    <p className="text-[11px] text-pulse-label/80 dark:text-sky-300/80 uppercase tracking-wider font-medium">{contact.relation}</p>
                  )}
                  {contact.email && (
                    <p className="text-[11px] text-pulse-label/70 dark:text-sky-300/70 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={10} className="shrink-0" />
                      {contact.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeContact(contact.id)}
                className="p-2 text-red-400 hover:text-red-600 transition-colors shrink-0 ml-2"
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
