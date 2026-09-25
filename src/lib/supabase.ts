import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type AnalysisType = 'text' | 'image' | 'audio' | 'camera' | 'recording' | 'link';
export type AnalysisResult =
  | 'No Strong Suspicious Signals'
  | 'Needs Verification'
  | 'Potentially Misleading'
  | 'Strong Suspicious Signals'
  | 'Potentially Authentic'
  | 'Potentially Manipulated'
  | 'Potentially AI-Generated'
  | 'Unable to Determine';

export interface AnalysisRecord {
  id: string;
  user_id: string;
  analysis_type: AnalysisType;
  language: string;
  status: string;
  result: string;
  confidence: number;
  explanation: string;
  created_at: string;
}

export interface Profile {
  id: string;
  auth_provider_id: string;
  full_name: string;
  email: string;
  preferred_language: string;
  theme: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface PrivacySettings {
  id: string;
  user_id: string;
  save_history: boolean;
  save_uploaded_files: boolean;
  analytics_enabled: boolean;
  personalization_enabled: boolean;
  updated_at: string;
}
