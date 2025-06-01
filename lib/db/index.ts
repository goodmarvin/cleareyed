import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from "@/lib/env.mjs";
import type { Database } from './types';

// Server-side client with service role key (for admin operations)
export const supabaseAdmin: SupabaseClient<Database> = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Client-side helper (for client components)
export const createClientSupabase = () => createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Re-export for convenience
export const db = supabaseAdmin;

