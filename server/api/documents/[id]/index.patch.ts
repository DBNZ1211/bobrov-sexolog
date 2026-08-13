export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }

  const body = await readBody<{
    title?: string
    link_type?: string | null
    link_id?: string | null
    published?: boolean
    allow_open?: boolean
    sort_order?: number
  }>(event)

  const updated = updateDocument(id, body || {})
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Документ не найден' })
  }
  return { document: updated }
})
