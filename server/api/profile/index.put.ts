import type { DoctorProfile } from '#shared/types/doctor'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<Partial<DoctorProfile>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Некорректное тело запроса' })
  }
  return saveProfile(body)
})
