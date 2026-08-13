<script setup lang="ts">
export type SelectOption = {
  value: string
  label: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: SelectOption[]
    id?: string
    name?: string
    placeholder?: string
  }>(),
  {
    id: undefined,
    name: undefined,
    placeholder: 'Выберите…',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const GAP = 8
const VIEW_PAD = 8
const MAX_LIST_HEIGHT = 256

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
const listId = useId()
const activeIndex = ref(-1)

const menuStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px',
  maxHeight: `${MAX_LIST_HEIGHT}px`,
  bottom: 'auto',
})
const placedAbove = ref(false)

const selected = computed(
  () => props.options.find((o) => o.value === props.modelValue) || null,
)

const displayLabel = computed(() => selected.value?.label || props.placeholder)

function updatePosition() {
  const el = trigger.value
  if (!el || typeof window === 'undefined') return

  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const width = Math.min(rect.width, vw - VIEW_PAD * 2)
  let left = rect.left
  left = Math.min(Math.max(VIEW_PAD, left), vw - width - VIEW_PAD)

  const spaceBelow = vh - rect.bottom - GAP - VIEW_PAD
  const spaceAbove = rect.top - GAP - VIEW_PAD
  const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow
  const available = Math.max(120, placeAbove ? spaceAbove : spaceBelow)
  const maxHeight = Math.min(MAX_LIST_HEIGHT, available)
  placedAbove.value = placeAbove

  if (placeAbove) {
    menuStyle.value = {
      top: 'auto',
      bottom: `${Math.round(vh - rect.top + GAP)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(width)}px`,
      maxHeight: `${Math.round(maxHeight)}px`,
    }
  } else {
    menuStyle.value = {
      top: `${Math.round(rect.bottom + GAP)}px`,
      bottom: 'auto',
      left: `${Math.round(left)}px`,
      width: `${Math.round(width)}px`,
      maxHeight: `${Math.round(maxHeight)}px`,
    }
  }
}

function close() {
  open.value = false
  activeIndex.value = -1
}

async function openList() {
  open.value = true
  const idx = props.options.findIndex((o) => o.value === props.modelValue)
  activeIndex.value = idx >= 0 ? idx : 0
  await nextTick()
  updatePosition()
}

function toggle() {
  if (open.value) close()
  else void openList()
}

function select(option: SelectOption) {
  emit('update:modelValue', option.value)
  close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (open.value) {
      e.preventDefault()
      close()
    }
    return
  }

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (!open.value) {
      void openList()
      return
    }
    const option = props.options[activeIndex.value]
    if (option) select(option)
    return
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) {
      void openList()
      return
    }
    const delta = e.key === 'ArrowDown' ? 1 : -1
    const next = activeIndex.value + delta
    if (next < 0) activeIndex.value = props.options.length - 1
    else if (next >= props.options.length) activeIndex.value = 0
    else activeIndex.value = next
  }
}

function onDocPointer(e: PointerEvent) {
  if (!open.value) return
  const target = e.target as Node
  if (root.value?.contains(target) || listEl.value?.contains(target)) return
  close()
}

function onReposition() {
  if (open.value) updatePosition()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  window.removeEventListener('resize', onReposition)
  window.removeEventListener('scroll', onReposition, true)
})
</script>

<template>
  <div ref="root" class="app-select" :class="{ 'is-open': open }">
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="modelValue"
    >
    <button
      :id="id"
      ref="trigger"
      type="button"
      class="app-select__trigger"
      :aria-expanded="open"
      :aria-controls="listId"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span
        class="app-select__value"
        :class="{ 'is-placeholder': !selected }"
      >
        {{ displayLabel }}
      </span>
      <Icon
        name="lucide:chevron-down"
        class="app-select__chevron"
        aria-hidden="true"
      />
    </button>

    <Teleport to="body">
      <Transition name="app-select-menu">
        <ul
          v-if="open"
          :id="listId"
          ref="listEl"
          class="app-select__list"
          :class="{ 'is-above': placedAbove }"
          role="listbox"
          :style="menuStyle"
          :aria-activedescendant="
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          "
        >
          <li
            v-for="(option, index) in options"
            :id="`${listId}-opt-${index}`"
            :key="option.value || `empty-${index}`"
            role="option"
            class="app-select__option"
            :class="{
              'is-selected': option.value === modelValue,
              'is-active': index === activeIndex,
            }"
            :aria-selected="option.value === modelValue"
            @pointerdown.prevent="select(option)"
            @mouseenter="activeIndex = index"
          >
            <span class="app-select__option-main">
              <span class="app-select__option-label">{{ option.label }}</span>
              <span
                v-if="option.description"
                class="app-select__option-desc"
              >
                {{ option.description }}
              </span>
            </span>
            <Icon
              v-if="option.value === modelValue"
              name="lucide:check"
              class="app-select__check"
              aria-hidden="true"
            />
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
