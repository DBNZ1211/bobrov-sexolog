import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DESKTOP_MQ, prefersReducedMotion } from '~/composables/useLenis'

import 'lenis/dist/lenis.css'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  const lenisRef = shallowRef<Lenis | null>(null)
  let rafId = 0
  let scrollHandler: (() => void) | null = null
  let mq: MediaQueryList | null = null

  const route = useRoute()

  const shouldEnable = () => {
    if (route.path.startsWith('/admin')) return false
    if (prefersReducedMotion()) return false
    if (!window.matchMedia(DESKTOP_MQ).matches) return false
    return true
  }

  const destroyLenis = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (lenisRef.value && scrollHandler) {
      lenisRef.value.off('scroll', scrollHandler)
    }
    scrollHandler = null
    lenisRef.value?.destroy()
    lenisRef.value = null
    document.documentElement.classList.remove('lenis-active')
    ScrollTrigger.refresh()
  }

  const raf = (time: number) => {
    lenisRef.value?.raf(time)
    rafId = requestAnimationFrame(raf)
  }

  const createLenis = () => {
    if (lenisRef.value || !shouldEnable()) return

    const instance = new Lenis({
      autoRaf: false,
      allowNestedScroll: true,
      anchors: false,
      smoothWheel: true,
      syncTouch: false,
    })

    scrollHandler = () => {
      ScrollTrigger.update()
    }
    instance.on('scroll', scrollHandler)

    gsap.ticker.lagSmoothing(0)
    rafId = requestAnimationFrame(raf)

    lenisRef.value = instance
    document.documentElement.classList.add('lenis-active')
    document.documentElement.classList.add('motion-ready')
    ScrollTrigger.refresh()
  }

  const sync = () => {
    if (shouldEnable()) {
      if (!lenisRef.value) createLenis()
    } else {
      destroyLenis()
      document.documentElement.classList.add('motion-ready')
    }
  }

  const onMqChange = () => sync()

  nuxtApp.hook('app:mounted', () => {
    mq = window.matchMedia(DESKTOP_MQ)
    mq.addEventListener('change', onMqChange)
    sync()
  })

  watch(
    () => route.path,
    () => {
      nextTick(() => {
        if (lenisRef.value) {
          lenisRef.value.scrollTo(0, { immediate: true })
        } else {
          window.scrollTo(0, 0)
        }
        ScrollTrigger.getAll().forEach((t) => t.refresh())
        sync()
      })
    },
  )

  if (import.meta.client) {
    window.addEventListener('beforeunload', destroyLenis)
  }

  return {
    provide: {
      lenis: lenisRef,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $lenis: import('vue').Ref<Lenis | null>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $lenis: import('vue').Ref<Lenis | null>
  }
}
