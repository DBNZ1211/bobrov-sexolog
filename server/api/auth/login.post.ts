export default defineEventHandler(async (event) => {
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'unknown'
  assertRateLimit(`login:${ip}`, 10, 60_000)

  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = String(body?.username || '')
  const password = String(body?.password || '')

  if (!checkCredentials(username, password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Неверный логин или пароль',
    })
  }

  const config = useRuntimeConfig()
  const token = createSessionToken(username, String(config.sessionSecret))
  setSessionCookie(event, token)
  return { ok: true }
})
