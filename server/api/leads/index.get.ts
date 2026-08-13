export default defineEventHandler((event) => {
  requireAdmin(event)
  return { leads: listLeads() }
})
