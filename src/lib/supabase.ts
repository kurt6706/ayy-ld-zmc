import { createClient, SupabaseClient } from '@supabase/supabase-js';

export { createClient, type SupabaseClient };

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' ? process.env : {};

const supabaseUrl = 
  metaEnv?.VITE_SUPABASE_URL || 
  procEnv?.VITE_SUPABASE_URL || 
  procEnv?.SUPABASE_URL || 
  '';

const supabaseKey = 
  metaEnv?.VITE_SUPABASE_API_KEY || 
  metaEnv?.VITE_SUPABASE_ANON_KEY || 
  procEnv?.VITE_SUPABASE_API_KEY || 
  procEnv?.VITE_SUPABASE_ANON_KEY || 
  procEnv?.SUPABASE_API_KEY || 
  procEnv?.SUPABASE_ANON_KEY || 
  '';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;



