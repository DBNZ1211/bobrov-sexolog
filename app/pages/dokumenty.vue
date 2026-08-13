<script setup lang="ts">
const { doctor } = useDoctor()
const { documents, pending } = useDocuments()

usePageSeo({
  title: 'Документы',
  description: computed(
    () =>
      `Дипломы, сертификаты и подтверждающие документы ${doctor.value.fullName}, ${doctor.value.title.toLowerCase()}.`,
  ),
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
            <component
              :is="doc.allow_open ? 'a' : 'div'"
              v-bind="
                doc.allow_open
                  ? { href: doc.file_url, target: '_blank', rel: 'noopener' }
                  : {}
              "
              class="surface-card group block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] transition"
              :class="doc.allow_open ? 'hover:border-[var(--color-blue)]' : ''"
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
                <p
                  class="font-semibold text-[var(--color-navy)]"
                  :class="doc.allow_open ? 'group-hover:text-[var(--color-blue)]' : ''"
                >
                  {{ doc.title }}
                </p>
                <p class="mt-1 text-xs text-[var(--color-muted)]">
                  {{ doc.ext.toUpperCase() }}
                  <template v-if="doc.allow_open"> · открыть оригинал</template>
                  <template v-else> · только превью</template>
                </p>
              </div>
            </component>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
