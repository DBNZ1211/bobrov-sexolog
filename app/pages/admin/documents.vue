<script setup lang="ts">
import type { DoctorProfile, SiteDocument } from '#shared/types/doctor'

definePageMeta({
  layout: 'admin',
  pageTransition: false,
})

useSeoMeta({ title: 'Документы — админка', robots: 'noindex, nofollow' })

const { data: me, error: meError } = await useFetch('/api/auth/me')
if (meError.value || !me.value?.authenticated) {
  await navigateTo('/admin/login')
}

const {
  data: docsData,
  pending,
  refresh,
} = await useFetch<{ documents: SiteDocument[] }>('/api/documents', {
  immediate: Boolean(me.value?.authenticated),
})

const { data: profile } = await useFetch<DoctorProfile>('/api/profile', {
  immediate: Boolean(me.value?.authenticated),
})

const title = ref('')
const linkType = ref('none')
const linkId = ref('')
const published = ref(true)
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const message = ref('')
const error = ref('')

const linkOptions = computed(() => {
  if (!profile.value) return []
  if (linkType.value === 'education') {
    return profile.value.education.map((e) => ({
      id: e.id,
      label: `${e.year} — ${e.title}`,
    }))
  }
  if (linkType.value === 'qualification') {
    return profile.value.qualifications.map((q) => ({
      id: q.id,
      label: `${q.year} — ${q.title}`,
    }))
  }
  return []
})

const linkTypeOptions = [
  { value: 'none', label: 'Без привязки' },
  { value: 'education', label: 'Образование' },
  { value: 'qualification', label: 'Повышение квалификации' },
]

const linkRecordOptions = computed(() => [
  { value: '', label: 'Не выбрано' },
  ...linkOptions.value.map((opt) => ({ value: opt.id, label: opt.label })),
])

watch(linkType, () => {
  linkId.value = ''
})

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] || null
  if (file.value && !title.value) {
    title.value = file.value.name.replace(/\.[^.]+$/, '')
  }
}

