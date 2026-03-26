import { type Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  is_admin: boolean;
  // Add other profile fields as needed
}

export interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ data: { user: Session['user'] | null } | null; error: Error | null; }>;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
}