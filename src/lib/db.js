import { supabase } from './supabaseClient.js'

// Thin CRUD helpers. Realtime + DataContext.refresh keep the UI in sync,
// so these just perform the write and surface any error.

export async function insertRow(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateRow(table, id, values) {
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

// Coerce empty strings to null and numbers to ints for numeric fields.
export function clean(values, intFields = []) {
  const out = {}
  for (const [k, v] of Object.entries(values)) {
    if (v === '' || v === undefined) {
      out[k] = null
    } else if (intFields.includes(k)) {
      const n = parseInt(v, 10)
      out[k] = Number.isNaN(n) ? null : n
    } else {
      out[k] = v
    }
  }
  return out
}
