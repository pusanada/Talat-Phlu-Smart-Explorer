import { createClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://lyroyanoyrzthcqinvai.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_NNNcVh79LQTnIi3dUYB6Ug_nV5o3fAV'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseUrl =
  rawUrl && !rawUrl.includes('placeholder') && !rawUrl.includes('your-project')
    ? rawUrl
    : FALLBACK_SUPABASE_URL

const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
const cleanedKey = rawAnonKey.startsWith('ssb_') ? rawAnonKey.slice(1) : rawAnonKey
const supabaseAnonKey =
  cleanedKey && !cleanedKey.includes('your-anon-key')
    ? cleanedKey
    : FALLBACK_SUPABASE_ANON_KEY

/**
 * Checks if real Supabase environment variables are provided
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

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