async function upload() {
  if (!file.value) {
    error.value = 'Выберите файл'
    return
  }
  uploading.value = true
  message.value = ''
  error.value = ''
  try {
    const body = new FormData()
    body.append('file', file.value)
    body.append('title', title.value || file.value.name)
    body.append('link_type', linkType.value)
    if (linkId.value) body.append('link_id', linkId.value)
    body.append('published', published.value ? '1' : '0')

    await $fetch('/api/documents', { method: 'POST', body })
    title.value = ''
    linkType.value = 'none'
    linkId.value = ''
    published.value = true
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
    message.value = 'Документ загружен'
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}

async function patchDoc(doc: SiteDocument, patch: Partial<SiteDocument>) {
  await $fetch(`/api/documents/${doc.id}`, {
    method: 'PATCH',
    body: {
      title: patch.title ?? doc.title,
      link_type: patch.link_type ?? doc.link_type,
      link_id: patch.link_id !== undefined ? patch.link_id : doc.link_id,
      published: patch.published ?? doc.published,
      sort_order: patch.sort_order ?? doc.sort_order,
    },
  })
  await refresh()
}

async function removeDoc(doc: SiteDocument) {
  if (!confirm(`Удалить «${doc.title}»?`)) return
  await $fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
  await refresh()
}

function linkLabel(doc: SiteDocument) {
  if (doc.link_type === 'none' || !doc.link_id || !profile.value) return '—'
  const list =
    doc.link_type === 'education' ? profile.value.education : profile.value.qualifications
  const item = list.find((x) => x.id === doc.link_id)
  return item ? `${item.year} — ${item.title}` : doc.link_id
}
</script>

<template>
  <main class="container-page py-8">
    <h1 class="font-serif text-2xl font-bold text-[var(--color-navy)]">Документы</h1>
    <p class="mt-1 text-sm text-[var(--color-muted)]">
      PDF, DOCX, PNG и др. Превью генерируется автоматически (PNG).
    </p>

    <section class="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5 md:p-6">
      <h2 class="mb-4 font-serif text-xl font-bold text-[var(--color-navy)]">Загрузить</h2>
      <div class="grid gap-4">
        <div>
          <label class="label-field" for="doc-file">Файл</label>
          <label class="file-field">
            <input
              id="doc-file"
              ref="fileInput"
              class="file-field__input"
              type="file"
              accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.webp"
              @change="onFileChange"
            >
            <span class="file-field__btn">Выбрать файл</span>
            <span class="file-field__name" :class="{ 'is-empty': !file }">
              {{ file?.name || 'Файл не выбран' }}
            </span>
          </label>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="min-w-0 flex-1">
            <label class="label-field" for="doc-title">Название</label>
            <input id="doc-title" v-model="title" class="input-field" type="text">
          </div>
          <label class="check-field shrink-0 sm:pb-3">
            <input v-model="published" type="checkbox">
            Показывать на сайте
          </label>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label-field" for="doc-link-type">Привязка</label>
            <AppSelect
              id="doc-link-type"
              v-model="linkType"
              :options="linkTypeOptions"
              placeholder="Без привязки"
            />
          </div>
          <div v-if="linkType !== 'none'">
            <label class="label-field" for="doc-link-id">Запись</label>
            <AppSelect
              id="doc-link-id"
              v-model="linkId"
              :options="linkRecordOptions"
              placeholder="Не выбрано"
            />
          </div>
        </div>
      </div>
      <p v-if="message" class="mt-3 text-sm font-medium text-green-700">{{ message }}</p>
      <p v-if="error" class="mt-3 text-sm font-medium text-red-700" role="alert">{{ error }}</p>
      <button
        type="button"
        class="btn-primary mt-4"
        :disabled="uploading || !file"
        @click="upload"
      >
        {{ uploading ? 'Загрузка…' : 'Загрузить' }}
      </button>
    </section>

    <p v-if="pending" class="mt-6 text-[var(--color-muted)]">Загрузка…</p>

    <div
      v-else-if="!docsData?.documents?.length"
      class="mt-6 rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 text-sm text-[var(--color-muted)]"
    >
      Документов пока нет.
    </div>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="doc in docsData.documents"
        :key="doc.id"
        class="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white"
      >
        <a :href="doc.file_url" target="_blank" rel="noopener" class="block bg-[var(--color-bg-soft)]">
          <img
            v-if="doc.preview_url"
            :src="doc.preview_url"
            :alt="doc.title"
            class="aspect-[4/5] w-full object-contain"
          >
          <div
            v-else
            class="flex aspect-[4/5] items-center justify-center text-sm text-[var(--color-muted)]"
          >
            Нет превью
          </div>
        </a>
        <div class="space-y-2 p-4">
          <input
            class="input-field"
            type="text"
            :value="doc.title"
            @change="
              patchDoc(doc, {
                title: ($event.target as HTMLInputElement).value,
              })
            "
          >
          <p class="text-xs text-[var(--color-muted)]">
            {{ doc.ext.toUpperCase() }} · {{ Math.round(doc.size / 1024) }} КБ
          </p>
          <p class="text-xs text-[var(--color-muted)]">Привязка: {{ linkLabel(doc) }}</p>
          <label class="check-field">
            <input
              type="checkbox"
              :checked="doc.published"
              @change="
                patchDoc(doc, {
                  published: ($event.target as HTMLInputElement).checked,
                })
              "
            >
            На сайте
          </label>
          <div class="flex flex-wrap gap-3 pt-1">
            <a
              :href="doc.file_url"
              target="_blank"
              rel="noopener"
              class="text-sm text-[var(--color-blue)] hover:underline"
            >
              Открыть
            </a>
            <button type="button" class="text-sm text-red-700" @click="removeDoc(doc)">
              Удалить
            </button>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
