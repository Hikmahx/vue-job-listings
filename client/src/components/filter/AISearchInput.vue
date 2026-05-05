<script setup lang="ts">

import { ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { useFilterStore } from '@/stores/FilterStore'
import { useJobStore } from '@/stores/JobStore'
import { jobService } from '@/services/jobService'
import type { FilterFields } from '@/stores/FilterStore'

const STANDARD_KEYS = new Set([
  'search', 'location', 'minSalary', 'maxSalary', 'workType', 'level',
  'skills', 'markets', 'companySizes', 'contract', 'roles', 'currency',
  'timeframe', 'sortByCompany',
])

const filterStore = useFilterStore()
const jobStore = useJobStore()

const aiQuery = ref('')
const loading = ref(false)
const error = ref('')
const aiAppliedCriteria = ref<string[]>([])

const handleAISearch = async () => {
  if (loading.value || !aiQuery.value.trim()) return
  loading.value = true
  error.value = ''
  aiAppliedCriteria.value = []

  try {
    const { filters, ai_filters, ai_applied_criteria } = await jobService.parseQuery(aiQuery.value.trim())

    // Separate standard FilterModal fields from any AI-only keys
    const standard: Partial<FilterFields> = {}
    const aiBag: Record<string, unknown> = { ...(ai_filters || {}) }

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (!STANDARD_KEYS.has(key)) {
        aiBag[key] = value
        return
      }
      if (key === 'minSalary' || key === 'maxSalary') {
        ;(standard as Record<string, unknown>)[key] = typeof value === 'number' ? value : undefined
        return
      }
      if (key === 'sortByCompany') {
        ;(standard as Record<string, unknown>)[key] = typeof value === 'boolean' ? value : undefined
        return
      }
      if (['skills', 'markets', 'companySizes', 'contract', 'roles'].includes(key)) {
        ;(standard as Record<string, unknown>)[key] = Array.isArray(value) ? value : []
        return
      }
      ;(standard as Record<string, unknown>)[key] = typeof value === 'string' ? value : ''
    })

    // Apply FilterModal fields to store (pre-fills the modal)
    filterStore.setFilters(standard)

    // Store AI-only criteria (forwarded to backend on next getData call)
    filterStore.setAIFilters(aiBag)

    // Fetch jobs with the new filters applied
    await jobStore.getData(1)

    if (ai_applied_criteria?.length) {
      aiAppliedCriteria.value = ai_applied_criteria
    }
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = err.response?.data?.message || err.message || 'Failed to process search. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Submit on Enter without Shift (Shift+Enter = new line)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleAISearch()
  }
}
</script>

<template>
  <div class="space-y-4 p-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-50 rounded-lg border-2 border-gray-200">
    <div class="flex items-center gap-2">
      <Sparkles class="w-5 h-5 text-cyan-400 shrink-0" />
      <input
        v-model="aiQuery"
        type="text"
        placeholder='e.g. "Frontend developer in Nigeria, SaaS, Vue.js" or "Female founder, 20+ employees"'
        class="flex-1 border-none shadow-none focus:ring-0 focus:outline-none text-sm bg-transparent p-0 placeholder:text-gray-500 w-full text-cyan-900"
        @keydown="handleKeydown"
      />
    </div>

    <p v-if="loading" class="text-sm text-cyan-400">Searching with AI…</p>
    <p v-if="error" class="text-sm text-red-500 bg-red-50/50 p-2 rounded">{{ error }}</p>
    <p v-if="aiAppliedCriteria.length > 0" class="text-xs text-cyan-900 mt-1">
      Applied: {{ aiAppliedCriteria.join(' · ') }}
    </p>
  </div>
</template>
