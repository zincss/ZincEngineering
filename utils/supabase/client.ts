import { createBrowserClient } from '@supabase/ssr'

// 1. Create a variable to hold the singleton instance outside the function
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // 2. If the client already exists, return it immediately!
  // This prevents multiple instances from fighting over the session.
  if (client) return client

  // 3. Otherwise, create it once and store it
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return client
}