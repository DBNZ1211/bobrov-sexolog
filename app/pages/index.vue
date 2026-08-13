<script setup lang="ts">
const { doctor } = useDoctor()

usePageSeo({
  home: true,
  title: computed(() => `${doctor.value.fullName} — ${doctor.value.title}, ${doctor.value.city}`),
  description: homeDescription(),
  ogTitle: computed(() => `${doctor.value.fullName} — ${doctor.value.title}`),
})
</script>

<template>
  <div>
    <HeroClassic />
    <HomePreviewCards />
    <HomeCta />
  </div>
</template>
