import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback placeholders prevent @supabase/ssr from throwing during SSR/build
  // when env vars aren't available. All real API calls only happen in the
  // browser (inside useEffect/event handlers), so the placeholder is never used.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
