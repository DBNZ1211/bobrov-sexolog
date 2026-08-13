<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    eyebrow?: string
    meta?: string
  }>(),
  {
    title: 'Бобров В. Т.',
    description: '',
    eyebrow: 'Бобров В. Т.',
    meta: 'Сергиев Посад · врач-уролог',
  },
)
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      padding: 72px 80px;
      background: #1a2b48;
      color: #ffffff;
      font-family: Manrope, sans-serif;
    "
  >
    <div
      style="
        position: absolute;
        right: -80px;
        top: -120px;
        width: 420px;
        height: 420px;
        border-radius: 9999px;
        background: #2a3f66;
        opacity: 0.7;
      "
    />
    <div
      style="
        position: absolute;
        right: 80px;
        bottom: -140px;
        width: 320px;
        height: 320px;
        border-radius: 9999px;
        background: #3b6ea5;
        opacity: 0.28;
      "
    />

    <div style="display: flex; flex-direction: column; max-width: 920px;">
      <p style="margin: 0; color: #8eb4d8; font-size: 28px; font-weight: 600; letter-spacing: 0.02em;">
        {{ eyebrow }}
      </p>
      <h1
        style="
          margin: 18px 0 0;
          font-family: Literata, serif;
          font-size: 68px;
          font-weight: 700;
          line-height: 1.12;
          letter-spacing: -0.02em;
        "
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        style="margin: 22px 0 0; color: #c5d4e8; font-size: 28px; line-height: 1.4; font-weight: 400;"
      >
        {{ description }}
      </p>
    </div>

    <p style="margin: 0; color: #8eb4d8; font-size: 24px; font-weight: 600;">
      {{ meta }}
    </p>
  </div>
</template>
