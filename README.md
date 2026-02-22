# test-game

AI辅助工程建设项目审批决策模拟系统（在线实验版）。

## 功能概览

- 进入时随机分组：`AI` / `Control`（全程固定）
- 实验流程：知情同意 → 角色设定 → 5 轮项目审批决策 →（第 5 轮高风险触发事故反馈）→ 后测问卷 → 结束页
- 数据记录：每轮选择、AI建议（仅 AI 组显示）、是否跟随建议、风险水平、决策用时、是否触发极端事件
- 数据存储：优先写入 Supabase；未配置时自动落到浏览器 `localStorage`（便于本地开发）
- CSV 导出：提供命令行脚本从 Supabase 导出数据

## 本地运行（前端）

在 Windows PowerShell 下如果 `npm` 输出异常，可用 `npm.cmd`。

```bash
cd client
npm.cmd install
npm.cmd run dev
```

## Supabase 配置

1. 在 Supabase 创建项目后，将 [client/.env.example](client/.env.example) 复制为 `client/.env` 并填写：
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
2. 在 Supabase SQL Editor 执行建表脚本：
	- [client/supabase/schema.sql](client/supabase/schema.sql)

> 说明：`schema.sql` 里包含匿名写入（anon insert/update）的 RLS policy，便于在线实验快速落地。正式上线前可改为通过 Vercel Serverless / Supabase Edge Functions 代写入，以便更严格控制。

## CSV 导出（从 Supabase）

在 `client/.env` 中额外填写 `SUPABASE_SERVICE_ROLE_KEY`（仅用于导出脚本，切勿暴露在前端）。

```bash
cd client
npm.cmd run export:csv -- --table experiment_data --out experiment_data.csv
npm.cmd run export:csv -- --table post_survey --out post_survey.csv
```

## 部署到 Vercel

该项目是标准 Vite 静态站点：在 Vercel 里将 Root Directory 指向 `client/`，Build Command 用 `npm run build`，Output Directory 用 `dist/`，并在 Vercel 项目环境变量中配置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。