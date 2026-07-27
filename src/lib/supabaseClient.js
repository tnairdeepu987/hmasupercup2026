import { createClient } from '@supabase/supabase-js'

const normalizeSupabaseUrl = (value) => {
  if (!value) return ''

  const cleaned = value.trim().replace(/\/+$/, '')
  try {
    const parsed = new URL(cleaned)
    const normalizedPath = parsed.pathname.replace(/\/+$/, '')
    const servicePaths = ['/rest/v1', '/auth/v1', '/storage/v1', '/graphql/v1', '/realtime/v1']

    if (servicePaths.includes(normalizedPath)) {
      return parsed.origin
    }

    return parsed.origin + (normalizedPath && normalizedPath !== '/' ? normalizedPath : '')
  } catch {
    return cleaned
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
const url = normalizeSupabaseUrl(rawUrl)
const anonKey = rawAnonKey

// A friendly flag the UI can use to show a "configure Supabase" banner
// instead of crashing when env vars are missing (e.g. first local run).
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[HMA Super Cup] Supabase env vars are missing. ' +
      'Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Fall back to harmless placeholder values so createClient does not throw.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
)
