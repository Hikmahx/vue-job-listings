<script setup lang="ts">
// import bgMobile from '@/assets/img/bg-header-desktop.svg'
// import bgDesktop from '@/assets/img/bg-header-desktop.svg'
</script>

<template>
  <div>
    <header class="h-40 md:h-[250px] w-f ull bg-cyan-400">
      <img
        src="@/assets/img/bg-header-desktop.svg"
        class="w-full lg:hidden object-cover object-right h-full"
        alt="bg-header-mobile"
      />
      <img
        src="@/assets/img/bg-header-desktop.svg"
        class="hidden lg:flex h-full"
        alt="bg-header-desktop"
      />
    </header>
  </div>
</template>
<style scoped></style>
