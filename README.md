# AI辅助工程建设项目审批决策模拟系统

在线实验网页系统，用于研究 AI 建议对公共工程审批决策行为的影响。

## 系统功能

- 随机分组实验（AI 建议组 / 对照组）
- 5 轮工程项目审批决策，每轮 4 个备选方案
- AI 建议机制（实验组专属）
- 极端风险事件触发（第 5 轮高风险选择）
- 后测问卷（Likert 1–5 量表）
- 数据实时写入 SQLite 数据库
- CSV 数据导出

## 快速启动

```bash
npm install
npm start
```

默认运行在 `http://localhost:3000`

环境变量 `PORT` 可自定义端口号。

## 管理功能

| 地址 | 说明 |
|---|---|
| `http://localhost:3000/admin.html` | 管理员后台（统计 + 导出）|
| `http://localhost:3000/api/export` | 下载 CSV 数据文件 |
| `http://localhost:3000/api/stats` | 实验统计 JSON |

## 数据库结构

**experiment_data** 表：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 自增主键 |
| participant_id | TEXT | 参与者唯一 UUID |
| group_type | TEXT | AI / Control |
| round_number | INTEGER | 轮次（1-5）|
| chosen_option | TEXT | 选择方案（A/B/C/D）|
| ai_recommendation | TEXT | AI 推荐方案（AI 组）|
| follow_ai | INTEGER | 是否跟随 AI 建议（0/1）|
| risk_level | REAL | 选择方案的风险值（%）|
| decision_time | REAL | 决策用时（毫秒）|
| extreme_event | INTEGER | 是否触发极端事故（0/1）|
| created_at | TEXT | 记录时间 |

**survey_data** 表：participant_id, group_type, q1–q4（Likert 1–5）

## 技术栈

- **后端**: Node.js 22+ / Express / `node:sqlite`（内置模块，无需编译）
- **前端**: 原生 HTML / CSS / JavaScript（单页应用）
- **数据库**: SQLite（文件 `experiment.db`）

## 系统要求

- Node.js v22 及以上（使用内置 SQLite 模块）
