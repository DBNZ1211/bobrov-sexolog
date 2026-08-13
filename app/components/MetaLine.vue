<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    href?: string
    muted?: boolean
  }>(),
  { muted: false },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'p'"
    :href="href"
    class="meta-line"
    :class="{
      'meta-line--muted': muted,
      'meta-line--link': Boolean(href),
    }"
  >
    <Icon :name="icon" class="meta-line__icon" aria-hidden="true" />
    <span class="meta-line__text"><slot /></span>
  </component>
</template>
