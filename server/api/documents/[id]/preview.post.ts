export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }

  const updated = await regenerateDocumentPreview(id)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Документ не найден' })
  }
  return { document: updated }
})
