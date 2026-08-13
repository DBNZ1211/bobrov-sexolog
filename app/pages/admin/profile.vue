<script setup lang="ts">
import type { DoctorProfile } from '#shared/types/doctor'

definePageMeta({
  layout: 'admin',
  pageTransition: false,
})

useSeoMeta({ title: 'Профиль — админка', robots: 'noindex, nofollow' })

const { data: me, error: meError } = await useFetch('/api/auth/me')
if (meError.value || !me.value?.authenticated) {
  await navigateTo('/admin/login')
}

const {
  data: profile,
  pending,
  refresh,
} = await useFetch<DoctorProfile>('/api/profile', {
  immediate: Boolean(me.value?.authenticated),
})

const form = ref<DoctorProfile | null>(null)
const saving = ref(false)
const message = ref('')
const error = ref('')

/** Stable keys for string rows (so DnD doesn't break v-model). */
const stringKeys = reactive({
  specialties: [] as string[],
  manipulations: [] as string[],
  surgeries: [] as string[],
})

watch(
  profile,
  (value) => {
    if (!value) return
    form.value = structuredClone(toRaw(value))
    stringKeys.specialties = value.specialties.map(() => crypto.randomUUID())
    stringKeys.manipulations = value.manipulations.map(() => crypto.randomUUID())
    stringKeys.surgeries = value.surgeries.map(() => crypto.randomUUID())
  },
  { immediate: true },
)

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function addExperience() {
  if (!form.value) return
  form.value.experience.push({
    id: newId('exp'),
    role: '',
    place: '',
    period: '',
    city: '',
  })
}

function addEducation() {
  if (!form.value) return
  form.value.education.push({
    id: newId('edu'),
    year: '',
    title: '',
    place: '',
  })
}

function addQualification() {
  if (!form.value) return
  form.value.qualifications.push({
    id: newId('qual'),
    year: '',
    title: '',
    place: '',
  })
}

function addClinic() {
  if (!form.value) return
  form.value.clinics.push({
    id: newId('clinic'),
    name: '',
    address: '',
    phone: '',
    note: '',
  })
}

function removeAt<T>(list: T[], index: number, keys?: string[]) {
  list.splice(index, 1)
  keys?.splice(index, 1)
}

function addStringItem(list: string[], keys: string[]) {
  list.push('')
  keys.push(crypto.randomUUID())
}

const dragState = ref<{ list: unknown[] | null; keys: string[] | null; from: number }>({
  list: null,
  keys: null,
  from: -1,
})

function onDragStart(
  list: unknown[],
  index: number,
  event: DragEvent,
  keys: string[] | null = null,
) {
  dragState.value = { list, keys, from: index }
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  const row = (event.target as HTMLElement).closest('[data-drag-row]')
  if (row instanceof HTMLElement) {
    event.dataTransfer?.setDragImage(row, 24, 16)
  }
}

function onDragOver(list: unknown[], to: number, event: DragEvent, keys: string[] | null = null) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'

  const { list: fromList, keys: fromKeys, from } = dragState.value
  if (fromList !== list || from < 0 || from === to) return

  const el = event.currentTarget as HTMLElement | null
  if (el) {
    const rect = el.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    // Move only after crossing the midpoint — avoids flicker
    if (from < to && event.clientY < midY) return
    if (from > to && event.clientY > midY) return
  }

  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  if (keys && fromKeys === keys) {
    const [key] = keys.splice(from, 1)
    keys.splice(to, 0, key)
  }
  dragState.value = { list, keys: fromKeys, from: to }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  resetDrag()
}

function resetDrag() {
  dragState.value = { list: null, keys: null, from: -1 }
}

function isDragging(list: unknown[], index: number) {
  return dragState.value.list === list && dragState.value.from === index
}

