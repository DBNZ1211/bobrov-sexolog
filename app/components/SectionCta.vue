<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    lead?: string
    to?: string
    label?: string
  }>(),
  {
    title: 'Готовы записаться?',
    lead: 'Оставьте заявку на сайте или позвоните — согласуем удобное время.',
    to: '/zapis',
    label: 'Записаться',
  },
)
</script>

<template>
  <div class="section-cta">
    <div class="section-cta__copy">
      <p class="section-cta__title">{{ title }}</p>
      <p v-if="lead" class="section-cta__lead">{{ lead }}</p>
    </div>
    <NuxtLink :to="to" class="btn-primary shrink-0">{{ label }}</NuxtLink>
  </div>
</template>
