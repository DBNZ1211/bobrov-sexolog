<script setup lang="ts">
const { doctor } = useDoctor()

withDefaults(
  defineProps<{
    embed?: boolean
  }>(),
  { embed: false },
)

const config = useRuntimeConfig()
const route = useRoute()
const phone = computed(() => config.public.phone || doctor.value.phone)
const phoneHref = computed(() => config.public.phoneHref || doctor.value.phoneHref)

const form = reactive({
  name: '',
  phone: '',
  clinicId: '',
  comment: '',
})

const pending = ref(false)
const success = ref(false)
const error = ref('')

const clinics = computed(() => doctor.value.clinics)
const selectedClinic = computed(
  () => clinics.value.find((c) => c.id === form.clinicId) || null,
)

const clinicOptions = computed(() => [
  {
    value: '',
    label: 'Не важно / уточним при звонке',
    description: 'Подберём клинику вместе при звонке',
  },
  ...clinics.value.map((clinic) => ({
    value: clinic.id,
    label: clinic.name,
    description: clinic.address,
  })),
])

function applyClinicFromQuery() {
  const raw = route.query.clinic
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id || typeof id !== 'string') return
  if (clinics.value.some((c) => c.id === id)) {
    form.clinicId = id
  }
}

applyClinicFromQuery()
watch(() => route.query.clinic, applyClinicFromQuery)

const steps = [
  {
    icon: 'lucide:phone',
    title: 'Оставьте контакты',
    text: 'Имя и телефон — этого достаточно для первого ответа.',
  },
  {
    icon: 'lucide:clock',
    title: 'Согласуем время',
    text: 'Перезвоним и подберём удобный слот в одной из клиник.',
  },
  {
    icon: 'lucide:shield-check',
    title: 'Конфиденциально',
    text: 'Данные заявки используются только для связи с вами.',
  },
]

function buildComment() {
  const parts: string[] = []
  if (selectedClinic.value) {
    parts.push(`Клиника: ${selectedClinic.value.name}`)
    if (selectedClinic.value.address) {
      parts.push(selectedClinic.value.address)
    }
  }
  const note = form.comment.trim()
  if (note) parts.push(note)
  return parts.join('\n').slice(0, 1000)
}

async function submit() {
  error.value = ''
  success.value = false
  pending.value = true
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        name: form.name,
        phone: form.phone,
        comment: buildComment(),
      },
    })
    success.value = true
    form.name = ''
    form.phone = ''
    form.comment = ''
    // keep clinicId so user can send another request to the same clinic
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      'Не удалось отправить заявку. Позвоните напрямую.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="section bg-white">
    <div class="container-page grid gap-10 lg:grid-cols-2 lg:items-start">
      <div>
        <h2 v-if="!embed" class="section-title">Запись на приём</h2>
        <p class="mb-6 text-lg leading-relaxed text-[var(--color-text)]">
          Оставьте заявку — перезвоним и согласуем удобное время.
        </p>

        <ul class="mb-8 space-y-4">
          <li
            v-for="step in steps"
            :key="step.title"
            class="flex items-start gap-3"
          >
            <span class="icon-badge" aria-hidden="true">
              <Icon :name="step.icon" />
            </span>
            <div>
              <p class="font-semibold text-[var(--color-navy)]">{{ step.title }}</p>
              <p class="mt-0.5 text-sm leading-relaxed text-[var(--color-muted)]">
                {{ step.text }}
              </p>
            </div>
          </li>
        </ul>

        <p class="text-base text-[var(--color-muted)]">Телефон для записи:</p>
        <a
          :href="phoneHref"
          class="mt-2 inline-flex items-center gap-2.5 text-2xl font-semibold text-[var(--color-blue)] transition hover:text-[var(--color-navy)]"
        >
          <span class="icon-badge" aria-hidden="true">
            <Icon name="lucide:phone" />
          </span>
          {{ phone }}
        </a>
      </div>

      <form
        class="surface-card rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:p-7"
        data-lenis-prevent
        @submit.prevent="submit"
      >
        <div class="mb-5 flex items-center gap-3">
          <span class="icon-badge" aria-hidden="true">
            <Icon name="lucide:clipboard-list" />
          </span>
          <h3 class="text-lg font-bold text-[var(--color-navy)]">Заявка</h3>
        </div>

        <div
          v-if="selectedClinic"
          class="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-3"
        >
          <span class="icon-badge shrink-0" aria-hidden="true">
            <Icon name="lucide:building-2" />
          </span>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Выбранная клиника
            </p>
            <p class="mt-0.5 font-semibold text-[var(--color-navy)]">
              {{ selectedClinic.name }}
            </p>
            <p class="mt-0.5 text-sm text-[var(--color-muted)]">
              {{ selectedClinic.address }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="label-field" for="lead-name">Имя</label>
            <input
              id="lead-name"
              v-model="form.name"
              class="input-field"
              type="text"
              name="name"
              autocomplete="name"
              required
              maxlength="120"
              placeholder="Как к вам обращаться"
            >
          </div>
          <div>
            <label class="label-field" for="lead-phone">Телефон</label>
            <input
              id="lead-phone"
              v-model="form.phone"
              class="input-field"
              type="tel"
              name="phone"
              autocomplete="tel"
              required
              placeholder="+7 ..."
            >
          </div>
          <div>
            <label class="label-field" for="lead-clinic">Клиника</label>
            <AppSelect
              id="lead-clinic"
              v-model="form.clinicId"
              name="clinic"
              :options="clinicOptions"
              placeholder="Выберите клинику"
            />
          </div>
          <div>
            <label class="label-field" for="lead-comment">Комментарий</label>
            <textarea
              id="lead-comment"
              v-model="form.comment"
              class="input-field min-h-28 resize-y"
              name="comment"
              maxlength="1000"
              placeholder="Удобное время или вопрос (необязательно)"
            />
          </div>
        </div>

        <p v-if="error" class="mt-4 text-sm font-medium text-red-700" role="alert">{{ error }}</p>
        <p v-if="success" class="mt-4 text-sm font-medium text-emerald-700" role="status">
          Заявка отправлена. Мы свяжемся с вами.
        </p>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="pending">
          {{ pending ? 'Отправка…' : 'Отправить заявку' }}
        </button>
      </form>
    </div>
  </section>
</template>
