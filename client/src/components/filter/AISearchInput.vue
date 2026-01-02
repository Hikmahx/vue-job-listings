<script setup lang="ts">
import { ref } from 'vue'
import { useFilterStore } from '@/stores/FilterStore'
import { useJobStore } from '@/stores/JobStore'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles } from 'lucide-vue-next'
import axios from 'axios'
import Input from '../ui/input/Input.vue'

const filterStore = useFilterStore()
const jobStore = useJobStore()

const aiQuery = ref('')
const loading = ref(false)
const error = ref('')

const handleAISearch = async () => {
  if (loading.value || !aiQuery.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    // Enable AI mode and KEEP IT ON
    filterStore.setAIMode(true)

    const response = await axios.post('http://127.0.0.1:8000/api/jobs/ai-search/', {
      query: aiQuery.value,
    })

    // Sync extracted filters to UI
    filterStore.setFilters(response.data.extracted_filters)

    // Directly update jobs list
    jobStore.jobs = response.data.jobs

    console.log('AI Search Results:', {
      filters: response.data.extracted_filters,
      count: response.data.count,
    })
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to process search. Please try again.'
    console.error('AI search error:', err)
  } finally {
    loading.value = false
    // REMOVED: setTimeout(() => filterStore.setAIMode(false), 500)
    // aiMode stays TRUE until user manually switches or clears
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Enter or Ctrl + Enter submits
  if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
    e.preventDefault()
    handleAISearch()
  }
}
</script>

<template>
  <div
    class="space-y-4 p-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-50 rounded-lg border-2 border-grayish-cyan"
  >
    <div class="flex items-start gap-2">
      <Sparkles class="w-5 h-5 text-cyan-400" />
      <!-- <h3 class="font-semibold text-cyan-900">AI-Powered Search</h3> -->
      <Input
        v-model="aiQuery"
        placeholder='Try: "Senior Frontend developer in Nigeria with Vue.js experience, remote work, SaaS companies"'
        class="border-none shadow-none focus:ring-0 focus:outline-none text-sm bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 
        "
        @keydown="handleKeydown"
      />
    </div>


    <!-- <p class="text-xs text-gray-500">
      Press <b>Enter</b> or <b>Ctrl + Enter</b> to search · <b>Shift + Enter</b> for new line
    </p> -->

    <p v-if="loading" class="text-sm text-cyan-400">Searching with AI…</p>

    <p v-if="error" class="text-sm text-red-500 bg-red-50/50 p-2 rounded">
      {{ error }}
    </p>
  </div>
</template>
