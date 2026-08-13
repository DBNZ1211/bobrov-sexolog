<script setup lang="ts">
import { yearsLabel } from '~/utils/yearsLabel'
import { siteNav } from '~/data/nav'

const { doctor } = useDoctor()
const config = useRuntimeConfig()
const phone = computed(() => config.public.phone || doctor.value.phone)
const phoneHref = computed(() => config.public.phoneHref || doctor.value.phoneHref)
const year = new Date().getFullYear()

const navLinks = siteNav.filter((l) => l.to !== '/')
</script>

<template>
  <footer class="site-footer">
    <div class="container-page site-footer__grid">
      <div class="site-footer__brand">
        <p class="site-footer__name">{{ doctor.fullName }}</p>
        <p class="site-footer__role">{{ doctor.title }}</p>
        <p class="site-footer__sub">{{ doctor.subtitle }}</p>
        <p class="site-footer__meta">
          {{ doctor.city }} · стаж {{ doctor.experienceYears }}
          {{ yearsLabel(doctor.experienceYears) }}
        </p>
      </div>

      <div>
        <p class="site-footer__heading">Разделы</p>
        <ul class="site-footer__links">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="site-footer__heading">Контакты</p>
        <a :href="phoneHref" class="site-footer__phone">{{ phone }}</a>
        <p class="site-footer__note">Запись онлайн или по телефону</p>
        <p class="site-footer__note">Приём от {{ doctor.priceFrom.toLocaleString('ru-RU') }} ₽</p>
        <NuxtLink to="/zapis" class="site-footer__cta">Оставить заявку</NuxtLink>
      </div>
    </div>

    <div class="site-footer__bottom">
      <div class="container-page site-footer__bottom-inner">
        <span>© {{ year }} {{ doctor.domain }}</span>
        <span>{{ doctor.specialties.slice(0, 3).join(' · ') }}</span>
      </div>
    </div>
  </footer>
</template>
