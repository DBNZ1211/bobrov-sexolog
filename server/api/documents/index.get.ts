export default defineEventHandler((event) => {
  const session = getSessionFromEvent(event)
  if (session) {
    return { documents: listDocuments({ publishedOnly: false }) }
  }
  return { documents: listDocuments({ publishedOnly: true }) }
})
