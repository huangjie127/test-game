import type { OptionId, ProjectRound } from './types'

const DEFAULT_AI_RECOMMENDATION: Record<number, OptionId> = {
  1: 'B',
  2: 'B',
  3: 'B',
  4: 'B',
  5: 'B',
}

export function aiRecommendationForRound(round: ProjectRound): OptionId {
  return DEFAULT_AI_RECOMMENDATION[round.roundNumber] ?? 'B'
}

export function aiExplanationText(): string {
  return '基于历史相似项目收益—风险模型综合评估'
}
