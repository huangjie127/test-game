import type { ProjectRound } from './types'

export const ROUNDS: readonly ProjectRound[] = [
  {
    roundNumber: 1,
    title: '旧城排水管网改造项目',
    brief: '城市内涝频发，需要在预算约束下提升排水能力。',
    options: [
      { id: 'A', budget_cost: 680, accident_risk_percent: 4.0, economic_benefit_index: 62, duration_months: 10 },
      { id: 'B', budget_cost: 820, accident_risk_percent: 6.5, economic_benefit_index: 78, duration_months: 12 },
      { id: 'C', budget_cost: 520, accident_risk_percent: 9.5, economic_benefit_index: 70, duration_months: 9 },
      { id: 'D', budget_cost: 930, accident_risk_percent: 3.0, economic_benefit_index: 80, duration_months: 14 },
    ],
  },
  {
    roundNumber: 2,
    title: '城市快速路立交优化工程',
    brief: '通勤拥堵严重，目标是提升通行效率并控制施工风险。',
    options: [
      { id: 'A', budget_cost: 760, accident_risk_percent: 5.0, economic_benefit_index: 66, duration_months: 11 },
      { id: 'B', budget_cost: 910, accident_risk_percent: 7.5, economic_benefit_index: 82, duration_months: 13 },
      { id: 'C', budget_cost: 610, accident_risk_percent: 10.5, economic_benefit_index: 74, duration_months: 10 },
      { id: 'D', budget_cost: 980, accident_risk_percent: 4.0, economic_benefit_index: 84, duration_months: 15 },
    ],
  },
  {
    roundNumber: 3,
    title: '滨江公共空间提升工程',
    brief: '提升城市形象与公共服务能力，同时兼顾施工期安全管理。',
    options: [
      { id: 'A', budget_cost: 540, accident_risk_percent: 4.5, economic_benefit_index: 60, duration_months: 9 },
      { id: 'B', budget_cost: 700, accident_risk_percent: 6.0, economic_benefit_index: 76, duration_months: 11 },
      { id: 'C', budget_cost: 470, accident_risk_percent: 8.5, economic_benefit_index: 68, duration_months: 8 },
      { id: 'D', budget_cost: 820, accident_risk_percent: 3.5, economic_benefit_index: 79, duration_months: 12 },
    ],
  },
  {
    roundNumber: 4,
    title: '老旧小区电梯加装与消防改造',
    brief: '改善民生与安全条件，但施工组织复杂，存在一定事故概率。',
    options: [
      { id: 'A', budget_cost: 620, accident_risk_percent: 5.5, economic_benefit_index: 64, duration_months: 10 },
      { id: 'B', budget_cost: 780, accident_risk_percent: 7.0, economic_benefit_index: 79, duration_months: 12 },
      { id: 'C', budget_cost: 510, accident_risk_percent: 9.0, economic_benefit_index: 72, duration_months: 9 },
      { id: 'D', budget_cost: 860, accident_risk_percent: 4.5, economic_benefit_index: 81, duration_months: 13 },
    ],
  },
  {
    roundNumber: 5,
    title: '地铁站周边综合管廊工程',
    brief: '工程体量大、工序交叉多。高风险选择可能引发重大事故。',
    options: [
      { id: 'A', budget_cost: 880, accident_risk_percent: 6.0, economic_benefit_index: 70, duration_months: 14 },
      { id: 'B', budget_cost: 1020, accident_risk_percent: 8.5, economic_benefit_index: 86, duration_months: 16 },
      { id: 'C', budget_cost: 740, accident_risk_percent: 12.5, economic_benefit_index: 80, duration_months: 12 },
      { id: 'D', budget_cost: 1120, accident_risk_percent: 5.0, economic_benefit_index: 88, duration_months: 18 },
    ],
  },
]