async function save() {
  if (!form.value) return
  form.value.specialties = form.value.specialties.map((s) => s.trim()).filter(Boolean)
  form.value.manipulations = form.value.manipulations.map((s) => s.trim()).filter(Boolean)
  form.value.surgeries = form.value.surgeries.map((s) => s.trim()).filter(Boolean)
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    const saved = await $fetch<DoctorProfile>('/api/profile', {
      method: 'PUT',
      body: form.value,
    })
    form.value = structuredClone(saved)
    stringKeys.specialties = saved.specialties.map(() => crypto.randomUUID())
    stringKeys.manipulations = saved.manipulations.map(() => crypto.randomUUID())
    stringKeys.surgeries = saved.surgeries.map(() => crypto.randomUUID())
    message.value = 'Сохранено'
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="container-page py-8">
    <div
      class="sticky top-16 z-40 flex h-14 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <h1 class="font-serif text-2xl font-bold text-[var(--color-navy)]">Профиль врача</h1>
      <button
        type="button"
        class="btn-primary"
        :disabled="saving || pending || !form"
        @click="save"
      >
        {{ saving ? 'Сохранение…' : 'Сохранить' }}
      </button>
    </div>
    <p class="mb-6 mt-3 text-sm text-[var(--color-muted)]">
      Данные сайта: опыт, образование, клиники и остальное. Строки можно перетаскивать за ⠿.
    </p>

    <p v-if="pending && !form" class="text-[var(--color-muted)]">Загрузка…</p>
    <p v-if="message" class="mb-4 text-sm font-medium text-green-700">{{ message }}</p>
    <p v-if="error" class="mb-4 text-sm font-medium text-red-700" role="alert">{{ error }}</p>

    <form v-if="form" class="space-y-8" @submit.prevent="save">
      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <h2 class="sticky top-[7.5rem] z-30 border-b border-[var(--color-border)] bg-white px-5 py-3 font-serif text-xl font-bold text-[var(--color-navy)] md:px-6">
          Основное
        </h2>
        <div class="grid gap-4 p-5 pt-4 md:grid-cols-2 md:p-6 md:pt-4">
          <div>
            <label class="label-field">ФИО</label>
            <input v-model="form.fullName" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Краткое имя</label>
            <input v-model="form.shortName" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Должность</label>
            <input v-model="form.title" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Подзаголовок</label>
            <input v-model="form.subtitle" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Город</label>
            <input v-model="form.city" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Стаж (лет)</label>
            <input v-model.number="form.experienceYears" class="input-field" type="number" min="0">
          </div>
          <div>
            <label class="label-field">Цена от</label>
            <input v-model.number="form.priceFrom" class="input-field" type="number" min="0">
          </div>
          <div>
            <label class="label-field">Домен</label>
            <input v-model="form.domain" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Телефон</label>
            <input v-model="form.phone" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Телефон (href)</label>
            <input v-model="form.phoneHref" class="input-field" type="text">
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Фото (путь)</label>
            <input v-model="form.photo" class="input-field" type="text">
          </div>
          <div class="md:col-span-2">
            <label class="label-field">О враче</label>
            <textarea v-model="form.about" class="input-field min-h-24" rows="3" />
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Вступление «Помощь»</label>
            <textarea v-model="form.helpIntro" class="input-field min-h-20" rows="2" />
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Подсказка отзывов</label>
            <input v-model="form.reviewsHint" class="input-field" type="text">
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Специальности</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addStringItem(form.specialties, stringKeys.specialties)">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(_item, index) in form.specialties"
          :key="stringKeys.specialties[index]"
          data-drag-row
          class="mb-2 flex items-center gap-2 rounded-lg border border-transparent px-1 py-1 transition"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.specialties, index),
          }"
          @dragover="onDragOver(form.specialties, index, $event, stringKeys.specialties)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <button
            type="button"
            class="drag-handle"
            draggable="true"
            title="Перетащить"
            aria-label="Перетащить"
            @dragstart="onDragStart(form.specialties, index, $event, stringKeys.specialties)"
          >
            ⠿
          </button>
          <input v-model="form.specialties[index]" class="input-field min-w-0 flex-1" type="text">
          <button type="button" class="shrink-0 text-sm text-red-700" @click="removeAt(form.specialties, index, stringKeys.specialties)">
            Удалить
          </button>
        </div>
        <p v-if="!form.specialties.length" class="text-sm text-[var(--color-muted)]">Пока пусто — нажмите «Добавить».</p>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Манипуляции</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addStringItem(form.manipulations, stringKeys.manipulations)">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(_item, index) in form.manipulations"
          :key="stringKeys.manipulations[index]"
          data-drag-row
          class="mb-2 flex items-center gap-2 rounded-lg border border-transparent px-1 py-1 transition"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.manipulations, index),
          }"
          @dragover="onDragOver(form.manipulations, index, $event, stringKeys.manipulations)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <button
            type="button"
            class="drag-handle"
            draggable="true"
            title="Перетащить"
            aria-label="Перетащить"
            @dragstart="onDragStart(form.manipulations, index, $event, stringKeys.manipulations)"
          >
            ⠿
          </button>
          <input v-model="form.manipulations[index]" class="input-field min-w-0 flex-1" type="text">
          <button type="button" class="shrink-0 text-sm text-red-700" @click="removeAt(form.manipulations, index, stringKeys.manipulations)">
            Удалить
          </button>
        </div>
        <p v-if="!form.manipulations.length" class="text-sm text-[var(--color-muted)]">Пока пусто — нажмите «Добавить».</p>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Операции</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addStringItem(form.surgeries, stringKeys.surgeries)">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(_item, index) in form.surgeries"
          :key="stringKeys.surgeries[index]"
          data-drag-row
          class="mb-2 flex items-center gap-2 rounded-lg border border-transparent px-1 py-1 transition"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.surgeries, index),
          }"
          @dragover="onDragOver(form.surgeries, index, $event, stringKeys.surgeries)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <button
            type="button"
            class="drag-handle"
            draggable="true"
            title="Перетащить"
            aria-label="Перетащить"
            @dragstart="onDragStart(form.surgeries, index, $event, stringKeys.surgeries)"
          >
            ⠿
          </button>
          <input v-model="form.surgeries[index]" class="input-field min-w-0 flex-1" type="text">
          <button type="button" class="shrink-0 text-sm text-red-700" @click="removeAt(form.surgeries, index, stringKeys.surgeries)">
            Удалить
          </button>
        </div>
        <p v-if="!form.surgeries.length" class="text-sm text-[var(--color-muted)]">Пока пусто — нажмите «Добавить».</p>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Опыт</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addExperience">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(item, index) in form.experience"
          :key="item.id"
          data-drag-row
          class="mb-4 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:grid-cols-2"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.experience, index),
          }"
          @dragover="onDragOver(form.experience, index, $event)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <div>
            <label class="label-field">Должность</label>
            <input v-model="item.role" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Место работы</label>
            <input v-model="item.place" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Период</label>
            <input v-model="item.period" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Город</label>
            <input v-model="item.city" class="input-field" type="text">
          </div>
          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="button"
              class="drag-handle"
              draggable="true"
              title="Перетащить"
              aria-label="Перетащить"
              @dragstart="onDragStart(form.experience, index, $event)"
            >
              ⠿
            </button>
            <button type="button" class="text-sm text-red-700" @click="removeAt(form.experience, index)">
              Удалить
            </button>
          </div>
        </div>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Образование</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addEducation">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(item, index) in form.education"
          :key="item.id"
          data-drag-row
          class="mb-4 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:grid-cols-2"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.education, index),
          }"
          @dragover="onDragOver(form.education, index, $event)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <div>
            <label class="label-field">Год</label>
            <input v-model="item.year" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Название</label>
            <input v-model="item.title" class="input-field" type="text">
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Учебное заведение</label>
            <textarea v-model="item.place" class="input-field" rows="2" />
          </div>
          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="button"
              class="drag-handle"
              draggable="true"
              title="Перетащить"
              aria-label="Перетащить"
              @dragstart="onDragStart(form.education, index, $event)"
            >
              ⠿
            </button>
            <button type="button" class="text-sm text-red-700" @click="removeAt(form.education, index)">
              Удалить
            </button>
          </div>
        </div>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Повышение квалификации</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addQualification">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(item, index) in form.qualifications"
          :key="item.id"
          data-drag-row
          class="mb-4 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:grid-cols-2"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.qualifications, index),
          }"
          @dragover="onDragOver(form.qualifications, index, $event)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <div>
            <label class="label-field">Год</label>
            <input v-model="item.year" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Название курса</label>
            <input v-model="item.title" class="input-field" type="text">
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Организация</label>
            <textarea v-model="item.place" class="input-field" rows="2" />
          </div>
          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="button"
              class="drag-handle"
              draggable="true"
              title="Перетащить"
              aria-label="Перетащить"
              @dragstart="onDragStart(form.qualifications, index, $event)"
            >
              ⠿
            </button>
            <button type="button" class="text-sm text-red-700" @click="removeAt(form.qualifications, index)">
              Удалить
            </button>
          </div>
        </div>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-white">
        <div class="sticky top-[7.5rem] z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-5 py-3 md:px-6">
          <h2 class="font-serif text-xl font-bold text-[var(--color-navy)]">Клиники</h2>
          <button type="button" class="btn-primary !px-3 !py-2 text-sm" @click="addClinic">
            Добавить
          </button>
        </div>
        <div class="p-5 pt-4 md:p-6 md:pt-4">
        <div
          v-for="(item, index) in form.clinics"
          :key="item.id"
          data-drag-row
          class="mb-4 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:grid-cols-2"
          :class="{
            'opacity-60 ring-2 ring-[var(--color-blue)]': isDragging(form.clinics, index),
          }"
          @dragover="onDragOver(form.clinics, index, $event)"
          @drop="onDrop($event)"
          @dragend="resetDrag"
        >
          <div class="md:col-span-2">
            <label class="label-field">Название клиники</label>
            <input v-model="item.name" class="input-field" type="text">
          </div>
          <div class="md:col-span-2">
            <label class="label-field">Адрес</label>
            <input v-model="item.address" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Телефон</label>
            <input v-model="item.phone" class="input-field" type="text">
          </div>
          <div>
            <label class="label-field">Заметка</label>
            <input v-model="item.note" class="input-field" type="text">
          </div>
          <div class="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="button"
              class="drag-handle"
              draggable="true"
              title="Перетащить"
              aria-label="Перетащить"
              @dragstart="onDragStart(form.clinics, index, $event)"
            >
              ⠿
            </button>
            <button type="button" class="text-sm text-red-700" @click="removeAt(form.clinics, index)">
              Удалить
            </button>
          </div>
        </div>
        </div>
      </section>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 2.25rem;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: #fff;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:hover {
  color: var(--color-navy);
  border-color: var(--color-navy-soft);
}
</style>
