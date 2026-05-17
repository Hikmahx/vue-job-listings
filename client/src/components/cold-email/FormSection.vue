<script setup lang="ts">
defineProps<{ title: string; highlight?: boolean }>()
</script>
<template>
  <div :class="['border border-slate-200 rounded-lg p-4 space-y-3', highlight ? 'bg-slate-50/50' : '']">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-700">{{ title }}</h3>
      <slot name="action" />
    </div>
    <slot />
  </div>
</template>
