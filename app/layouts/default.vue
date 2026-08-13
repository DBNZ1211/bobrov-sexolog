<script setup lang="ts">
useSiteSchema()
</script>

<template>
  <div class="site-shell">
    <SiteHeader />
    <main>
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
