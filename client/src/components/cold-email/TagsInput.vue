<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ tags: string[] }>()
const emit = defineEmits<{ add: [tag: string]; remove: [index: number] }>()
const tagInput = ref('')
const handleAdd = () => {
  const t = tagInput.value.trim()
  if (t) { emit('add', t); tagInput.value = '' }
}
</script>
<template>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Tags</label>
    <div class="flex flex-wrap gap-2 mb-2">
      <span v-for="(t, i) in tags" :key="i"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        {{ t }}
        <button type="button" class="text-slate-500 hover:text-red-600" @click="emit('remove', i)">&times;</button>
      </span>
    </div>
    <div class="flex gap-2">
      <input v-model="tagInput" type="text" placeholder="Add tag (e.g. Hot Lead)"
        class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
        @keydown.enter.prevent="handleAdd" />
      <button type="button" class="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700" @click="handleAdd">Add</button>
    </div>
  </div>
</template>
