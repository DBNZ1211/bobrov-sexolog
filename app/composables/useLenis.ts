import type Lenis from 'lenis'

const DESKTOP_MQ = '(min-width: 768px)'

export function useLenis() {
  const nuxtApp = useNuxtApp()
  return computed(() => unref(nuxtApp.$lenis) ?? null)
}

export function scrollToHash(hash: string, offset = -48) {
  if (!import.meta.client) return
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  const el = document.getElementById(id)
  if (!el) return

  const lenis = unref(useNuxtApp().$lenis) as Lenis | null | undefined
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.1 })
    return
  }

  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function isDesktopViewport() {
  if (!import.meta.client) return false
  return window.matchMedia(DESKTOP_MQ).matches
}

export function prefersReducedMotion() {
  if (!import.meta.client) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { DESKTOP_MQ }
