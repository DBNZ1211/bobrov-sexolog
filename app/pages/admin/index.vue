<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  pageTransition: false,
})

useSeoMeta({ title: 'Заявки — админка', robots: 'noindex, nofollow' })

interface Lead {
  id: number
  name: string
  phone: string
  comment: string
  status: 'new' | 'done'
  created_at: string
}

const { data: me, error: meError } = await useFetch('/api/auth/me')
if (meError.value || !me.value?.authenticated) {
  await navigateTo('/admin/login')
}

const {
  data,
  pending,
  refresh,
} = await useFetch<{ leads: Lead[] }>('/api/leads', {
  immediate: Boolean(me.value?.authenticated),
})

async function setStatus(lead: Lead, status: 'new' | 'done') {
  await $fetch(`/api/leads/${lead.id}`, {
    method: 'PATCH',
    body: { status },
  })
  await refresh()
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
</script>

<template>
  <main class="container-page py-8">
    <h1 class="mb-6 inline-flex items-center gap-2.5 font-serif text-2xl font-bold text-[var(--color-navy)]">
      <Icon name="lucide:clipboard-list" class="h-7 w-7 shrink-0" aria-hidden="true" />
      Заявки
    </h1>

    <p v-if="pending" class="text-[var(--color-muted)]">Загрузка…</p>

    <div
      v-else-if="!data?.leads?.length"
      class="rounded-xl border border-[var(--color-border)] bg-white p-6 text-[var(--color-muted)]"
    >
      Заявок пока нет.
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-navy)]">
          <tr>
            <th class="px-4 py-3 font-semibold">Дата</th>
            <th class="px-4 py-3 font-semibold">Имя</th>
            <th class="px-4 py-3 font-semibold">Телефон</th>
            <th class="px-4 py-3 font-semibold">Комментарий</th>
            <th class="px-4 py-3 font-semibold">Статус</th>
            <th class="px-4 py-3 font-semibold">Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lead in data.leads"
            :key="lead.id"
            class="border-b border-[var(--color-border)] align-top"
          >
            <td class="whitespace-nowrap px-4 py-3 text-[var(--color-muted)]">
              {{ formatDate(lead.created_at) }}
            </td>
            <td class="px-4 py-3 font-medium text-[var(--color-navy)]">{{ lead.name }}</td>
            <td class="px-4 py-3">
              <a :href="`tel:${lead.phone.replace(/[^\d+]/g, '')}`" class="link-phone">
                {{ lead.phone }}
              </a>
            </td>
            <td class="max-w-xs px-4 py-3 text-[var(--color-text)]">{{ lead.comment || '—' }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="
                  lead.status === 'new'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                "
              >
                {{ lead.status === 'new' ? 'Новая' : 'Обработана' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button
                v-if="lead.status === 'new'"
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-blue)] hover:underline"
                @click="setStatus(lead, 'done')"
              >
                <Icon name="lucide:check" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Отметить
              </button>
              <button
                v-else
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)] hover:underline"
                @click="setStatus(lead, 'new')"
              >
                <Icon name="lucide:undo-2" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Вернуть
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
