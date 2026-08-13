export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const body = await readBody<{ status?: string }>(event)
  const status = body?.status
  if (status !== 'new' && status !== 'done') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const ok = updateLeadStatus(id, status)
  if (!ok) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }
  return { ok: true }
})
