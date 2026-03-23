import { createClient } from '@supabase/supabase-js';
import type { Pulse, Contact, UserProfile, PulseType } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// DB row → app type mappers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapPulse = (row: any): Pulse => ({
  id: row.id,
  user_id: row.user_id,
  type: row.type as PulseType,
  timestamp: new Date(row.sent_at).getTime(),
  dateString: row.date_string, // Postgres returns date as YYYY-MM-DD string
  location: {
    lat: row.lat,
    lng: row.lng,
    city: row.city ?? undefined,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapContact = (row: any): Contact => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  relation: row.relation ?? '',
  email: row.email ?? '',
  initial: row.name.charAt(0).toUpperCase(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapProfile = (row: any, email: string): UserProfile => ({
  id: row.id,
  email,
  name: row.name ?? '',
  onboarding_complete: row.onboarding_complete ?? false,
});
