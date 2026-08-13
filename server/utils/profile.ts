import { randomUUID } from 'node:crypto'
import { doctorSeed } from '#shared/doctorSeed'
import type {
  ClinicItem,
  DoctorProfile,
  EducationItem,
  ExperienceItem,
  QualificationItem,
} from '#shared/types/doctor'
import { getDb } from './db'

function ensureIds<T extends { id?: string }>(items: T[]): (T & { id: string })[] {
  return items.map((item) => ({
    ...item,
    id: item.id || randomUUID(),
  }))
}

export function normalizeProfile(raw: Partial<DoctorProfile>): DoctorProfile {
  const base = structuredClone(doctorSeed)
  return {
    ...base,
    ...raw,
    specialties: Array.isArray(raw.specialties) ? raw.specialties.map(String) : base.specialties,
    manipulations: Array.isArray(raw.manipulations)
      ? raw.manipulations.map(String)
      : base.manipulations,
    surgeries: Array.isArray(raw.surgeries) ? raw.surgeries.map(String) : base.surgeries,
    experience: ensureIds(
      (Array.isArray(raw.experience) ? raw.experience : base.experience) as ExperienceItem[],
    ),
    education: ensureIds(
      (Array.isArray(raw.education) ? raw.education : base.education) as EducationItem[],
    ),
    qualifications: ensureIds(
      (Array.isArray(raw.qualifications)
        ? raw.qualifications
        : base.qualifications) as QualificationItem[],
    ),
    clinics: ensureIds(
      (Array.isArray(raw.clinics) ? raw.clinics : base.clinics) as ClinicItem[],
    ),
    experienceYears: Number(raw.experienceYears ?? base.experienceYears) || 0,
    priceFrom: Number(raw.priceFrom ?? base.priceFrom) || 0,
    fullName: String(raw.fullName ?? base.fullName),
    shortName: String(raw.shortName ?? base.shortName),
    title: String(raw.title ?? base.title),
    subtitle: String(raw.subtitle ?? base.subtitle),
    city: String(raw.city ?? base.city),
    phone: String(raw.phone ?? base.phone),
    phoneHref: String(raw.phoneHref ?? base.phoneHref),
    photo: String(raw.photo ?? base.photo),
    domain: String(raw.domain ?? base.domain),
    reviewsHint: String(raw.reviewsHint ?? base.reviewsHint),
    about: String(raw.about ?? base.about),
    helpIntro: String(raw.helpIntro ?? base.helpIntro),
  }
}

export function getProfile(): DoctorProfile {
  const database = getDb()
  const row = database
    .prepare(`SELECT data FROM profile WHERE id = 1`)
    .get() as { data: string } | undefined

  if (!row) {
    const seeded = normalizeProfile(doctorSeed)
    saveProfile(seeded)
    return seeded
  }

  try {
    return normalizeProfile(JSON.parse(row.data) as Partial<DoctorProfile>)
  } catch {
    const seeded = normalizeProfile(doctorSeed)
    saveProfile(seeded)
    return seeded
  }
}

export function saveProfile(input: Partial<DoctorProfile>): DoctorProfile {
  const profile = normalizeProfile(input)
  const database = getDb()
  const updatedAt = new Date().toISOString()
  database
    .prepare(
      `INSERT INTO profile (id, data, updated_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(JSON.stringify(profile), updatedAt)
  return profile
}
