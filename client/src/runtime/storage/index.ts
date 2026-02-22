import type { ExperimentStorage } from './storage'
import { LocalStorageExperimentStore } from './localStore'
import { SupabaseExperimentStore } from './supabaseStore'

export function createExperimentStore(): ExperimentStorage {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (url && anonKey) {
    return new SupabaseExperimentStore(url, anonKey)
  }

  return new LocalStorageExperimentStore()
}
