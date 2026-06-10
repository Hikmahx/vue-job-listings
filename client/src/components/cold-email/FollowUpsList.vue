<script setup lang="ts">
import FormSection from './FormSection.vue'
import type { ColdEmailFollowUp } from '@/types/coldEmail'
function fmt(v: string | undefined): string {
  if (!v) return ''
  const s = String(v).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}
const props = defineProps<{ followUps: ColdEmailFollowUp[] }>()
const emit = defineEmits<{
  update: [index: number, patch: Partial<ColdEmailFollowUp>]
  add: []
  remove: [index: number]
}>()

function onDateChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', index, { date: target.value || '' })
}

function onReadChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', index, { read: target.checked })
}
</script>
<template>
  <FormSection title="Follow-ups" :highlight="true">
    <template #action>
      <button
        v-if="followUps.length < 4"
        type="button"
        class="text-sm text-cyan-400 hover:text-cyan-500 hover:underline flex items-center gap-1"
        @click="emit('add')"
      >
        + Add follow-up
      </button>
    </template>
    <div v-for="(fu, i) in followUps" :key="i" class="flex items-center gap-3 flex-wrap">
      <span class="text-xs font-medium text-slate-500 w-16">Flw-up {{ i + 1 }}</span>
      <input
        type="date"
        :value="fmt(fu.date)"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
        @change="onDateChange(i, $event)"
      />
      <label class="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          :checked="!!fu.read"
          class="rounded border-slate-300 text-cyan-600"
          @change="onReadChange(i, $event)"
        />
        Read
      </label>
      <button
        v-if="followUps.length > 1"
        type="button"
        class="p-1 text-slate-400 hover:text-red-600"
        @click="emit('remove', i)"
      >
        ✕
      </button>
    </div>
  </FormSection>
</template>
