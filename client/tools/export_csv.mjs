import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function argValue(name) {
  const idx = process.argv.indexOf(name)
  if (idx < 0) return null
  return process.argv[idx + 1] ?? null
}

function escapeCsvCell(value) {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows) {
  const headers = Array.from(
    rows.reduce((set, row) => {
      for (const k of Object.keys(row)) set.add(k)
      return set
    }, new Set()),
  )
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(','))
  }
  return lines.join('\n')
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) {
    console.error('Missing env: VITE_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const out = argValue('--out') ?? 'export.csv'
  const table = argValue('--table') ?? 'experiment_data'

  const client = createClient(url, serviceRole)
  const { data, error } = await client.from(table).select('*')
  if (error) {
    console.error(error)
    process.exit(1)
  }

  const csv = toCsv(data ?? [])
  const outPath = path.resolve(__dirname, '..', out)
  fs.writeFileSync(outPath, csv, 'utf8')
  console.log(`Wrote ${data?.length ?? 0} rows to ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
