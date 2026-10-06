import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * null when .env is not filled in yet. The storefront then runs on demo data
 * (src/lib/demo-data.ts) so you can see the design before wiring Supabase.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

export const isDemoMode = supabase === null
