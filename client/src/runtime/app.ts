import { aiExplanationText, aiRecommendationForRound } from './ai'
import { ROUNDS } from './projects'
import type {
  GroupType,
  OptionId,
  ParticipantProgress,
  PostSurveyRecord,
  ProjectOption,
  ProjectRound,
  RoundDecisionRecord,
} from './types'
import { clampLikert, ensureUuid, nowMs, optionIds, shuffle } from './utils'
import { createExperimentStore } from './storage'

const PROGRESS_KEY = 'test-game/progress'

function loadProgress(): ParticipantProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ParticipantProgress
  } catch {
    return null
  }
}

function saveProgress(progress: ParticipantProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

function randomGroupType(): GroupType {
  return Math.random() < 0.5 ? 'AI' : 'Control'
}

function ensureProgress(): ParticipantProgress {
  const existing = loadProgress()
  if (existing) return existing

  const participantId = ensureUuid()
  const groupType = randomGroupType()
  const optionOrderByRound: Record<number, OptionId[]> = {}
  for (const round of ROUNDS) {
    optionOrderByRound[round.roundNumber] = shuffle(optionIds())
  }

  const progress: ParticipantProgress = {
    participantId,
    groupType,
    step: 'consent',
    currentRound: 1,
    optionOrderByRound,
    startedAtByRound: {},
  }
  saveProgress(progress)
  return progress
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  return node
}

function clear(node: HTMLElement): void {
  node.innerHTML = ''
}

function setTopTitle(container: HTMLElement, title: string): void {
  const h1 = el('h1')
  h1.textContent = title
  container.appendChild(h1)
}

function projectRoundByNumber(roundNumber: number): ProjectRound {
  const round = ROUNDS.find((r) => r.roundNumber === roundNumber)
  if (!round) throw new Error(`Unknown round: ${roundNumber}`)
  return round
}

function optionById(round: ProjectRound, optionId: OptionId): ProjectOption {
  const opt = round.options.find((o) => o.id === optionId)
  if (!opt) throw new Error(`Unknown option: ${optionId}`)
  return opt
}

function isExtremeEvent(roundNumber: number, option: ProjectOption): boolean {
  return roundNumber === 5 && option.accident_risk_percent > 10
}

function renderConsent(root: HTMLElement, progress: ParticipantProgress, onNext: () => void, onDecline: () => void): void {
  clear(root)
  setTopTitle(root, '知情同意')

  const panel = el('div', 'panel')
  panel.appendChild(
    Object.assign(el('p'), {
      textContent:
        '本研究用于学术研究数据采集，不用于真实审批场景。你将完成 5 轮项目审批选择与一份简短问卷。全程匿名，可随时退出。',
    }),
  )
  panel.appendChild(Object.assign(el('p', 'muted'), { textContent: `参与者编号：${progress.participantId}` }))
  root.appendChild(panel)

  const row = el('div', 'row')
  const agreeBtn = el('button', 'primary')
  agreeBtn.textContent = '我同意并继续'
  agreeBtn.onclick = () => onNext()

  const declineBtn = el('button')
  declineBtn.textContent = '我不同意 / 退出'
  declineBtn.onclick = () => onDecline()
  row.appendChild(agreeBtn)
  row.appendChild(declineBtn)
  root.appendChild(el('div', 'spacer'))
  root.appendChild(row)
}

function renderRole(root: HTMLElement, onNext: () => void): void {
  clear(root)
  setTopTitle(root, '角色设定')
  const panel = el('div', 'panel')
  panel.appendChild(
    Object.assign(el('p'), {
      textContent: '你将扮演：某市发改委工程审批委员会成员。你需要在预算与风险约束下审批城市建设项目。',
    }),
  )
  panel.appendChild(Object.assign(el('p', 'muted'), { textContent: '请按照你的直觉和判断做出选择。本实验不提供“正确答案”。' }))
  root.appendChild(panel)

  root.appendChild(el('div', 'spacer'))
  const nextBtn = el('button', 'primary')
  nextBtn.textContent = '进入第 1 轮'
  nextBtn.onclick = () => onNext()
  root.appendChild(nextBtn)
}

function renderRound(
  root: HTMLElement,
  progress: ParticipantProgress,
  round: ProjectRound,
  storageError: string | null,
  onSelect: (choice: OptionId) => void,
): void {
  clear(root)
  setTopTitle(root, `第 ${round.roundNumber} 轮：项目审批决策`)

  if (storageError) {
    const err = el('div', 'error')
    err.textContent = `数据写入失败：${storageError}`
    root.appendChild(err)
    root.appendChild(el('div', 'spacer'))
  }

  const panel = el('div', 'panel')
  panel.appendChild(Object.assign(el('h2'), { textContent: round.title }))
  panel.appendChild(Object.assign(el('p'), { textContent: round.brief }))

  if (progress.groupType === 'AI') {
    const rec = aiRecommendationForRound(round)
    panel.appendChild(Object.assign(el('p'), { textContent: `智能辅助审批系统建议方案：${rec}` }))
    panel.appendChild(Object.assign(el('p', 'muted'), { textContent: aiExplanationText() }))
  }
  root.appendChild(panel)

  root.appendChild(el('div', 'spacer'))

  const table = el('table')
  const thead = el('thead')
  const headRow = el('tr')
  for (const label of ['方案', '预算成本', '事故风险', '经济收益指数', '工期（月）', '选择']) {
    headRow.appendChild(Object.assign(el('th'), { textContent: label }))
  }
  thead.appendChild(headRow)
  table.appendChild(thead)

  const tbody = el('tbody')
  const order = progress.optionOrderByRound[round.roundNumber] ?? optionIds()
  for (const optionId of order) {
    const opt = optionById(round, optionId)
    const tr = el('tr')
    tr.appendChild(Object.assign(el('td'), { textContent: opt.id }))
    tr.appendChild(Object.assign(el('td'), { textContent: String(opt.budget_cost) }))
    tr.appendChild(Object.assign(el('td'), { textContent: `${opt.accident_risk_percent}%` }))
    tr.appendChild(Object.assign(el('td'), { textContent: String(opt.economic_benefit_index) }))
    tr.appendChild(Object.assign(el('td'), { textContent: opt.duration_months ? String(opt.duration_months) : '-' }))
    const choiceTd = el('td')
    const btn = el('button', 'choiceBtn')
    btn.textContent = `选择方案 ${opt.id}`
    btn.onclick = () => onSelect(opt.id)
    choiceTd.appendChild(btn)
    tr.appendChild(choiceTd)
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)
  root.appendChild(table)

  root.appendChild(el('div', 'spacer'))
  root.appendChild(Object.assign(el('p', 'muted'), { textContent: '提示：本轮选择后将自动进入下一轮，无法返回修改。' }))
}

function renderExtreme(root: HTMLElement, onNext: () => void): void {
  clear(root)
  setTopTitle(root, '重大事故反馈')
  const panel = el('div', 'panel')
  panel.appendChild(
    Object.assign(el('p'), {
      textContent: '项目发生重大安全事故，财政损失增加，城市发展指数下降。',
    }),
  )
  root.appendChild(panel)
  root.appendChild(el('div', 'spacer'))
  const nextBtn = el('button', 'primary')
  nextBtn.textContent = '进入后测问卷'
  nextBtn.onclick = () => onNext()
  root.appendChild(nextBtn)
}

function renderSurvey(root: HTMLElement, storageError: string | null, onSubmit: (values: number[]) => void): void {
  clear(root)
  setTopTitle(root, '后测问卷')
  if (storageError) {
    const err = el('div', 'error')
    err.textContent = `数据写入失败：${storageError}`
    root.appendChild(err)
    root.appendChild(el('div', 'spacer'))
  }

  const panel = el('div', 'panel')
  panel.appendChild(Object.assign(el('p'), { textContent: '请按 1–5 分进行评分（1=非常不同意，5=非常同意）。' }))

  const questions = [
    '我信任系统建议',
    '跟随系统建议更安全',
    '系统比我更专业',
    '若发生事故，系统应承担主要责任',
  ]

  const selects: HTMLSelectElement[] = []

  for (const q of questions) {
    const row = el('div')
    row.appendChild(Object.assign(el('p'), { textContent: q }))
    const select = el('select') as HTMLSelectElement
    for (let i = 1; i <= 5; i += 1) {
      const opt = el('option') as HTMLOptionElement
      opt.value = String(i)
      opt.textContent = String(i)
      select.appendChild(opt)
    }
    selects.push(select)
    row.appendChild(select)
    panel.appendChild(row)
    panel.appendChild(el('div', 'spacer'))
  }
  root.appendChild(panel)

  const submitBtn = el('button', 'primary')
  submitBtn.textContent = '提交并结束'
  submitBtn.onclick = () => {
    const values = selects.map((s) => clampLikert(Number(s.value)))
    onSubmit(values)
  }
  root.appendChild(el('div', 'spacer'))
  root.appendChild(submitBtn)
}

function renderEnd(root: HTMLElement): void {
  clear(root)
  setTopTitle(root, '实验结束')
  const panel = el('div', 'panel')
  panel.appendChild(Object.assign(el('p'), { textContent: '感谢你的参与！你可以关闭本页面。' }))
  root.appendChild(panel)
}

export function startApp(root: HTMLElement): void {
  const store = createExperimentStore()
  let progress = ensureProgress()
  let lastStorageError: string | null = null

  const rerender = () => {
    if (progress.completed) {
      renderEnd(root)
      return
    }

    if (progress.step === 'consent') {
      renderConsent(
        root,
        progress,
        () => {
          progress = { ...progress, step: 'role' }
          saveProgress(progress)
          rerender()
        },
        () => {
          progress = { ...progress, completed: true, step: 'end' }
          saveProgress(progress)
          renderEnd(root)
        },
      )
      return
    }

    if (progress.step === 'role') {
      renderRole(root, () => {
        progress = { ...progress, step: 'round', currentRound: 1 }
        saveProgress(progress)
        rerender()
      })
      return
    }

    if (progress.step === 'round') {
      const round = projectRoundByNumber(progress.currentRound)
      if (!progress.startedAtByRound[round.roundNumber]) {
        progress.startedAtByRound[round.roundNumber] = nowMs()
        saveProgress(progress)
      }

      renderRound(root, progress, round, lastStorageError, async (choice) => {
        lastStorageError = null
        const startedAt = progress.startedAtByRound[round.roundNumber] ?? nowMs()
        const decisionTime = Math.max(0, nowMs() - startedAt)
        const chosen = optionById(round, choice)
        const aiRec = progress.groupType === 'AI' ? aiRecommendationForRound(round) : null
        const extreme = isExtremeEvent(round.roundNumber, chosen)

        const record: RoundDecisionRecord = {
          participant_id: progress.participantId,
          group_type: progress.groupType,
          round_number: round.roundNumber,
          chosen_option: choice,
          ai_recommendation: aiRec,
          follow_ai: Boolean(aiRec && aiRec === choice),
          risk_level: chosen.accident_risk_percent,
          decision_time: decisionTime,
          extreme_event: extreme,
        }

        const result = await store.writeRoundDecision(record)
        if (!result.ok) {
          lastStorageError = result.error
          rerender()
          return
        }

        const nextRound = round.roundNumber + 1
        if (nextRound <= 5) {
          progress = {
            ...progress,
            currentRound: nextRound,
            step: 'round',
          }
          saveProgress(progress)
          rerender()
          return
        }

        if (extreme) {
          progress = { ...progress, step: 'extreme', extremeTriggered: true }
        } else {
          progress = { ...progress, step: 'survey', extremeTriggered: false }
        }
        saveProgress(progress)
        rerender()
      })
      return
    }

    if (progress.step === 'extreme') {
      renderExtreme(root, () => {
        progress = { ...progress, step: 'survey' }
        saveProgress(progress)
        rerender()
      })
      return
    }

    if (progress.step === 'survey') {
      renderSurvey(root, lastStorageError, async (values) => {
        lastStorageError = null
        const record: PostSurveyRecord = {
          participant_id: progress.participantId,
          group_type: progress.groupType,
          trust_ai: values[0] ?? 1,
          safer_follow: values[1] ?? 1,
          more_professional: values[2] ?? 1,
          responsibility: values[3] ?? 1,
        }
        const result = await store.writePostSurvey(record)
        if (!result.ok) {
          lastStorageError = result.error
          rerender()
          return
        }
        progress = { ...progress, completed: true, step: 'end' }
        saveProgress(progress)
        renderEnd(root)
      })
      return
    }

    renderEnd(root)
  }

  rerender()
}
