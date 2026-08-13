<script setup lang="ts">
const { doctor } = useDoctor()
const config = useRuntimeConfig()
const phone = computed(() => config.public.phone || doctor.value.phone)
const phoneHref = computed(() => config.public.phoneHref || doctor.value.phoneHref)
</script>

<template>
  <section v-reveal class="section bg-[var(--color-bg)]">
    <div class="container-page flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:flex-row md:items-center md:p-8">
      <div class="max-w-xl">
        <h2 class="font-serif text-2xl font-bold text-[var(--color-navy)] md:text-3xl">
          Запись на приём
        </h2>
        <p class="mt-2 text-base leading-relaxed text-[var(--color-muted)]">
          Оставьте заявку на сайте или позвоните — согласуем удобное время.
        </p>
        <a :href="phoneHref" class="link-phone mt-3 inline-block text-lg">{{ phone }}</a>
      </div>
      <NuxtLink to="/zapis" class="btn-primary btn-primary--lg shrink-0">
        Перейти к записи
      </NuxtLink>
    </div>
  </section>
</template>
