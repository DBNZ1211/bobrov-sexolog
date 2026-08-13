<script setup lang="ts">
const { doctor } = useDoctor()
const { documents, pending } = useDocuments()

useSeoMeta({
  title: computed(() => `Документы — ${doctor.value.shortName}`),
  description: 'Дипломы, сертификаты и документы врача-уролога Боброва В. Т.',
})
</script>

<template>
  <div>
    <PageHero
      title="Документы"
      lead="Дипломы, сертификаты и подтверждающие материалы"
    />
    <section class="section bg-white">
      <div class="container-page">
        <p v-if="pending" class="text-[var(--color-muted)]">Загрузка…</p>

        <div
          v-else-if="!documents.length"
          class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-[var(--color-muted)]"
        >
          Документы пока не опубликованы.
        </div>

        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="doc in documents" :key="doc.id" v-reveal>
            <a
              :href="doc.file_url"
              target="_blank"
              rel="noopener"
              class="surface-card group block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] transition hover:border-[var(--color-blue)]"
            >
              <div class="bg-white">
                <img
                  v-if="doc.preview_url"
                  :src="doc.preview_url"
                  :alt="doc.title"
                  class="aspect-[4/5] w-full object-contain"
                  loading="lazy"
                >
                <div
                  v-else
                  class="flex aspect-[4/5] items-center justify-center text-sm text-[var(--color-muted)]"
                >
                  {{ doc.ext.toUpperCase() }}
                </div>
              </div>
              <div class="p-4">
                <p class="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-blue)]">
                  {{ doc.title }}
                </p>
                <p class="mt-1 text-xs text-[var(--color-muted)]">
                  {{ doc.ext.toUpperCase() }} · открыть оригинал
                </p>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
