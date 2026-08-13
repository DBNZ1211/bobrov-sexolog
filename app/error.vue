<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: computed(() => (is404.value ? 'Страница не найдена' : 'Ошибка')),
  robots: 'noindex, nofollow',
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <div class="page-hero">
      <div class="container-page page-hero__inner">
        <p class="text-sm font-semibold text-[var(--color-blue)]">
          {{ error.statusCode || 500 }}
        </p>
        <h1 class="page-hero__title">
          {{ is404 ? 'Страница не найдена' : 'Что-то пошло не так' }}
        </h1>
        <p class="page-hero__lead">
          {{
            is404
              ? 'Такой страницы нет. Вернитесь на главную или выберите раздел в меню.'
              : 'Попробуйте обновить страницу или вернуться на главную.'
          }}
        </p>
        <button type="button" class="btn-primary mt-6" @click="goHome">
          На главную
        </button>
      </div>
    </div>
  </div>
</template>
