<script setup lang="ts">
import { yearsLabel } from '~/utils/yearsLabel'

const { doctor } = useDoctor()

const cards = computed(() => {
  const d = doctor.value
  const eduText =
    d.education[0]?.place?.split(',')[0] ||
    d.education[0]?.title ||
    'Образование и повышение квалификации'
  return [
    {
      to: '/pomosh',
      title: 'С чем поможет',
      text: d.helpIntro,
      meta: `${d.manipulations.length} манипуляций · ${d.surgeries.length} операций`,
    },
    {
      to: '/opyt',
      title: 'Опыт работы',
      text: d.experience[0]
        ? `${d.experience[0].place}, ${d.experience[0].city}`
        : 'Опыт работы',
      meta: `Стаж ${d.experienceYears} ${yearsLabel(d.experienceYears)}`,
    },
    {
      to: '/obrazovanie',
      title: 'Образование',
      text: eduText,
      meta: `${d.education.length + d.qualifications.length} записей`,
    },
    {
      to: '/kliniki',
      title: 'Клиники',
      text: d.clinics
        .slice(0, 2)
        .map((c) => c.name)
        .join(', '),
      meta: `${d.clinics.length} места приёма`,
    },
  ]
})
</script>

<template>
  <section class="section bg-white">
    <div class="container-page">
      <div class="mb-8 max-w-2xl md:mb-10">
        <h2 class="section-title">О враче кратко</h2>
        <p class="text-lg leading-relaxed text-[var(--color-muted)]">
          Основное — на карточках. Подробности открываются на отдельных страницах.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="card in cards"
          :key="card.to"
          :to="card.to"
          v-reveal
          class="preview-card"
        >
          <h3 class="preview-card__title">{{ card.title }}</h3>
          <p class="preview-card__text">{{ card.text }}</p>
          <p class="preview-card__meta">{{ card.meta }}</p>
          <span class="preview-card__more">Подробнее →</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
