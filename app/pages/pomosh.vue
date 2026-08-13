<script setup lang="ts">
const { doctor } = useDoctor()

usePageSeo({
  title: 'С чем поможет',
  breadcrumb: 'Помощь',
  description: computed(() => {
    const extra = doctor.value.manipulations.slice(0, 3).join(', ')
    return extra
      ? `${doctor.value.helpIntro} В том числе: ${extra}.`
      : doctor.value.helpIntro
  }),
})
</script>

<template>
  <div>
    <PageHero title="С чем поможет" :lead="doctor.helpIntro" />
    <section class="section bg-white">
      <div class="container-page grid gap-8 lg:grid-cols-2">
        <div class="surface-card rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:p-7">
          <div class="mb-5 flex items-center gap-3">
            <span class="icon-badge icon-badge--lg" aria-hidden="true">
              <Icon name="lucide:stethoscope" />
            </span>
            <h2 class="text-xl font-bold text-[var(--color-navy)]">Манипуляции</h2>
          </div>
          <ul class="check-list">
            <li
              v-for="item in doctor.manipulations"
              :key="item"
              class="check-list__item"
            >
              <Icon name="lucide:circle-check" class="check-list__icon" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="surface-card rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:p-7">
          <div class="mb-5 flex items-center gap-3">
            <span class="icon-badge icon-badge--lg" aria-hidden="true">
              <Icon name="lucide:scissors" />
            </span>
            <h2 class="text-xl font-bold text-[var(--color-navy)]">Операции</h2>
          </div>
          <ul class="check-list">
            <li
              v-for="item in doctor.surgeries"
              :key="item"
              class="check-list__item"
            >
              <Icon name="lucide:circle-check" class="check-list__icon" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
          <p class="mt-5 flex items-start gap-2 text-sm text-[var(--color-muted)]">
            <Icon name="lucide:info" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-blue)]" aria-hidden="true" />
            Часть вмешательств — под УЗД-контролем.
          </p>
        </div>
      </div>

      <div class="container-page">
        <SectionCta
          title="Нужна консультация?"
          lead="Опишите ситуацию в заявке или позвоните — подскажем, чем можем помочь."
          label="Записаться на приём"
        />
      </div>
    </section>
  </div>
</template>
