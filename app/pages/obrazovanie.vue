<script setup lang="ts">
const { doctor } = useDoctor()
const { docsFor } = useDocuments()

useSeoMeta({
  title: computed(() => `Образование — ${doctor.value.shortName}`),
  description: 'Образование и повышение квалификации врача-уролога Боброва В. Т.',
})
</script>

<template>
  <div>
    <PageHero
      title="Образование"
      lead="Базовое образование, интернатура и повышение квалификации"
    />
    <section class="section bg-white">
      <div class="container-page">
        <div class="mx-auto max-w-3xl">
          <div class="mb-5 flex items-center gap-3">
            <span class="icon-badge icon-badge--lg" aria-hidden="true">
              <Icon name="lucide:graduation-cap" />
            </span>
            <h2 class="font-serif text-2xl font-bold text-[var(--color-navy)]">
              ВУЗ и интернатура
            </h2>
          </div>

          <ul class="timeline mb-12">
            <li
              v-for="item in doctor.education"
              :key="item.id"
              class="timeline__item"
            >
              <span class="timeline__marker" aria-hidden="true" />
              <article
                class="surface-card rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 md:p-6"
              >
                <p class="text-base font-bold tracking-wide text-[var(--color-blue)]">
                  {{ item.year }}
                </p>
                <p class="mt-1.5 text-xl font-bold text-[var(--color-navy)]">{{ item.title }}</p>
                <MetaLine icon="lucide:building-2" class="mt-2.5" muted>
                  {{ item.place }}
                </MetaLine>
                <div
                  v-if="docsFor('education', item.id).length"
                  class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  <a
                    v-for="doc in docsFor('education', item.id)"
                    :key="doc.id"
                    :href="doc.file_url"
                    target="_blank"
                    rel="noopener"
                    class="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white"
                  >
                    <img
                      v-if="doc.preview_url"
                      :src="doc.preview_url"
                      :alt="doc.title"
                      class="aspect-[4/5] w-full object-contain"
                      loading="lazy"
                    >
                    <p class="truncate px-2 py-1.5 text-xs text-[var(--color-muted)]">{{ doc.title }}</p>
                  </a>
                </div>
              </article>
            </li>
          </ul>

          <div class="mb-5 flex items-center gap-3">
            <span class="icon-badge icon-badge--lg" aria-hidden="true">
              <Icon name="lucide:badge-check" />
            </span>
            <h2 class="font-serif text-2xl font-bold text-[var(--color-navy)]">
              Повышение квалификации
            </h2>
          </div>

          <ul class="timeline">
            <li
              v-for="item in doctor.qualifications"
              :key="item.id"
              class="timeline__item"
            >
              <span class="timeline__marker" aria-hidden="true" />
              <article
                class="surface-card rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 md:p-6"
              >
                <p class="text-base font-bold tracking-wide text-[var(--color-blue)]">
                  {{ item.year }}
                </p>
                <p class="mt-1.5 text-xl font-bold text-[var(--color-navy)]">{{ item.title }}</p>
                <MetaLine icon="lucide:building-2" class="mt-2.5" muted>
                  {{ item.place }}
                </MetaLine>
                <div
                  v-if="docsFor('qualification', item.id).length"
                  class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  <a
                    v-for="doc in docsFor('qualification', item.id)"
                    :key="doc.id"
                    :href="doc.file_url"
                    target="_blank"
                    rel="noopener"
                    class="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white"
                  >
                    <img
                      v-if="doc.preview_url"
                      :src="doc.preview_url"
                      :alt="doc.title"
                      class="aspect-[4/5] w-full object-contain"
                      loading="lazy"
                    >
                    <p class="truncate px-2 py-1.5 text-xs text-[var(--color-muted)]">{{ doc.title }}</p>
                  </a>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
