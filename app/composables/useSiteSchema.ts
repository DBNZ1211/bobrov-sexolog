export function useSiteSchema() {
  const { doctor } = useDoctor()
  const config = useRuntimeConfig()
  const siteUrl = computed(() => String(config.public.siteUrl || 'https://bobrov-sexolog.ru').replace(/\/$/, ''))
  const phone = computed(() => config.public.phone || doctor.value.phone)

  const clinics = computed(() =>
    doctor.value.clinics.map((clinic) => ({
      '@type': 'MedicalClinic' as const,
      name: clinic.name,
      telephone: clinic.phone || phone.value,
      address: {
        '@type': 'PostalAddress' as const,
        streetAddress: clinic.address,
        addressCountry: 'RU',
      },
    })),
  )

  useSchemaOrg([
    defineWebSite({
      name: computed(() => doctor.value.fullName),
      description: computed(() => doctor.value.about),
      inLanguage: 'ru-RU',
    }),
    defineWebPage(),
    {
      '@type': 'Physician',
      name: computed(() => doctor.value.fullName),
      alternateName: computed(() => doctor.value.shortName),
      jobTitle: computed(() => doctor.value.title),
      description: computed(() => doctor.value.about),
      telephone: phone,
      url: siteUrl,
      image: computed(() => `${siteUrl.value}${doctor.value.photo}`),
      medicalSpecialty: computed(() => doctor.value.specialties),
      address: {
        '@type': 'PostalAddress',
        addressLocality: computed(() => doctor.value.city),
        addressCountry: 'RU',
      },
      department: clinics,
    },
  ])
}
