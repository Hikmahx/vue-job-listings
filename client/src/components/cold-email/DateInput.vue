<script setup lang="ts">
function fmt(v: string | undefined): string {
  if (!v) return ''
  const s = String(v).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}
const props = defineProps<{ label?: string; modelValue: string | undefined; required?: boolean }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <div>
    <label v-if="label" class="block text-xs font-medium text-slate-500 mb-1">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      type="date"
      :value="fmt(modelValue)"
      class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).value || '')"
    />
  </div>
</template>
