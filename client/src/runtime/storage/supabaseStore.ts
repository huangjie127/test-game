import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { PostSurveyRecord, RoundDecisionRecord } from '../types'
import type { ExperimentStorage, StorageWriteResult } from './storage'

type Database = {
  public: {
    Tables: {
      experiment_data: {
        Row: RoundDecisionRecord & { id: number; created_at: string }
        Insert: RoundDecisionRecord
        Update: Partial<RoundDecisionRecord>
        Relationships: []
      }
      post_survey: {
        Row: PostSurveyRecord & { id: number; created_at: string }
        Insert: PostSurveyRecord
        Update: Partial<PostSurveyRecord>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

function toErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export class SupabaseExperimentStore implements ExperimentStorage {
  private readonly client: SupabaseClient<Database>

  constructor(url: string, anonKey: string) {
    this.client = createClient<Database>(url, anonKey)
  }

  async writeRoundDecision(record: RoundDecisionRecord): Promise<StorageWriteResult> {
    const { error } = await this.client
      .from('experiment_data')
      .upsert(record, { onConflict: 'participant_id,round_number' })
    if (error) return { ok: false, error: toErrorMessage(error) }
    return { ok: true }
  }

  async writePostSurvey(record: PostSurveyRecord): Promise<StorageWriteResult> {
    const { error } = await this.client.from('post_survey').upsert(record, { onConflict: 'participant_id' })
    if (error) return { ok: false, error: toErrorMessage(error) }
    return { ok: true }
  }
}
