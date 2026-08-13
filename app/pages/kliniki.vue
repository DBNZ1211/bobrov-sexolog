<script setup lang="ts">
const { doctor } = useDoctor()

usePageSeo({
  title: 'Клиники и контакты',
  breadcrumb: 'Клиники',
  description: computed(() => {
    const places = doctor.value.clinics
      .map((c) => c.address.split(',')[0]?.trim() || c.name)
      .filter(Boolean)
    return `Адреса и телефоны мест приёма: ${doctor.value.clinics.map((c) => c.name).join(', ')}. Города: ${places.join(', ')}.`
  }),
})
</script>

<template>
  <div>
    <PageHero title="Клиники и контакты" lead="Адреса и телефоны мест приёма" />
    <section class="section bg-white">
      <div class="container-page grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
        <article
          v-for="clinic in doctor.clinics"
          :key="clinic.id"
          class="surface-card flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 md:p-6"
        >
          <div class="mb-3 flex items-start gap-3">
            <span class="icon-badge" aria-hidden="true">
              <Icon name="lucide:building-2" />
            </span>
            <h2 class="text-lg font-bold leading-snug text-[var(--color-navy)]">
              {{ clinic.name }}
            </h2>
          </div>

          <div class="space-y-2.5">
            <MetaLine icon="lucide:map-pin">{{ clinic.address }}</MetaLine>
            <MetaLine
              v-if="clinic.phone"
              icon="lucide:phone"
              :href="`tel:${clinic.phone.replace(/[^\d+]/g, '')}`"
            >
              {{ clinic.phone }}
            </MetaLine>
            <MetaLine v-if="clinic.note" icon="lucide:info" muted>
              {{ clinic.note }}
            </MetaLine>
          </div>

          <div class="mt-auto pt-5">
            <NuxtLink
              :to="{ path: '/zapis', query: { clinic: clinic.id } }"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-blue)] transition hover:text-[var(--color-navy)]"
            >
              Записаться
              <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
            </NuxtLink>
          </div>
        </article>
      </div>

      <div class="container-page">
        <SectionCta
          title="Выберите удобную клинику"
          lead="Оставьте заявку — перезвоним и согласуем время приёма."
          label="Записаться на приём"
        />
      </div>
    </section>
  </div>
</template>
