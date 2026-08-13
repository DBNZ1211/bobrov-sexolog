import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'admin_session'
const MAX_AGE_SEC = 60 * 60 * 24 * 7

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    // Compare against self to keep roughly constant work on length mismatch
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export function createSessionToken(username: string, secret: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC
  const payload = `${username}.${exp}`
  const signature = sign(payload, secret)
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string | undefined, secret: string) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [username, expStr, signature] = parts
  const payload = `${username}.${expStr}`
  const expected = sign(payload, secret)
  if (!safeEqual(signature, expected)) return null
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null
  return { username }
}

export function setSessionCookie(event: Parameters<typeof setCookie>[0], token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SEC,
  })
}

export function clearSessionCookie(event: Parameters<typeof setCookie>[0]) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getSessionFromEvent(event: Parameters<typeof getCookie>[0]) {
  const config = useRuntimeConfig()
  const token = getCookie(event, COOKIE_NAME)
  return verifySessionToken(token, String(config.sessionSecret))
}

export function requireAdmin(event: Parameters<typeof getCookie>[0]) {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

export function checkCredentials(username: string, password: string) {
  const config = useRuntimeConfig()
  const expectedUser = String(config.adminUser)
  const expectedPass = String(config.adminPassword)
  if (!expectedPass) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ADMIN_PASSWORD is not configured',
    })
  }
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass)
}

export { COOKIE_NAME }
