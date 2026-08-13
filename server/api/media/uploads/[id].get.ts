import { createReadStream, statSync } from 'node:fs'
import { extname } from 'node:path'
import { sendStream } from 'h3'

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }

  const doc = getDocument(id)
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Не найдено' })
  }

  const session = getSessionFromEvent(event)
  if (!doc.published && !session) {
    throw createError({ statusCode: 404, statusMessage: 'Не найдено' })
  }

  const path = getDocumentFilePath(id, 'upload')
  if (!path) {
    throw createError({ statusCode: 404, statusMessage: 'Файл не найден' })
  }

  const ext = extname(path).toLowerCase()
  setHeader(event, 'Content-Type', MIME[ext] || doc.mime || 'application/octet-stream')
  setHeader(event, 'Content-Length', String(statSync(path).size))
  setHeader(
    event,
    'Content-Disposition',
    `inline; filename*=UTF-8''${encodeURIComponent(doc.original_name)}`,
  )
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return sendStream(event, createReadStream(path))
})
