<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { yearsLabel } from '~/utils/yearsLabel'
import { animateHero } from '~/composables/useMotion'

const { doctor } = useDoctor()
const config = useRuntimeConfig()
const phone = computed(() => config.public.phone || doctor.value.phone)
const phoneHref = computed(() => config.public.phoneHref || doctor.value.phoneHref)

const rootRef = ref<HTMLElement | null>(null)
const bgRef = ref<HTMLElement | null>(null)

const HERO_BG = '/images/doctor_hero_background.png'

onMounted(() => {
  const stopHero = animateHero(rootRef.value)

  let stopParallax = () => {}
  if (import.meta.client && bgRef.value && rootRef.value) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger)
      const tween = gsap.fromTo(
        bgRef.value,
        { yPercent: -8 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.value,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
      stopParallax = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }
  }

  onUnmounted(() => {
    stopHero()
    stopParallax()
  })
})
</script>

<template>
  <section
    id="o-vrahe"
    ref="rootRef"
    class="hero relative isolate overflow-hidden"
  >
    <div class="hero-bg pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div ref="bgRef" class="hero-bg-shift absolute inset-x-0 -top-[12%] h-[124%] w-full will-change-transform">
        <img
          :src="HERO_BG"
          alt=""
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
          class="hero-bg-img h-full w-full object-cover object-left"
        >
      </div>
    </div>
    <div class="hero-wash pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
    <div class="hero-orb hero-orb--a z-[1]" aria-hidden="true" />
    <div class="hero-orb hero-orb--b z-[1]" aria-hidden="true" />
    <div class="hero-orb hero-orb--c z-[1]" aria-hidden="true" />

    <div class="hero-stage relative z-[2] min-h-[min(88svh,44rem)]">
      <div
        data-hero
        class="hero-portrait pointer-events-none absolute inset-x-0 top-0 z-[1] flex h-[min(48svh,20rem)] items-end justify-center sm:h-[min(50svh,22rem)] md:inset-y-0 md:left-[40%] md:right-0 md:h-auto md:justify-end"
      >
        <img
          :src="doctor.photo"
          :alt="doctor.fullName"
          width="559"
          height="774"
          loading="eager"
          decoding="async"
          class="hero-portrait-img h-full w-auto max-h-full max-w-[min(100%,18rem)] object-contain object-bottom sm:max-w-[20rem] md:max-w-none md:w-auto md:pr-1 lg:pr-3"
        >
      </div>

      <div class="container-page relative z-[2] grid min-h-[inherit] items-end pb-12 pt-[min(48svh,20rem)] sm:pt-[min(50svh,22rem)] md:grid-cols-12 md:items-center md:py-16 md:pt-16 lg:py-20">
        <div class="hero-copy md:col-span-6 md:max-w-xl lg:col-span-5">
          <h1
            data-hero
            class="font-serif text-[2.35rem] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--color-navy)] sm:text-5xl lg:text-[3.5rem]"
          >
            <span class="block">Бобров</span>
            <span class="block">Василий</span>
            <span class="block">Тихонович</span>
          </h1>

          <p
            data-hero
            class="mt-5 font-serif text-xl font-semibold text-[var(--color-navy-soft)] md:text-2xl"
          >
            {{ doctor.subtitle }}
          </p>

          <p
            data-hero
            class="mt-4 flex items-center gap-2 text-[0.95rem] font-medium text-[var(--color-navy-soft)] md:text-base"
          >
            <svg class="h-4 w-4 shrink-0 text-[var(--color-blue)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" stroke="currentColor" stroke-width="1.7" />
              <circle cx="12" cy="10" r="2.2" stroke="currentColor" stroke-width="1.7" />
            </svg>
            {{ doctor.city }}
          </p>

          <div data-hero class="hero-rule my-6 h-px w-24 bg-[var(--color-border)] md:my-7" />

          <p data-hero class="text-[0.95rem] font-medium text-[var(--color-navy-soft)] md:text-base">
            стаж {{ doctor.experienceYears }} {{ yearsLabel(doctor.experienceYears) }}
            <span class="mx-2 text-[var(--color-navy)]/35">·</span>
            от {{ doctor.priceFrom.toLocaleString('ru-RU') }} ₽
          </p>

          <div data-hero class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <NuxtLink to="/zapis" class="btn-primary btn-primary--lg">
              Записаться
            </NuxtLink>
            <a :href="phoneHref" class="hero-phone inline-flex items-center gap-2 text-[1.05rem] font-semibold text-[var(--color-navy)]">
              <svg class="h-4 w-4 text-[var(--color-blue)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7.5 4.5h3l1.2 4.2-1.8 1.2a12.5 12.5 0 0 0 5.2 5.2l1.2-1.8 4.2 1.2v3A1.5 1.5 0 0 1 19 19 14.5 14.5 0 0 1 5 5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              </svg>
              {{ phone }}
            </a>
          </div>

          <p data-hero class="mt-10 hidden items-center gap-2 text-sm font-medium text-[var(--color-navy-soft)] sm:flex">
            <svg class="h-3.5 w-3.5 text-[var(--color-blue)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke="currentColor" stroke-width="1.5" />
            </svg>
            {{ doctor.domain }}
          </p>
        </div>
      </div>
    </div>

    <div class="hero-trust relative z-[2] border-t border-[var(--color-border)]/70 bg-white/80">
      <div class="container-page flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm text-[var(--color-navy-soft)]">
        <span class="font-semibold text-[var(--color-navy)]">{{ doctor.title }}</span>
        <span class="text-[var(--color-navy)]/35">·</span>
        <span class="font-medium">{{ doctor.specialties.slice(0, 3).join(', ') }}</span>
      </div>
    </div>
  </section>
</template>
