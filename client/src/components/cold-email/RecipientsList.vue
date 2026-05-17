<script setup lang="ts">
import type { ColdEmailRecipient } from '@/types/coldEmail'
const props = defineProps<{ recipients: ColdEmailRecipient[] }>()
const emit = defineEmits<{
  update: [index: number, patch: Partial<ColdEmailRecipient>]
  add: []
  remove: [index: number]
}>()

const updateRecipientFullName = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', index, { fullName: target.value })
}

const updateRecipientEmail = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', index, { email: target.value })
}
</script>
<template>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
    <div v-for="(r, i) in recipients" :key="i" class="flex gap-2 items-start mb-2">
      <input
        type="text"
        :value="r.fullName"
        placeholder="Full name"
        class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        @input="updateRecipientFullName(i, $event)"
      />
      <input
        type="email"
        :value="r.email"
        placeholder="Email"
        class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        @input="updateRecipientEmail(i, $event)"
      />
      <button
        type="button"
        class="p-2 text-slate-400 hover:text-red-600"
        title="Remove"
        @click="emit('remove', i)"
      >
        ✕
      </button>
    </div>
    <button
      type="button"
      class="text-sm text-cyan-400 hover:text-cyan-500 hover:underline flex items-center gap-1"
      @click="emit('add')"
    >
      + Add recipient
    </button>
  </div>
</template>
