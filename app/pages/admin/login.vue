<script setup lang="ts">
definePageMeta({
  layout: false,
  pageTransition: false,
})

useSeoMeta({ title: 'Вход в админку', robots: 'noindex, nofollow' })

const username = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

const { data: me } = await useFetch('/api/auth/me')
if (me.value?.authenticated) {
  await navigateTo('/admin')
}

async function login() {
  error.value = ''
  pending.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await navigateTo('/admin')
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value =
      err?.data?.statusMessage || err?.statusMessage || 'Ошибка входа'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
    <form
      class="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8"
      @submit.prevent="login"
    >
      <h1 class="font-serif text-2xl font-bold text-[var(--color-navy)]">Админ-панель</h1>
      <p class="mt-2 text-sm text-[var(--color-muted)]">Вход по логину и паролю</p>

      <div class="mt-6 space-y-4">
        <div>
          <label class="label-field" for="admin-user">Логин</label>
          <input
            id="admin-user"
            v-model="username"
            class="input-field"
            type="text"
            autocomplete="username"
            required
          >
        </div>
        <div>
          <label class="label-field" for="admin-pass">Пароль</label>
          <input
            id="admin-pass"
            v-model="password"
            class="input-field"
            type="password"
            autocomplete="current-password"
            required
          >
        </div>
      </div>

      <p v-if="error" class="mt-4 text-sm font-medium text-red-700" role="alert">{{ error }}</p>

      <button type="submit" class="btn-primary mt-6 w-full" :disabled="pending">
        {{ pending ? 'Вход…' : 'Войти' }}
      </button>

      <a href="/" class="mt-4 inline-block text-sm text-[var(--color-blue)] hover:underline">На сайт</a>
    </form>
  </div>
</template>
