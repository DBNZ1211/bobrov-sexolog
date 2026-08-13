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
const allowOpen = ref(true)
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const regeneratingId = ref<string | null>(null)
const message = ref('')
const error = ref('')
const previewBust = ref(Date.now())

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

const ACCEPTED_EXT = ['.pdf', '.doc', '.docx', '.odt', '.png', '.jpg', '.jpeg', '.webp'] as const

const isWindowFileDrag = ref(false)
let windowFileDragDepth = 0

function hasFilePayload(dt: DataTransfer | null | undefined) {
  return Boolean(dt && [...dt.types].includes('Files'))
}

function resetWindowFileDrag() {
  windowFileDragDepth = 0
  isWindowFileDrag.value = false
}

function setSelectedFile(next: File | null) {
  file.value = next
  if (next && !title.value) {
    title.value = next.name.replace(/\.[^.]+$/, '')
  }
}

function isAcceptedFile(f: File) {
  const name = f.name.toLowerCase()
  return ACCEPTED_EXT.some((ext) => name.endsWith(ext))
}

function syncFileInput(next: File | null) {
  if (!fileInput.value) return
  if (!next) {
    fileInput.value.value = ''
    return
  }
  const dt = new DataTransfer()
  dt.items.add(next)
  fileInput.value.files = dt.files
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  setSelectedFile(input.files?.[0] || null)
}

function onWindowDragEnter(event: DragEvent) {
  if (!hasFilePayload(event.dataTransfer)) return
  windowFileDragDepth += 1
  isWindowFileDrag.value = true
}

function onWindowDragLeave(event: DragEvent) {
  if (!hasFilePayload(event.dataTransfer)) return
  windowFileDragDepth = Math.max(0, windowFileDragDepth - 1)
  if (windowFileDragDepth === 0) isWindowFileDrag.value = false
}

function onWindowDragOver(event: DragEvent) {
  if (!hasFilePayload(event.dataTransfer)) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function onWindowDrop(event: DragEvent) {
  // Prevent browser from opening the file if dropped outside the field
  if (hasFilePayload(event.dataTransfer)) event.preventDefault()
  resetWindowFileDrag()
}

function onFileDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function onFileDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  resetWindowFileDrag()
  const dropped = event.dataTransfer?.files?.[0]
  if (!dropped) return
  if (!isAcceptedFile(dropped)) {
    error.value = 'Неподдерживаемый тип файла'
    return
  }
  error.value = ''
  setSelectedFile(dropped)
  syncFileInput(dropped)
}

onMounted(() => {
  document.addEventListener('dragenter', onWindowDragEnter)
  document.addEventListener('dragleave', onWindowDragLeave)
  document.addEventListener('dragover', onWindowDragOver)
  document.addEventListener('drop', onWindowDrop)
})

onBeforeUnmount(() => {
  document.removeEventListener('dragenter', onWindowDragEnter)
  document.removeEventListener('dragleave', onWindowDragLeave)
  document.removeEventListener('dragover', onWindowDragOver)
  document.removeEventListener('drop', onWindowDrop)
  resetWindowFileDrag()
})

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
    body.append('allow_open', allowOpen.value ? '1' : '0')

    await $fetch('/api/documents', { method: 'POST', body })
    title.value = ''
    linkType.value = 'none'
    linkId.value = ''
    published.value = true
    allowOpen.value = true
    file.value = null
    syncFileInput(null)
    message.value = 'Документ загружен. Превью строится в фоне — обновите через пару секунд.'
    previewBust.value = Date.now()
    await refresh()
    // Preview is generated in background; refresh again shortly
    window.setTimeout(() => {
      previewBust.value = Date.now()
      void refresh()
    }, 4000)
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
      allow_open: patch.allow_open ?? doc.allow_open,
      sort_order: patch.sort_order ?? doc.sort_order,
    },
  })
  await refresh()
}

async function regeneratePreview(doc: SiteDocument) {
  regeneratingId.value = doc.id
  message.value = ''
  error.value = ''
  try {
    await $fetch(`/api/documents/${doc.id}/preview`, { method: 'POST' })
    previewBust.value = Date.now()
    message.value = 'Превью обновлено'
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Не удалось обновить превью'
  } finally {
    regeneratingId.value = null
  }
}

async function removeDoc(doc: SiteDocument) {
  if (!confirm(`Удалить «${doc.title}»?`)) return
  await $fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
  await refresh()
}

function previewSrc(doc: SiteDocument) {
  if (!doc.preview_url) return null
  return `${doc.preview_url}?t=${previewBust.value}`
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
      PDF, DOCX, PNG и др. Превью строится автоматически (PNG). Если видите заглушку —
      нажмите «Обновить превью».
    </p>

    <section class="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5 md:p-6">
      <h2 class="mb-4 font-serif text-xl font-bold text-[var(--color-navy)]">Загрузить</h2>
      <div class="grid gap-4">
        <div>
          <label class="label-field" for="doc-file">Файл</label>
          <label
            class="file-field"
            :class="{ 'is-dragover': isWindowFileDrag }"
            @dragover="onFileDragOver"
            @drop="onFileDrop"
          >
            <input
              id="doc-file"
              ref="fileInput"
              class="file-field__input"
              type="file"
              accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.webp"
              @change="onFileChange"
            >
            <span class="file-field__btn">Выбрать файл</span>
            <span class="file-field__name" :class="{ 'is-empty': !file && !isWindowFileDrag }">
              {{
                isWindowFileDrag
                  ? 'Отпустите сюда'
                  : file?.name || 'Перетащите файл сюда или выберите'
              }}
            </span>
          </label>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="min-w-0 flex-1">
            <label class="label-field" for="doc-title">Название</label>
            <input id="doc-title" v-model="title" class="input-field" type="text">
          </div>
          <div class="flex flex-col gap-2 sm:pb-3">
            <label class="check-field shrink-0">
              <input v-model="published" type="checkbox">
              Показывать на сайте
            </label>
            <label class="check-field shrink-0">
              <input v-model="allowOpen" type="checkbox">
              Разрешить открывать документ
            </label>
          </div>
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
            v-if="previewSrc(doc)"
            :src="previewSrc(doc)!"
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
          <div class="flex flex-col gap-2 py-0.5">
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
            <label class="check-field">
              <input
                type="checkbox"
                :checked="doc.allow_open"
                @change="
                  patchDoc(doc, {
                    allow_open: ($event.target as HTMLInputElement).checked,
                  })
                "
              >
              Разрешить открывать
            </label>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-3">
            <a
              :href="doc.file_url"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-blue)] hover:underline"
            >
              <Icon name="lucide:external-link" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Открыть
            </a>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-blue)] hover:underline disabled:opacity-60"
              :disabled="regeneratingId === doc.id"
              @click="regeneratePreview(doc)"
            >
              <Icon
                name="lucide:refresh-cw"
                class="h-3.5 w-3.5 shrink-0"
                :class="{ 'animate-spin': regeneratingId === doc.id }"
                aria-hidden="true"
              />
              {{ regeneratingId === doc.id ? 'Обновление…' : 'Обновить превью' }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:underline"
              @click="removeDoc(doc)"
            >
              <Icon name="lucide:trash-2" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Удалить
            </button>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
