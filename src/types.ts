export type PulseType = 'morning' | 'evening';

export interface Location {
  lat: number;
  lng: number;
  city?: string;
}

export interface Pulse {
  id: string;
  user_id: string;
  type: PulseType;
  timestamp: number; // ms since epoch (from DB sent_at)
  dateString: string; // YYYY-MM-DD
  location: Location;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relation: string;
  email: string;
  initial: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  onboarding_complete: boolean;
}
