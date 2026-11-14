import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
// Auto-heal common typo where 'sb_' was typed as 'ssb_'
const supabaseAnonKey = rawAnonKey.startsWith('ssb_') ? rawAnonKey.slice(1) : rawAnonKey

/**
 * Checks if real Supabase environment variables are provided
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
)

/**
 * Supabase client instance (or null if not yet configured)
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase credentials are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}
