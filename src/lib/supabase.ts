import { createClient } from '@supabase/supabase-js';

// User's configured Supabase project
const DEFAULT_SUPABASE_URL = "https://iykjnanfjawsxclupxdh.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_3StYhSVbTXibRpD59YBQfQ_PfbILdlD";

// Safe environment variable resolution across Vite and Node.js
const supabaseUrl = 
  (typeof process !== 'undefined' && (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey = 
  (typeof process !== 'undefined' && (process.env?.SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('example.supabase.co')
  );
};

// Singleton client instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
