export default defineEventHandler((event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }
  const ok = deleteDocument(id)
  if (!ok) {
    throw createError({ statusCode: 404, statusMessage: 'Документ не найден' })
  }
  return { ok: true }
})
