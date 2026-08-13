<script setup lang="ts">
defineProps<{
  title: string
  lead?: string
}>()
</script>

<template>
  <div class="page-hero">
    <div class="page-hero__accent" aria-hidden="true" />
    <div class="container-page page-hero__inner">
      <NuxtLink to="/" class="page-hero__back">
        <Icon name="lucide:arrow-left" class="page-hero__back-icon" aria-hidden="true" />
        На главную
      </NuxtLink>
      <h1 class="page-hero__title">{{ title }}</h1>
      <p v-if="lead" class="page-hero__lead">{{ lead }}</p>
    </div>
  </div>
</template>
