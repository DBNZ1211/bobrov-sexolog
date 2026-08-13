<script setup lang="ts">
const { doctor } = useDoctor()

useSeoMeta({
  title: computed(() => `${doctor.value.fullName} — ${doctor.value.title}, ${doctor.value.city}`),
  description: computed(() => doctor.value.about),
  ogTitle: computed(() => `${doctor.value.fullName} — ${doctor.value.title}`),
  ogDescription: computed(() => doctor.value.about),
  ogType: 'website',
})
</script>

<template>
  <div>
    <HeroClassic />
    <HomePreviewCards />
    <HomeCta />
  </div>
</template>
