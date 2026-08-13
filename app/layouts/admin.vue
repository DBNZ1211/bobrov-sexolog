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
  { to: '/admin', label: 'Заявки', icon: 'lucide:clipboard-list', exact: true },
  { to: '/admin/profile', label: 'Профиль', icon: 'lucide:user-round' },
  { to: '/admin/documents', label: 'Документы', icon: 'lucide:files' },
]

function isActive(to: string, exact?: boolean) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white">
      <div class="container-page flex h-16 flex-wrap items-center justify-between gap-3">
        <nav class="flex flex-wrap items-center gap-1 sm:gap-3" aria-label="Админ-навигация">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isActive(link.to, link.exact)
                ? 'bg-[var(--color-bg-soft)] text-[var(--color-navy)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-navy)]'
            "
          >
            <Icon :name="link.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-3">
          <a
            href="/"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-blue)] hover:underline"
          >
            <Icon name="lucide:external-link" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            На сайт
          </a>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="logout">
            <Icon name="lucide:log-out" class="h-4 w-4 shrink-0" aria-hidden="true" />
            Выйти
          </button>
        </div>
      </div>
    </header>
    <slot />
  </div>
</template>
