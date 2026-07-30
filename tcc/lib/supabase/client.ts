import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for use in client components.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * to be set (see .env.example). Until those are set, the app runs
 * entirely on the local store in lib/store/AppStoreContext.tsx, which
 * mirrors this exact schema — see README.md "Connecting Supabase".
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}
