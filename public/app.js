/* ============================================================
   AI-Assisted Engineering Approval Decision Simulation System
   Frontend Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const state = {
    participantId: null,
    groupType: null,       // 'AI' | 'Control'
    rounds: [],            // from server
    currentRound: 0,       // 0-indexed
    decisions: [],         // recorded decisions
    roundStartTime: null,  // timestamp when current round started
    timerInterval: null,
    shuffledOptions: [],   // options in display order for current round
    selectedOption: null,  // currently selected option id
    surveyAnswers: {},     // q1..q4
    extremeEventTriggered: false
  };

  // ------------------------------------------------------------------
  // Utility helpers
  // ------------------------------------------------------------------
  function $(id) { return document.getElementById(id); }

  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) {
      page.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function setLoading(visible) {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.toggle('visible', visible);
  }

  /** Shuffle array in place (Fisher-Yates) */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function riskClass(risk) {
    if (risk < 5) return 'risk-low';
    if (risk <= 10) return 'risk-mid';
    return 'risk-high';
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatElapsed(ms) {
    const s = Math.floor(ms / 1000);
    return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
  }

  // ------------------------------------------------------------------
  // API helpers
  // ------------------------------------------------------------------
  async function apiPost(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Network error');
    }
    return res.json();
  }

  async function apiGet(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }

  // ------------------------------------------------------------------
  // Timer
  // ------------------------------------------------------------------
  function startTimer() {
    state.roundStartTime = Date.now();
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      const el = $('timer-display');
      if (el) el.textContent = formatElapsed(Date.now() - state.roundStartTime);
    }, 500);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  function getDecisionTime() {
    return state.roundStartTime ? Date.now() - state.roundStartTime : 0;
  }

  // ------------------------------------------------------------------
  // Prevent accidental navigation away during experiment
  // ------------------------------------------------------------------
  function lockNavigation() {
    window.addEventListener('beforeunload', e => {
      e.preventDefault();
      e.returnValue = '';
    });
  }

  // ------------------------------------------------------------------
  // Page: Consent
  // ------------------------------------------------------------------
  function initConsentPage() {
    const check = $('consent-check');
    const btn = $('btn-consent');
    check.addEventListener('change', () => {
      btn.disabled = !check.checked;
    });
    btn.addEventListener('click', startExperiment);
  }

  async function startExperiment() {
    // Prevent duplicate submissions via localStorage
    if (localStorage.getItem('exp_completed') === 'true') {
      alert('您已参与过本实验，每人只能参与一次。感谢您的支持！');
      return;
    }

    setLoading(true);
    try {
      const [session, rounds] = await Promise.all([
        apiPost('/api/start', {}),
        apiGet('/api/rounds')
      ]);

      state.participantId = session.participant_id;
      state.groupType = session.group_type;
      state.rounds = rounds;

      lockNavigation();
      showPage('role');
    } catch (e) {
      alert('连接服务器失败，请刷新页面重试。');
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------------
  // Page: Role
  // ------------------------------------------------------------------
  function initRolePage() {
    $('btn-start-rounds').addEventListener('click', () => {
      state.currentRound = 0;
      renderRound();
      showPage('round');
    });
  }

  // ------------------------------------------------------------------
  // Page: Round
  // ------------------------------------------------------------------
  function renderRound() {
    const round = state.rounds[state.currentRound];
    const roundNum = state.currentRound + 1;

    // Header
    $('round-num').textContent = roundNum;
    $('progress-fill').style.width = (roundNum / 5 * 100) + '%';
    $('timer-display').textContent = '00:00';

    // Project info
    $('project-title').textContent = round.title;
    $('project-desc').textContent = round.description;

    // AI recommendation
    const aiBox = $('ai-recommendation');
    if (state.groupType === 'AI') {
      aiBox.classList.remove('hidden');
      $('ai-rec-option').textContent = round.ai_recommendation;
    } else {
      aiBox.classList.add('hidden');
    }

    // Shuffle options for display
    state.shuffledOptions = shuffle([...round.options]);
    state.selectedOption = null;
    $('btn-submit-round').disabled = true;

    // Build option cards
    const container = $('options-container');
    container.innerHTML = '';
    state.shuffledOptions.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.dataset.id = opt.id;
      card.innerHTML = `
        <span class="selected-badge">✓ 已选</span>
        <div class="option-label">方案 ${opt.id}</div>
        <ul class="option-metrics">
          <li><span class="metric-name">💰 预算成本</span><span class="metric-val">${opt.cost.toLocaleString()} 万元</span></li>
          <li><span class="metric-name">⚠️ 事故风险</span><span class="metric-val ${riskClass(opt.risk)}">${opt.risk}%</span></li>
          <li><span class="metric-name">📈 经济收益指数</span><span class="metric-val">${opt.benefit}</span></li>
          <li><span class="metric-name">📅 预计工期</span><span class="metric-val">${opt.period} 个月</span></li>
        </ul>
      `;
      card.addEventListener('click', () => selectOption(card, opt.id));
      container.appendChild(card);
    });

    startTimer();
  }

  function selectOption(card, optionId) {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.selectedOption = optionId;
    $('btn-submit-round').disabled = false;
  }

  function initRoundPage() {
    $('btn-submit-round').addEventListener('click', submitRound);
  }

  async function submitRound() {
    if (!state.selectedOption) return;

    stopTimer();
    const decisionTime = getDecisionTime();
    const round = state.rounds[state.currentRound];
    const chosenOpt = round.options.find(o => o.id === state.selectedOption);
    const riskLevel = chosenOpt.risk;
    const isAiRec = state.groupType === 'AI' && state.selectedOption === round.ai_recommendation;
    const isExtremeRound = (state.currentRound + 1) === 5;
    const extreme = isExtremeRound && riskLevel > 10;

    if (extreme) state.extremeEventTriggered = true;

    // Record to server
    setLoading(true);
    try {
      await apiPost('/api/record', {
        participant_id: state.participantId,
        group_type: state.groupType,
        round_number: state.currentRound + 1,
        chosen_option: state.selectedOption,
        ai_recommendation: state.groupType === 'AI' ? round.ai_recommendation : null,
        follow_ai: isAiRec,
        risk_level: riskLevel,
        decision_time: decisionTime,
        extreme_event: extreme
      });
    } catch (e) {
      // Non-fatal – continue
    } finally {
      setLoading(false);
    }

    state.currentRound++;

    if (extreme) {
      showPage('extreme');
    } else if (state.currentRound >= state.rounds.length) {
      showPage('survey');
    } else {
      renderRound();
      showPage('round');
    }
  }

  // ------------------------------------------------------------------
  // Page: Extreme event
  // ------------------------------------------------------------------
  function initExtremePage() {
    $('btn-after-extreme').addEventListener('click', () => {
      if (state.currentRound >= state.rounds.length) {
        showPage('survey');
      } else {
        renderRound();
        showPage('round');
      }
    });
  }

  // ------------------------------------------------------------------
  // Page: Survey
  // ------------------------------------------------------------------
  function initSurveyPage() {
    // Likert button interaction
    document.querySelectorAll('.likert-scale').forEach(scale => {
      scale.querySelectorAll('.likert-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          scale.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.surveyAnswers[scale.dataset.q] = parseInt(btn.dataset.val, 10);
          checkSurveyComplete();
        });
      });
    });

    $('btn-submit-survey').addEventListener('click', submitSurvey);
  }

  function checkSurveyComplete() {
    const answered = ['q1', 'q2', 'q3', 'q4'].every(q => state.surveyAnswers[q] !== undefined);
    $('btn-submit-survey').disabled = !answered;
  }

  async function submitSurvey() {
    setLoading(true);
    try {
      await apiPost('/api/survey', {
        participant_id: state.participantId,
        group_type: state.groupType,
        q1: state.surveyAnswers.q1,
        q2: state.surveyAnswers.q2,
        q3: state.surveyAnswers.q3,
        q4: state.surveyAnswers.q4
      });
      localStorage.setItem('exp_completed', 'true');
      showPage('end');
    } catch (e) {
      alert('提交失败，请重试。');
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------------
  // Add loading overlay to DOM
  // ------------------------------------------------------------------
  function addLoadingOverlay() {
    const div = document.createElement('div');
    div.id = 'loading-overlay';
    div.innerHTML = '<span>处理中，请稍候…</span>';
    document.body.appendChild(div);
  }

  // ------------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    addLoadingOverlay();
    initConsentPage();
    initRolePage();
    initRoundPage();
    initExtremePage();
    initSurveyPage();
    showPage('consent');
  });

}());
