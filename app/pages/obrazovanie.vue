<script setup lang="ts">
const { doctor } = useDoctor()
const { docsFor } = useDocuments()

usePageSeo({
  title: 'Образование',
  description: computed(() => {
    const edu = doctor.value.education[0]
    const qual = doctor.value.qualifications[0]
    const parts = ['Базовое образование, интернатура и повышение квалификации']
    if (edu) parts.push(`${edu.title} (${edu.year})`)
    if (qual) parts.push(`${qual.title} (${qual.year})`)
    return `${parts.join('. ')}.`
  }),
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
          <ul class="timeline">
            <li class="timeline__item timeline__item--heading">
              <span class="icon-badge icon-badge--lg timeline__badge" aria-hidden="true">
                <Icon name="lucide:graduation-cap" />
              </span>
              <h2 class="timeline__heading">ВУЗ и интернатура</h2>
            </li>

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
                  <component
                    :is="doc.allow_open ? 'a' : 'div'"
                    v-for="doc in docsFor('education', item.id)"
                    :key="doc.id"
                    v-bind="
                      doc.allow_open
                        ? { href: doc.file_url, target: '_blank', rel: 'noopener' }
                        : {}
                    "
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
                  </component>
                </div>
              </article>
            </li>

            <li class="timeline__item timeline__item--heading">
              <span class="icon-badge icon-badge--lg timeline__badge" aria-hidden="true">
                <Icon name="lucide:badge-check" />
              </span>
              <h2 class="timeline__heading">Повышение квалификации</h2>
            </li>

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
                  <component
                    :is="doc.allow_open ? 'a' : 'div'"
                    v-for="doc in docsFor('qualification', item.id)"
                    :key="doc.id"
                    v-bind="
                      doc.allow_open
                        ? { href: doc.file_url, target: '_blank', rel: 'noopener' }
                        : {}
                    "
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
                  </component>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
