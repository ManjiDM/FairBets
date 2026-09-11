import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;
let configurationError: string | null = null;

if (supabaseUrl || supabaseAnonKey) {
  if (!supabaseUrl || !supabaseAnonKey) {
    configurationError =
      "Cloud sync needs both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
  } else {
    try {
      new URL(supabaseUrl);
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (error) {
      console.error("Supabase configuration could not be initialized.", error);
      configurationError = "Cloud sync could not start because the Supabase URL is invalid.";
    }
  }
}

export const supabase = client;
export const isSupabaseConfigured = supabase !== null;
export const supabaseConfigurationError = configurationError;
