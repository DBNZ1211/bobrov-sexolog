const rateMap = new Map<string, { count: number; reset: number }>()

export function assertRateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000,
) {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || entry.reset < now) {
    rateMap.set(key, { count: 1, reset: now + windowMs })
    return
  }
  entry.count += 1
  if (entry.count > limit) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Слишком много запросов. Попробуйте позже.',
    })
  }
}
