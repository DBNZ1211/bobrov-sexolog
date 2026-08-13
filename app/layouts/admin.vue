<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}

const links = [
  { to: '/admin', label: 'Заявки', exact: true },
  { to: '/admin/profile', label: 'Профиль' },
  { to: '/admin/documents', label: 'Документы' },
]

function isActive(to: string, exact?: boolean) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <header class="border-b border-[var(--color-border)] bg-white">
      <div class="container-page flex h-16 flex-wrap items-center justify-between gap-3">
        <nav class="flex flex-wrap items-center gap-1 sm:gap-3" aria-label="Админ-навигация">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isActive(link.to, link.exact)
                ? 'bg-[var(--color-bg-soft)] text-[var(--color-navy)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-navy)]'
            "
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-3">
          <a href="/" class="text-sm font-medium text-[var(--color-blue)] hover:underline">На сайт</a>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="logout">
            Выйти
          </button>
        </div>
      </div>
    </header>
    <slot />
  </div>
</template>
