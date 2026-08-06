import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublicKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const publicRemoteEnabled = Boolean(supabaseUrl && supabasePublicKey);
export const publicSupabase = publicRemoteEnabled ? createClient(supabaseUrl!, supabasePublicKey!) : null;
