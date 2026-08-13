import { yearsLabel } from '~/utils/yearsLabel'

function clip(text: string, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trimEnd()}…`
}

export function usePageSeo(options: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  ogTitle?: MaybeRefOrGetter<string>
  breadcrumb?: MaybeRefOrGetter<string>
  home?: boolean
}) {
  const { doctor } = useDoctor()
  const title = computed(() => toValue(options.title))
  const description = computed(() => clip(toValue(options.description), 180))
  const ogTitle = computed(() => toValue(options.ogTitle) || title.value)
  const ogDescription = computed(() => clip(description.value, 120))

  useHead({
    titleTemplate: options.home
      ? '%s'
      : computed(() => `%s · ${doctor.value.shortName}`),
  })

  useSeoMeta({
    title,
    description,
    ogTitle,
    ogDescription,
    ogType: 'website',
    ogLocale: 'ru_RU',
    ogSiteName: computed(() => doctor.value.shortName),
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
  })

  defineOgImage('Default', {
    title: ogTitle,
    description: ogDescription,
    eyebrow: computed(() => doctor.value.shortName),
    meta: computed(() => `${doctor.value.city} · ${doctor.value.title}`),
  })

  if (!options.home) {
    useSchemaOrg([
      defineBreadcrumb({
        itemListElement: [
          { name: 'Главная', item: '/' },
          { name: computed(() => toValue(options.breadcrumb) || title.value) },
        ],
      }),
    ])
  }
}

export function homeDescription() {
  const { doctor } = useDoctor()
  const config = useRuntimeConfig()
  const phone = computed(() => config.public.phone || doctor.value.phone)

  return computed(() => {
    const d = doctor.value
    return `${d.fullName} — ${d.title.toLowerCase()}, ${d.subtitle.toLowerCase()}. Стаж ${d.experienceYears} ${yearsLabel(d.experienceYears)}. Приём в городе ${d.city}. Запись онлайн или по телефону ${phone.value}.`
  })
}
