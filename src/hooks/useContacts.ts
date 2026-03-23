import { useState, useEffect, useCallback } from 'react';
import { supabase, mapContact } from '../lib/supabase';
import type { Contact } from '../types';

export function useContacts(userId: string | undefined, showError: (msg: string) => void) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const fetchContacts = useCallback(async (uid: string) => {
    setContactsLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    if (!error && data) setContacts(data.map(mapContact));
    setContactsLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) { setContacts([]); return; }
    fetchContacts(userId);
  }, [userId, fetchContacts]);

  const addContact = useCallback(async (name: string, relation: string, email: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('contacts')
      .insert({ user_id: userId, name: name.trim(), relation: relation.trim(), email: email.trim() })
      .select()
      .single();
    if (error) {
      showError('Failed to add contact.');
    } else if (data) {
      setContacts(prev => [...prev, mapContact(data)]);
    }
  }, [userId, showError]);

  const removeContact = useCallback(async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      showError('Failed to remove contact.');
    } else {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  }, [showError]);

  return { contacts, contactsLoading, addContact, removeContact };
}
