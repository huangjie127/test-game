import type { PostSurveyRecord, RoundDecisionRecord } from '../types'

export type StorageWriteResult = { ok: true } | { ok: false; error: string }

export interface ExperimentStorage {
  writeRoundDecision(record: RoundDecisionRecord): Promise<StorageWriteResult>
  writePostSurvey(record: PostSurveyRecord): Promise<StorageWriteResult>
}
