export default defineEventHandler(async (event) => {
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'unknown'
  assertRateLimit(`lead:${ip}`, 6, 60_000)

  const body = await readBody<{
    name?: string
    phone?: string
    comment?: string
  }>(event)

  const name = String(body?.name || '').trim()
  const phone = String(body?.phone || '').trim()
  const comment = String(body?.comment || '').trim()

  if (name.length < 2 || name.length > 120) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Укажите имя (от 2 до 120 символов)',
    })
  }

  const phoneDigits = phone.replace(/\D/g, '')
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Укажите корректный телефон',
    })
  }

  if (comment.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Комментарий слишком длинный',
    })
  }

  const lead = createLead({ name, phone, comment })
  return { ok: true, id: lead.id }
})
