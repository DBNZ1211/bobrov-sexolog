import { DatabaseSync } from 'node:sqlite'
import { existsSync, mkdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'

export type LeadStatus = 'new' | 'done'

export interface Lead {
  id: number
  name: string
  phone: string
  comment: string
  status: LeadStatus
  created_at: string
}

let db: DatabaseSync | null = null

export function getDataDir() {
  const config = useRuntimeConfig()
  const dir = String(config.dataDir || './data')
  mkdirSync(dir, { recursive: true })
  return dir
}

export function getUploadsDir() {
  const dir = join(getDataDir(), 'uploads')
  mkdirSync(dir, { recursive: true })
  return dir
}

export function getPreviewsDir() {
  const dir = join(getDataDir(), 'previews')
  mkdirSync(dir, { recursive: true })
  return dir
}

function getDbPath() {
  const dir = getDataDir()
  const sitePath = join(dir, 'site.db')
  const legacyPath = join(dir, 'leads.db')
  if (!existsSync(sitePath) && existsSync(legacyPath)) {
    renameSync(legacyPath, sitePath)
  }
  return sitePath
}

export function getDb() {
  if (db) return db
  db = new DatabaseSync(getDbPath())
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime TEXT NOT NULL,
      ext TEXT NOT NULL,
      size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      preview_path TEXT,
      link_type TEXT NOT NULL DEFAULT 'none',
      link_id TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)
  getUploadsDir()
  getPreviewsDir()
  return db
}

export function createLead(input: {
  name: string
  phone: string
  comment?: string
}) {
  const database = getDb()
  const createdAt = new Date().toISOString()
  const result = database
    .prepare(
      `INSERT INTO leads (name, phone, comment, status, created_at)
       VALUES (?, ?, ?, 'new', ?)`,
    )
    .run(input.name, input.phone, input.comment || '', createdAt)

  return {
    id: Number(result.lastInsertRowid),
    name: input.name,
    phone: input.phone,
    comment: input.comment || '',
    status: 'new' as const,
    created_at: createdAt,
  }
}

export function listLeads(): Lead[] {
  const database = getDb()
  return database
    .prepare(
      `SELECT id, name, phone, comment, status, created_at
       FROM leads
       ORDER BY datetime(created_at) DESC`,
    )
    .all() as Lead[]
}

export function updateLeadStatus(id: number, status: LeadStatus) {
  const database = getDb()
  const result = database
    .prepare(`UPDATE leads SET status = ? WHERE id = ?`)
    .run(status, id)
  return result.changes > 0
}
