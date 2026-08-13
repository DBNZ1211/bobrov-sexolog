import type { Directive } from 'vue'
import { revealOnScroll } from '~/composables/useMotion'

export default defineNuxtPlugin((nuxtApp) => {
  const cleanups = new WeakMap<HTMLElement, () => void>()

  const reveal: Directive<HTMLElement, { delay?: number } | undefined> = {
    mounted(el, binding) {
      if (!import.meta.client) return
      requestAnimationFrame(() => {
        const stop = revealOnScroll(el, binding.value || undefined)
        cleanups.set(el, stop)
      })
    },
    unmounted(el) {
      if (!import.meta.client) return
      cleanups.get(el)?.()
      cleanups.delete(el)
    },
    getSSRProps() {
      return {}
    },
  }

  nuxtApp.vueApp.directive('reveal', reveal)
})
