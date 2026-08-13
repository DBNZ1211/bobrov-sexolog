import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCurrentInstance, onMounted, onUnmounted } from 'vue'

let registered = false

function ensureGsap() {
  if (!import.meta.client || registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

function readPrefs() {
  if (!import.meta.client) {
    return { isMobile: true, reduced: true }
  }
  return {
    isMobile: !window.matchMedia('(min-width: 768px)').matches,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

function motionDefaults(isMobile: boolean) {
  if (isMobile) {
    return {
      duration: 0.5,
      ease: 'power2.out' as const,
      y: 20,
    }
  }
  return {
    duration: 0.9,
    ease: 'power3.out' as const,
    y: 40,
  }
}

export function revealOnScroll(
  el: HTMLElement | null,
  options?: { delay?: number },
) {
  if (!import.meta.client || !el) return () => {}

  const prefs = readPrefs()
  if (prefs.reduced) {
    el.classList.add('is-revealed')
    return () => {}
  }

  ensureGsap()
  const { duration, ease, y } = motionDefaults(prefs.isMobile)

  gsap.set(el, { autoAlpha: 0, y })

  const tween = gsap.to(el, {
    autoAlpha: 1,
    y: 0,
    duration,
    ease,
    delay: options?.delay ?? 0,
    scrollTrigger: {
      trigger: el,
      start: prefs.isMobile ? 'top 92%' : 'top 82%',
      once: true,
    },
    onComplete: () => {
      el.classList.add('is-revealed')
    },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
}

/** Staggered hero entrance for `[data-hero]` children inside root */
export function animateHero(rootEl: HTMLElement | null) {
  if (!import.meta.client || !rootEl) return () => {}

  const prefs = readPrefs()
  const items = rootEl.querySelectorAll<HTMLElement>('[data-hero]')

  if (prefs.reduced) {
    items.forEach((el) => el.classList.add('is-revealed'))
    return () => {}
  }

  ensureGsap()
  const { duration, ease } = motionDefaults(prefs.isMobile)
  const tl = gsap.timeline({ defaults: { ease } })

  gsap.set(items, {
    autoAlpha: 0,
    y: prefs.isMobile ? 14 : 28,
  })

  tl.to(items, {
    autoAlpha: 1,
    y: 0,
    duration: prefs.isMobile ? duration : duration * 0.85,
    stagger: prefs.isMobile ? 0.05 : 0.09,
  }, 0.05)

  return () => {
    tl.kill()
  }
}

export function useMotion() {
  ensureGsap()

  const isMobile = ref(false)
  const reduced = ref(false)

  const refreshPrefs = () => {
    const prefs = readPrefs()
    isMobile.value = prefs.isMobile
    reduced.value = prefs.reduced
  }

  if (import.meta.client) {
    refreshPrefs()
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      refreshPrefs()
      const mqDesktop = window.matchMedia('(min-width: 768px)')
      const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onChange = () => refreshPrefs()
      mqDesktop.addEventListener('change', onChange)
      mqMotion.addEventListener('change', onChange)
      onUnmounted(() => {
        mqDesktop.removeEventListener('change', onChange)
        mqMotion.removeEventListener('change', onChange)
      })
    })
  }

  const defaults = computed(() => motionDefaults(isMobile.value))

  return {
    gsap,
    ScrollTrigger,
    isMobile,
    reduced,
    defaults,
    revealOnScroll,
    animateHero,
  }
}
