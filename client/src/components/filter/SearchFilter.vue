<script setup lang="ts">

import { watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Sparkles, ArrowLeftRight } from 'lucide-vue-next'
import { useFilterStore } from '@/stores/FilterStore'
import { useJobStore } from '@/stores/JobStore'
import Filter from './Filter.vue'
import FilterModal from './FilterModal.vue'
import SearchAndCountry from './SearchAndCountry.vue'
import AISearchInput from './AISearchInput.vue'

const filterStore = useFilterStore()
const jobStore = useJobStore()
const route = useRoute()
const router = useRouter()

const { search, location, sortByCompany, aiMode } = storeToRefs(filterStore)
const totalCount = computed(() => jobStore.totalCount)

// Load from URL params on mount and navigation
onMounted(() => {
  const query = route.query as Record<string, string>
  if (Object.keys(query).length > 0) {
    filterStore.loadFromObject(query)
  }
})

watch(
  () => route.query,
  (query) => {
    if (Object.keys(query).length > 0) {
      filterStore.loadFromObject(query as Record<string, string>)
    }
  },
  { deep: true },
)

// Update URL when filters change
watch(
  () => filterStore.toQueryObject(),
  (queryObj) => {
    const urlQuery: Record<string, string> = { ...queryObj }
    if (aiMode.value) urlQuery.aiMode = 'true'
    router.replace({ query: urlQuery })
  },
  { deep: true },
)

// Fetch jobs when filter state changes
watch(
  () => ({
    search: search.value,
    location: location.value,
    sortByCompany: sortByCompany.value,
    aiMode: aiMode.value,
    workType: filterStore.workType,
    level: filterStore.level,
    minSalary: filterStore.minSalary,
    maxSalary: filterStore.maxSalary,
    currency: filterStore.currency,
    timeframe: filterStore.timeframe,
    skills: [...filterStore.skills],
    markets: [...filterStore.markets],
    roles: [...filterStore.roles],
    companySizes: [...filterStore.companySizes],
    contract: [...filterStore.contract],
  }),
  () => {
    // Don't auto-fetch in aiMode — AISearchInput controls fetching via parseQuery
    if (!aiMode.value) {
      jobStore.getData(1)
    }
  },
  { deep: true },
)

const toggleSearchMode = () => {
  const newMode = !aiMode.value
  filterStore.setAIMode(newMode) // also clears aiFilters when switching off
  if (!newMode) {
    jobStore.getData(1)
  }
}

const handleFormSubmit = (e: Event) => {
  e.preventDefault()
  jobStore.getData(1)
}

const onSortChange = (event: Event) => {
  filterStore.setSortByCompany((event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div class="px-4 lg:px-10 w-full max-w-3xl lg:max-w-6xl m-auto">
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-8 -mt-12 lg:-mt-20 relative z-20 w-full">
      <div class="w-full flex">
        <!-- AI Search Mode -->
        <div v-if="aiMode" class="w-full">
          <AISearchInput />
        </div>

        <!-- Regular Search Mode -->
        <div v-else class="w-full">
          <form class="mb-6" @submit.prevent="handleFormSubmit">
            <SearchAndCountry />
            <button type="submit" class="sr-only">Apply Search</button>
          </form>
        </div>
      </div>

      <!-- Filters (shown in both modes) -->
      <div class="mt-6">
        <Filter />
      </div>

      <!-- Results count + sorting + FilterModal toggle -->
      <div
        class="flex flex-wrap md:flex-nowrap flex-col md:flex-row items-center justify-between pt-6 mt-6 border-t gap-8"
      >
        <div class="flex items-center gap-2 w-full">
          <!-- Toggle AI / Regular -->
          <div class="flex">
            <button
              type="button"
              class="group flex items-center h-12 gap-2 mr-4 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              :title="aiMode ? 'Switch to Regular Search' : 'Switch to AI Search'"
              @click="toggleSearchMode"
            >
              <ArrowLeftRight
                :class="['w-4 h-4 transition-transform duration-300', !aiMode ? 'rotate-180 text-cyan-400' : '']"
              />
              <span
                :class="['flex items-center gap-1 text-xs relative', !aiMode ? 'text-cyan-400' : 'text-cyan-900']"
              >
                <Sparkles v-if="!aiMode" class="w-2.5 h-2.5 absolute -top-2.5 -right-2.5" />
                {{ !aiMode ? 'AI' : 'Regular' }}
              </span>
            </button>
          </div>

          <!-- Live result count from jobStore (no hardcoded value) -->
          <span
            class="relative mr-6 after:content-['.'] after:ml-1 after:text-3xl after:absolute after:top-[-1rem] after:opacity-70 after:blur-[0.06rem]"
          >
            {{ totalCount }} results
          </span>

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded accent-cyan-700"
              :checked="sortByCompany"
              @change="onSortChange"
            />
            <span class="text-[10px]">Sort by Company (A-Z)</span>
          </label>
        </div>

        <FilterModal />
      </div>
    </div>
  </div>
</template>
