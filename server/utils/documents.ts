import { randomUUID } from 'node:crypto'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import type { DocumentLinkType, SiteDocument } from '#shared/types/doctor'
import { getDb, getPreviewsDir, getUploadsDir } from './db'
import { generatePreview } from './preview'

const MAX_BYTES = 20 * 1024 * 1024

const ALLOWED: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
  '.odt': ['application/vnd.oasis.opendocument.text', 'application/octet-stream'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp'],
}

type DocumentRow = {
  id: string
  title: string
  original_name: string
  mime: string
  ext: string
  size: number
  file_path: string
  preview_path: string | null
  link_type: string
  link_id: string | null
  published: number
  allow_open: number
  sort_order: number
  created_at: string
}

function toPublic(row: DocumentRow): SiteDocument {
  return {
    id: row.id,
    title: row.title,
    original_name: row.original_name,
    mime: row.mime,
    ext: row.ext,
    size: Number(row.size),
    file_path: row.file_path,
    preview_path: row.preview_path,
    link_type: (row.link_type as DocumentLinkType) || 'none',
    link_id: row.link_id,
    published: Boolean(row.published),
    allow_open: row.allow_open === undefined || row.allow_open === null ? true : Boolean(row.allow_open),
    sort_order: Number(row.sort_order),
    created_at: row.created_at,
    file_url: `/api/media/uploads/${row.id}`,
    preview_url: row.preview_path ? `/api/media/previews/${row.id}` : null,
  }
}

export function listDocuments(opts: { publishedOnly?: boolean } = {}): SiteDocument[] {
  const database = getDb()
  const rows = (
    opts.publishedOnly
      ? database
          .prepare(
            `SELECT * FROM documents WHERE published = 1
             ORDER BY sort_order ASC, datetime(created_at) DESC`,
          )
          .all()
      : database
          .prepare(
            `SELECT * FROM documents
             ORDER BY sort_order ASC, datetime(created_at) DESC`,
          )
          .all()
  ) as DocumentRow[]
  return rows.map(toPublic)
}

export function getDocument(id: string): SiteDocument | null {
  const database = getDb()
  const row = database
    .prepare(`SELECT * FROM documents WHERE id = ?`)
    .get(id) as DocumentRow | undefined
  return row ? toPublic(row) : null
}

export function getDocumentFilePath(id: string, kind: 'upload' | 'preview'): string | null {
  const doc = getDocument(id)
  if (!doc) return null
  if (kind === 'upload') {
    const path = join(getUploadsDir(), basename(doc.file_path))
    return existsSync(path) ? path : null
  }
  if (!doc.preview_path) return null
  const path = join(getPreviewsDir(), basename(doc.preview_path))
  return existsSync(path) ? path : null
}

function normalizeLink(
  linkType?: string | null,
  linkId?: string | null,
): { link_type: DocumentLinkType; link_id: string | null } {
  const type = (linkType || 'none') as DocumentLinkType
  if (type !== 'education' && type !== 'qualification') {
    return { link_type: 'none', link_id: null }
  }
  if (!linkId) return { link_type: 'none', link_id: null }
  return { link_type: type, link_id: String(linkId) }
}

export async function createDocument(input: {
  title: string
  filename: string
  mime: string
  data: Buffer
  link_type?: string | null
  link_id?: string | null
  published?: boolean
  allow_open?: boolean
}): Promise<SiteDocument> {
  if (input.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Файл больше 20 МБ' })
  }

  const ext = extname(input.filename).toLowerCase()
  const allowedMimes = ALLOWED[ext]
  if (!allowedMimes) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Недопустимый тип файла',
    })
  }

  const mime = input.mime || allowedMimes[0]
  const id = randomUUID()
  const storedName = `${id}${ext}`
  const uploadsDir = getUploadsDir()
  const absolutePath = join(uploadsDir, storedName)
  writeFileSync(absolutePath, input.data)

  let previewRelative: string | null = null
  try {
    const previewName = await generatePreview({
      id,
      sourcePath: absolutePath,
      ext,
    })
    previewRelative = previewName
  } catch {
    previewRelative = null
  }

  const link = normalizeLink(input.link_type, input.link_id)
  const createdAt = new Date().toISOString()
  const database = getDb()
  const maxSort = database
    .prepare(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM documents`)
    .get() as { m: number }

  database
    .prepare(
      `INSERT INTO documents (
        id, title, original_name, mime, ext, size, file_path, preview_path,
        link_type, link_id, published, allow_open, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.title.trim() || input.filename,
      input.filename,
      mime,
      ext.replace('.', ''),
      input.data.length,
      storedName,
      previewRelative,
      link.link_type,
      link.link_id,
      input.published === false ? 0 : 1,
      input.allow_open === false ? 0 : 1,
      Number(maxSort.m) + 1,
      createdAt,
    )

  return getDocument(id)!
}

export function updateDocument(
  id: string,
  patch: {
    title?: string
    link_type?: string | null
    link_id?: string | null
    published?: boolean
    allow_open?: boolean
    sort_order?: number
  },
): SiteDocument | null {
  const existing = getDocument(id)
  if (!existing) return null

  const link =
    patch.link_type !== undefined || patch.link_id !== undefined
      ? normalizeLink(
          patch.link_type !== undefined ? patch.link_type : existing.link_type,
          patch.link_id !== undefined ? patch.link_id : existing.link_id,
        )
      : { link_type: existing.link_type, link_id: existing.link_id }

  const database = getDb()
  database
    .prepare(
      `UPDATE documents SET
        title = ?,
        link_type = ?,
        link_id = ?,
        published = ?,
        allow_open = ?,
        sort_order = ?
       WHERE id = ?`,
    )
    .run(
      patch.title !== undefined ? String(patch.title).trim() || existing.title : existing.title,
      link.link_type,
      link.link_id,
      patch.published !== undefined ? (patch.published ? 1 : 0) : existing.published ? 1 : 0,
      patch.allow_open !== undefined ? (patch.allow_open ? 1 : 0) : existing.allow_open ? 1 : 0,
      patch.sort_order !== undefined ? Number(patch.sort_order) : existing.sort_order,
      id,
    )

  return getDocument(id)
}

export async function regenerateDocumentPreview(id: string): Promise<SiteDocument | null> {
  const existing = getDocument(id)
  if (!existing) return null

  const sourcePath = join(getUploadsDir(), basename(existing.file_path))
  if (!existsSync(sourcePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Файл не найден' })
  }

  const previewName = await generatePreview({
    id,
    sourcePath,
    ext: `.${existing.ext}`,
  })

  const database = getDb()
  database.prepare(`UPDATE documents SET preview_path = ? WHERE id = ?`).run(previewName, id)
  return getDocument(id)
}

export function deleteDocument(id: string): boolean {
  const existing = getDocument(id)
  if (!existing) return false

  const database = getDb()
  database.prepare(`DELETE FROM documents WHERE id = ?`).run(id)

  const uploadPath = join(getUploadsDir(), basename(existing.file_path))
  if (existsSync(uploadPath)) {
    try {
      unlinkSync(uploadPath)
    } catch {
      /* ignore */
    }
  }
  if (existing.preview_path) {
    const previewPath = join(getPreviewsDir(), basename(existing.preview_path))
    if (existsSync(previewPath)) {
      try {
        unlinkSync(previewPath)
      } catch {
        /* ignore */
      }
    }
  }
  return true
}

export { MAX_BYTES, ALLOWED }
