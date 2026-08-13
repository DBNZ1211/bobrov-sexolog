<script setup lang="ts">
const { doctor } = useDoctor()

useSeoMeta({
  title: computed(() => `Запись на приём — ${doctor.value.shortName}`),
  description: 'Оставьте заявку на приём или позвоните по телефону.',
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
