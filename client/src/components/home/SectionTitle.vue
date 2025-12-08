<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="text-center mb-12 lg:mb-20">
    <h2
      class="text-2xl lg:text-3xl font-bold text-cyan-900 relative inline-block 
      after:content-[''] after:absolute after:-bottom-4 after:w-[65%] after:right-0 after:h-1 after:bg-cyan-400 after:transform after:-translate-y-2 after:rounded-full
      before:content-[''] before:absolute before:-bottom-6 before:w-[65%] before:left-0 before:h-1 before:bg-cyan-400 before:transform before:-translate-y-2 before:rounded-full
      "
    >
      {{ title }}
    </h2>
  </div>
</template>

<style scoped></style>
