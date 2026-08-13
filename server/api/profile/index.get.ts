import type { DoctorProfile } from '#shared/types/doctor'

export default defineEventHandler(() => {
  return getProfile() as DoctorProfile
})
