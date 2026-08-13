import type { SiteDocument } from '#shared/types/doctor'

export function useDocuments() {
  const { data, pending, error, refresh } = useFetch<{ documents: SiteDocument[] }>(
    '/api/documents',
    {
      key: 'site-documents',
      default: () => ({ documents: [] }),
    },
  )

  const documents = computed(() => data.value?.documents || [])

  function docsFor(linkType: 'education' | 'qualification', linkId: string) {
    return documents.value.filter(
      (d) => d.link_type === linkType && d.link_id === linkId,
    )
  }

  return { documents, docsFor, pending, error, refresh }
}
