<script setup lang="ts">
const { doctor } = useDoctor()

const config = useRuntimeConfig()
const phone = computed(() => config.public.phone || doctor.value.phone)

usePageSeo({
  title: 'Запись на приём',
  breadcrumb: 'Запись',
  description: computed(
    () =>
      `Запись на приём к ${doctor.value.shortName}. Оставьте заявку на сайте или позвоните ${phone.value} — согласуем удобное время.`,
  ),
})
</script>

<template>
  <div>
    <PageHero
      title="Запись на приём"
      lead="Заполните форму — мы свяжемся с вами и согласуем время"
    />
    <LeadForm embed />
  </div>
</template>
