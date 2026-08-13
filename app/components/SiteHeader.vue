<script setup lang="ts">
import { siteNav } from '~/data/nav'

const { doctor } = useDoctor()
const open = ref(false)
const route = useRoute()
const config = useRuntimeConfig()
const phone = computed(() => config.public.phone || doctor.value.phone)
const phoneHref = computed(() => config.public.phoneHref || doctor.value.phoneHref)

const links = siteNav.filter((l) => l.to !== '/')

function close() {
  open.value = false
}

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header class="site-header" :class="{ 'is-open': open }">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__brand" @click="close">
        {{ doctor.shortName }}
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Навигация">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="site-header__link"
          :class="{ 'is-active': isActive(link.to) }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="site-header__actions">
        <a :href="phoneHref" class="site-header__phone">{{ phone }}</a>
        <NuxtLink to="/zapis" class="site-header__cta">Записаться</NuxtLink>
        <button
          type="button"
          class="site-header__burger"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          aria-label="Меню"
          @click="open = !open"
        >
          {{ open ? '×' : '☰' }}
        </button>
      </div>
    </div>

    <nav
      v-show="open"
      id="mobile-nav"
      class="site-header__mobile"
      aria-label="Мобильное меню"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="site-header__mobile-link"
        @click="close"
      >
        {{ link.label }}
      </NuxtLink>
      <a :href="phoneHref" class="site-header__mobile-link" @click="close">{{ phone }}</a>
    </nav>
  </header>
</template>
