export interface ExperienceItem {
  id: string
  role: string
  place: string
  period: string
  city: string
}

export interface EducationItem {
  id: string
  year: string
  title: string
  place: string
}

export interface QualificationItem {
  id: string
  year: string
  title: string
  place: string
}

export interface ClinicItem {
  id: string
  name: string
  address: string
  phone: string
  note: string
}

export interface DoctorProfile {
  fullName: string
  shortName: string
  title: string
  subtitle: string
  specialties: string[]
  city: string
  experienceYears: number
  priceFrom: number
  phone: string
  phoneHref: string
  photo: string
  domain: string
  reviewsHint: string
  about: string
  helpIntro: string
  manipulations: string[]
  surgeries: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  qualifications: QualificationItem[]
  clinics: ClinicItem[]
}

export type DocumentLinkType = 'none' | 'education' | 'qualification'

export interface SiteDocument {
  id: string
  title: string
  original_name: string
  mime: string
  ext: string
  size: number
  file_path: string
  preview_path: string | null
  link_type: DocumentLinkType
  link_id: string | null
  published: boolean
  /** When false, public users cannot open/download the original file */
  allow_open: boolean
  sort_order: number
  created_at: string
  /** Public URLs for clients */
  file_url: string
  preview_url: string | null
}
