# AI辅助工程建设项目审批决策模拟系统

## 项目概述

本系统是一个在线实验网页系统，用于研究在公共工程建设项目审批情境中，AI建议是否会影响个体决策独立性与群体决策分布结构。

**注意：** 该系统仅用于学术研究数据采集，不用于真实审批场景。

## 实验设计

### 实验类型
- 随机分组实验（Between-subject design）
- 单一自变量：是否显示AI建议

### 实验分组
- **实验组（AI组）**：显示AI建议
- **对照组（Control组）**：不显示AI建议

### 实验流程
1. 知情同意页
2. 角色设定页
3. 5轮工程项目审批决策
4. 极端风险触发反馈（第5轮可能发生）
5. 后测问卷
6. 实验结束页

预计总时长：8-12分钟

## 系统功能

### 核心功能
- ✅ 随机分组（AI组/对照组）
- ✅ 5轮决策任务（每轮4个备选方案）
- ✅ AI建议显示（仅实验组）
- ✅ 极端风险触发机制（第5轮，风险>10%）
- ✅ 后测问卷（Likert 1-5量表）
- ✅ 实时数据存储
- ✅ CSV数据导出

### 数据记录
每位参与者记录：
- `participant_id`：唯一UUID
- `group_type`：AI/Control
- `round_number`：轮次（1-5）
- `chosen_option`：选择的方案
- `ai_recommendation`：AI推荐方案
- `follow_ai`：是否跟随AI建议
- `risk_level`：选择方案的风险等级
- `decision_time`：决策时间（毫秒）
- `extreme_event`：是否触发极端事件

### 问卷数据
- `q1_trust`：信任系统建议
- `q2_safer`：跟随建议更安全
- `q3_professional`：系统更专业
- `q4_responsibility`：事故责任归属

## 快速开始

### 本地运行
1. 克隆或下载项目文件
2. 使用任意Web服务器打开 `index.html`
3. 或直接在浏览器中打开 `index.html`

```bash
# 使用Python启动简单服务器
python -m http.server 8080

# 或使用Node.js
npx serve
```

### 配置云数据库（Supabase）

1. 访问 [Supabase](https://supabase.com) 创建免费账户
2. 创建新项目
3. 在SQL编辑器中执行以下SQL创建数据表：

```sql
CREATE TABLE experiment_data (
  id SERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL,
  group_type TEXT NOT NULL,
  round_number INTEGER,
  chosen_option TEXT,
  ai_recommendation TEXT,
  follow_ai BOOLEAN,
  risk_level FLOAT,
  decision_time FLOAT,
  extreme_event BOOLEAN,
  q1_trust INTEGER,
  q2_safer INTEGER,
  q3_professional INTEGER,
  q4_responsibility INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 启用行级安全
ALTER TABLE experiment_data ENABLE ROW LEVEL SECURITY;

-- 允许匿名插入
CREATE POLICY "Allow anonymous inserts" ON experiment_data
  FOR INSERT WITH CHECK (true);

-- 允许读取（用于导出）
CREATE POLICY "Allow reads" ON experiment_data
  FOR SELECT USING (true);
```

4. 在项目设置 > API 中找到 URL 和 anon key
5. 编辑 `config.js`，替换以下值：

```javascript
SUPABASE_URL: 'your-project-url',
SUPABASE_ANON_KEY: 'your-anon-key'
```

### 数据导出

按 `Ctrl+Shift+A` 打开管理面板，点击"导出CSV数据"按钮。

## 文件结构

```
├── index.html      # 主页面
├── styles.css      # 样式文件
├── config.js       # 配置文件（数据库连接）
├── data.js         # 实验数据（5个项目方案）
├── app.js          # 主应用逻辑
└── README.md       # 说明文档
```

## 研究假设支持

本系统设计支持以下研究假设检验：

- **H1**：AI组决策趋同度高于Control组
- **H2**：AI组更高概率选择中高风险方案
- **H3**：极端风险事件在AI组中更集中
- **H4**：AI组信任度显著高于Control组

## 伦理要求

- ✅ 匿名数据收集
- ✅ 可中途退出
- ✅ 明确研究用途说明
- ✅ 不收集真实身份信息

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Supabase (PostgreSQL云数据库)

## 许可证

本项目仅供学术研究使用。