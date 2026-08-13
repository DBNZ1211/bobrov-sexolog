import type { DoctorProfile } from '#shared/types/doctor'
import { doctorSeed } from '#shared/doctorSeed'

/**
 * SSR-friendly doctor profile from API, with static seed as fallback.
 */
export function useDoctor() {
  const { data, pending, error, refresh } = useFetch<DoctorProfile>('/api/profile', {
    key: 'doctor-profile',
    default: () => doctorSeed,
  })

  const doctor = computed(() => data.value || doctorSeed)

  return { doctor, pending, error, refresh }
}
