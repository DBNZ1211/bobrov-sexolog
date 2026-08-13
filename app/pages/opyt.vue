<script setup lang="ts">
import { yearsLabel } from '~/utils/yearsLabel'

const { doctor } = useDoctor()

usePageSeo({
  title: 'Опыт работы',
  breadcrumb: 'Опыт',
  description: computed(() => {
    const first = doctor.value.experience[0]
    const place = first ? `${first.place}, ${first.city}` : ''
    return `Стаж ${doctor.value.experienceYears} ${yearsLabel(doctor.value.experienceYears)}. ${place}. Врач-уролог.`
  }),
})
</script>

<template>
  <div>
    <PageHero
      title="Опыт работы"
      :lead="`Стаж ${doctor.experienceYears} ${yearsLabel(doctor.experienceYears)} · врач-уролог`"
    />
    <section class="section bg-white">
      <div class="container-page">
        <div class="mx-auto max-w-3xl">
          <ul class="timeline">
            <li
              v-for="item in doctor.experience"
              :key="item.id"
              class="timeline__item"
            >
              <span class="timeline__marker" aria-hidden="true" />
              <article
                class="surface-card rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 md:p-6"
              >
                <MetaLine icon="lucide:calendar" muted>{{ item.period }}</MetaLine>
                <div class="mt-3 flex items-start gap-3">
                  <span class="icon-badge" aria-hidden="true">
                    <Icon name="lucide:building-2" />
                  </span>
                  <div class="min-w-0">
                    <h2 class="text-xl font-bold text-[var(--color-navy)]">{{ item.place }}</h2>
                    <MetaLine icon="lucide:map-pin" class="mt-2" muted>
                      {{ item.role }} · {{ item.city }}
                    </MetaLine>
                  </div>
                </div>
              </article>
            </li>
          </ul>

          <SectionCta
            title="Запись к врачу"
            lead="Согласуем удобное время приёма в одной из клиник."
          />
        </div>
      </div>
    </section>
  </div>
</template>
