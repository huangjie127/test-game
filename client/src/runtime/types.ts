export type GroupType = 'AI' | 'Control'

export type OptionId = 'A' | 'B' | 'C' | 'D'

export type ExperimentStep =
  | 'consent'
  | 'role'
  | 'round'
  | 'extreme'
  | 'survey'
  | 'end'

export type RiskPercent = number

export type ProjectOption = {
  id: OptionId
  budget_cost: number
  accident_risk_percent: RiskPercent
  economic_benefit_index: number
  duration_months?: number
}

export type ProjectRound = {
  roundNumber: number
  title: string
  brief: string
  options: readonly ProjectOption[]
}

export type RoundDecisionRecord = {
  participant_id: string
  group_type: GroupType
  round_number: number
  chosen_option: OptionId
  ai_recommendation: OptionId | null
  follow_ai: boolean
  risk_level: number
  decision_time: number
  extreme_event: boolean
}

export type PostSurveyRecord = {
  participant_id: string
  group_type: GroupType
  trust_ai: number
  safer_follow: number
  more_professional: number
  responsibility: number
}

export type ParticipantProgress = {
  participantId: string
  groupType: GroupType
  step: ExperimentStep
  currentRound: number
  optionOrderByRound: Record<number, OptionId[]>
  startedAtByRound: Record<number, number>
  extremeTriggered?: boolean
  completed?: boolean
}
