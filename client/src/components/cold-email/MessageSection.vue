<script setup lang="ts">
import FormSection from './FormSection.vue'
import type { ColdEmailMessage } from '@/types/coldEmail'
function fmt(v: string | undefined): string {
  if (!v) return ''
  const s = String(v).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}
const props = defineProps<{ message: Partial<ColdEmailMessage> | undefined }>()
const emit = defineEmits<{ update: [patch: Partial<ColdEmailMessage>] }>()
</script>
<template>
  <FormSection title="Message" :highlight="true">
    <div>
      <label class="block text-xs font-medium text-slate-500 mb-1">Subject</label>
      <input type="text" :value="message?.subject ?? ''" placeholder="Email subject"
        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        @input="emit('update', { subject: ($event.target as HTMLInputElement).value })" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Date sent</label>
        <input type="date" :value="fmt(message?.date)"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
          @change="emit('update', { date: ($event.target as HTMLInputElement).value || '' })" />
      </div>
      <div class="flex items-end gap-4">
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" :checked="!!message?.read" class="rounded border-slate-300 text-cyan-600"
            @change="emit('update', { read: ($event.target as HTMLInputElement).checked })" />
          Read
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" :checked="!!message?.response" class="rounded border-slate-300 text-cyan-600"
            @change="emit('update', { response: ($event.target as HTMLInputElement).checked })" />
          Response
        </label>
      </div>
    </div>
    <div>
      <label class="block text-xs font-medium text-slate-500 mb-1">Email sent (content)</label>
      <textarea :value="message?.emailSent ?? ''" rows="3" placeholder="Paste or type the email you sent…"
        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        @input="emit('update', { emailSent: ($event.target as HTMLTextAreaElement).value })" />
    </div>
  </FormSection>
</template>
