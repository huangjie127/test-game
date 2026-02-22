const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// Database initialisation (built-in node:sqlite, available since Node v22)
// ---------------------------------------------------------------------------
const db = new DatabaseSync(path.join(__dirname, 'experiment.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS experiment_data (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id   TEXT    NOT NULL,
    group_type       TEXT    NOT NULL,
    round_number     INTEGER,
    chosen_option    TEXT,
    ai_recommendation TEXT,
    follow_ai        INTEGER,
    risk_level       REAL,
    decision_time    REAL,
    extreme_event    INTEGER,
    created_at       TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS survey_data (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id TEXT    NOT NULL,
    group_type     TEXT    NOT NULL,
    q1             INTEGER,
    q2             INTEGER,
    q3             INTEGER,
    q4             INTEGER,
    created_at     TEXT    DEFAULT (datetime('now'))
  );
`);

// ---------------------------------------------------------------------------
// Experiment content – 5 rounds, 4 options each
// AI recommendation for rounds 1-4: medium-high benefit, medium risk
// Round 5 contains a high-risk option (risk > 10%) that triggers extreme event
// ---------------------------------------------------------------------------
const ROUNDS = [
  {
    id: 1,
    title: '城市地下综合管廊建设项目',
    description:
      '该项目计划在城市核心区新建地下综合管廊，涵盖电力、通信、供水、燃气等多类管线集中敷设，全长约12公里。',
    options: [
      { id: 'A', cost: 5200, risk: 4,  benefit: 78, period: 20 },
      { id: 'B', cost: 4800, risk: 6,  benefit: 88, period: 16 },
      { id: 'C', cost: 6500, risk: 2,  benefit: 72, period: 28 },
      { id: 'D', cost: 4200, risk: 9,  benefit: 83, period: 14 }
    ],
    ai_recommendation: 'B'
  },
  {
    id: 2,
    title: '市区跨江大桥改扩建项目',
    description:
      '对现有跨江大桥进行拓宽改造，提升通行能力，改善城市交通瓶颈问题，预计日均通行量提升40%。',
    options: [
      { id: 'A', cost: 3800, risk: 8,  benefit: 79, period: 12 },
      { id: 'B', cost: 5500, risk: 3,  benefit: 75, period: 22 },
      { id: 'C', cost: 4600, risk: 6,  benefit: 90, period: 17 },
      { id: 'D', cost: 7000, risk: 1,  benefit: 70, period: 30 }
    ],
    ai_recommendation: 'C'
  },
  {
    id: 3,
    title: '城市轨道交通延伸线建设项目',
    description:
      '在现有地铁线网基础上，向城市东部新区延伸建设轻轨交通线路约8公里，缓解区域出行压力。',
    options: [
      { id: 'A', cost: 5100, risk: 5,  benefit: 87, period: 18 },
      { id: 'B', cost: 6200, risk: 2,  benefit: 74, period: 26 },
      { id: 'C', cost: 4300, risk: 10, benefit: 85, period: 13 },
      { id: 'D', cost: 4900, risk: 7,  benefit: 80, period: 15 }
    ],
    ai_recommendation: 'A'
  },
  {
    id: 4,
    title: '城市污水处理厂升级改造项目',
    description:
      '对主城区污水处理厂进行技术升级改造，提升日处理能力至30万吨，达到一级A排放标准。',
    options: [
      { id: 'A', cost: 5800, risk: 3,  benefit: 77, period: 24 },
      { id: 'B', cost: 4700, risk: 9,  benefit: 82, period: 15 },
      { id: 'C', cost: 5300, risk: 6,  benefit: 91, period: 18 },
      { id: 'D', cost: 6800, risk: 1,  benefit: 71, period: 32 }
    ],
    ai_recommendation: 'C'
  },
  {
    id: 5,
    title: '城市新区综合开发建设项目',
    description:
      '在城市东南新区启动综合开发建设，涵盖主干道路、市政管网、公共服务设施等基础配套工程，总建设面积约6平方公里。',
    options: [
      { id: 'A', cost: 4900, risk: 5,  benefit: 83, period: 17 },
      { id: 'B', cost: 5600, risk: 3,  benefit: 77, period: 22 },
      { id: 'C', cost: 4200, risk: 13, benefit: 95, period: 11 },
      { id: 'D', cost: 5100, risk: 7,  benefit: 86, period: 19 }
    ],
    ai_recommendation: 'D'
  }
];

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// Start a new session – assign participant_id and random group
app.post('/api/start', (req, res) => {
  const participant_id = uuidv4();
  const group_type = Math.random() < 0.5 ? 'AI' : 'Control';
  res.json({ participant_id, group_type });
});

// Return experiment round definitions (options shuffled per request)
app.get('/api/rounds', (req, res) => {
  res.json(ROUNDS);
});

// Record one round decision
app.post('/api/record', (req, res) => {
  try {
    const {
      participant_id, group_type, round_number,
      chosen_option, ai_recommendation, follow_ai,
      risk_level, decision_time, extreme_event
    } = req.body;

    if (!participant_id || !group_type || round_number === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO experiment_data
        (participant_id, group_type, round_number, chosen_option,
         ai_recommendation, follow_ai, risk_level, decision_time, extreme_event)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      participant_id, group_type, round_number,
      chosen_option, ai_recommendation ?? null,
      follow_ai ? 1 : 0, risk_level, decision_time,
      extreme_event ? 1 : 0
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record post-experiment survey
app.post('/api/survey', (req, res) => {
  try {
    const { participant_id, group_type, q1, q2, q3, q4 } = req.body;

    if (!participant_id || !group_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO survey_data (participant_id, group_type, q1, q2, q3, q4)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(participant_id, group_type, q1, q2, q3, q4);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export all data as CSV (UTF-8 with BOM for Excel compatibility)
app.get('/api/export', (req, res) => {
  try {
    const expRows = db.prepare(
      'SELECT * FROM experiment_data ORDER BY participant_id, round_number'
    ).all();
    const surveyRows = db.prepare(
      'SELECT * FROM survey_data ORDER BY participant_id'
    ).all();

    const expHeaders = [
      'id', 'participant_id', 'group_type', 'round_number',
      'chosen_option', 'ai_recommendation', 'follow_ai',
      'risk_level', 'decision_time', 'extreme_event', 'created_at'
    ];
    const surveyHeaders = [
      'id', 'participant_id', 'group_type',
      'q1', 'q2', 'q3', 'q4', 'created_at'
    ];

    // RFC 4180-compliant CSV escaping: always quote, double internal quotes
    const csvEscape = (val) => '"' + String(val ?? '').replace(/"/g, '""') + '"';
    const toCSVRow = (headers, row) =>
      headers.map(h => csvEscape(row[h])).join(',');

    let csv = '# experiment_data\n';
    csv += expHeaders.join(',') + '\n';
    expRows.forEach(r => { csv += toCSVRow(expHeaders, r) + '\n'; });

    csv += '\n# survey_data\n';
    csv += surveyHeaders.join(',') + '\n';
    surveyRows.forEach(r => { csv += toCSVRow(surveyHeaders, r) + '\n'; });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="experiment_data.csv"');
    res.send('\ufeff' + csv); // UTF-8 BOM
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Basic statistics (for admin page)
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare(
      'SELECT COUNT(DISTINCT participant_id) as count FROM experiment_data'
    ).get();
    const byGroup = db.prepare(
      'SELECT group_type, COUNT(DISTINCT participant_id) as count FROM experiment_data GROUP BY group_type'
    ).all();
    const extremeEvents = db.prepare(
      'SELECT COUNT(*) as count FROM experiment_data WHERE extreme_event = 1'
    ).get();
    const aiFollow = db.prepare(`
      SELECT
        SUM(follow_ai) as followed,
        COUNT(*) as total
      FROM experiment_data
      WHERE group_type = 'AI' AND round_number BETWEEN 1 AND 5
    `).get();

    res.json({
      total_participants: total.count,
      by_group: byGroup,
      extreme_events: extremeEvents.count,
      ai_follow_rate: aiFollow.total > 0
        ? (aiFollow.followed / aiFollow.total).toFixed(3)
        : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Experiment server running at http://localhost:${PORT}`);
  console.log(`Admin export: http://localhost:${PORT}/api/export`);
  console.log(`Admin stats:  http://localhost:${PORT}/api/stats`);
});
