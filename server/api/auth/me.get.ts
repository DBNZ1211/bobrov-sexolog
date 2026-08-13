export default defineEventHandler((event) => {
  const session = getSessionFromEvent(event)
  return { authenticated: Boolean(session), username: session?.username || null }
})
