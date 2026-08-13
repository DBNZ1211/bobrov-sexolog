import { createReadStream, statSync } from 'node:fs'
import { sendStream } from 'h3'

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

  const path = getDocumentFilePath(id, 'preview')
  if (!path) {
    throw createError({ statusCode: 404, statusMessage: 'Превью не найдено' })
  }

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Content-Length', String(statSync(path).size))
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return sendStream(event, createReadStream(path))
})
