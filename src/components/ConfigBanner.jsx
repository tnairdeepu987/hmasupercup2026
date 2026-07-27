import { isSupabaseConfigured } from '../lib/supabaseClient.js'

export default function ConfigBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div className="bg-gold/15 border-y border-gold/30 text-gold">
      <div className="max-w-6xl mx-auto px-4 py-2 text-sm">
        ⚙️ <strong>Supabase not configured.</strong> Copy <code>.env.example</code> to{' '}
        <code>.env</code> and add your <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server. See{' '}
        <code>SETUP.md</code>.
      </div>
    </div>
  )
}
