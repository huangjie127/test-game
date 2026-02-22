import type { PostSurveyRecord, RoundDecisionRecord } from '../types'
import type { ExperimentStorage, StorageWriteResult } from './storage'

type LocalDb = {
  experiment_data: RoundDecisionRecord[]
  post_survey: PostSurveyRecord[]
}

const DB_KEY = 'test-game/local-db'

function loadDb(): LocalDb {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return { experiment_data: [], post_survey: [] }
    return JSON.parse(raw) as LocalDb
  } catch {
    return { experiment_data: [], post_survey: [] }
  }
}

function saveDb(db: LocalDb): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export class LocalStorageExperimentStore implements ExperimentStorage {
  async writeRoundDecision(record: RoundDecisionRecord): Promise<StorageWriteResult> {
    const db = loadDb()
    const existingIndex = db.experiment_data.findIndex(
      (r) => r.participant_id === record.participant_id && r.round_number === record.round_number,
    )
    if (existingIndex >= 0) {
      db.experiment_data[existingIndex] = record
    } else {
      db.experiment_data.push(record)
    }
    saveDb(db)
    return { ok: true }
  }

  async writePostSurvey(record: PostSurveyRecord): Promise<StorageWriteResult> {
    const db = loadDb()
    const existingIndex = db.post_survey.findIndex((r) => r.participant_id === record.participant_id)
    if (existingIndex >= 0) {
      db.post_survey[existingIndex] = record
    } else {
      db.post_survey.push(record)
    }
    saveDb(db)
    return { ok: true }
  }
}
