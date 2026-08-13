import { doctorSeed } from '#shared/doctorSeed'
import type { DoctorProfile } from '#shared/types/doctor'

/** Static seed / fallback. Runtime content comes from GET /api/profile. */
export const doctor = doctorSeed

export type Doctor = DoctorProfile
export type { DoctorProfile }
