<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/FilterStore'
import { useJobStore } from '@/stores/JobStore'
import Filter from './Filter.vue'
import FilterModal from './FilterModal.vue'
import SearchAndCountry from './SearchAndCountry.vue'
import AISearchInput from './AISearchInput.vue'
import { Sparkles, ArrowLeftRight } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

const filterStore = useFilterStore()
const jobStore = useJobStore()
const route = useRoute()
const router = useRouter()

const { search, location, sortByCompany, aiMode } = storeToRefs(filterStore)

onMounted(() => {
  const urlAiMode = route.query.aiMode === 'true'
  if (urlAiMode) {
    filterStore.setAIMode(true)
  }
})

// Toggle between AI and Regular search
const toggleSearchMode = () => {
  const newMode = !aiMode.value
  filterStore.setAIMode(newMode)

  // When switching TO regular mode, trigger a fresh fetch
  if (!newMode) {
    jobStore.getData(1)
  }
}

// Load from URL params
watch(
  () => route.query,
  (query) => {
    if (Object.keys(query).length > 0) {
      filterStore.loadFromObject(query)
    }
  },
  { immediate: true, deep: true },
)

// Regular search form
const formSchema = toTypedSchema(
  z.object({
    search: z.string().optional(),
    location: z.string().optional(),
    sortByCompany: z.boolean().default(false),
  }),
)

const { handleSubmit, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    search: search.value,
    location: location.value,
    sortByCompany: sortByCompany.value || false,
  },
})

// Update form when store changes
watch(
  () => ({ search: search.value, location: location.value }),
  (newFilters) => {
    setValues({
      search: newFilters.search || '',
      location: newFilters.location || '',
      sortByCompany: sortByCompany.value || false,
    })
  },
  { deep: true },
)

const onSubmit = (values: any) => {
  filterStore.setFilters({
    search: values.search,
    location: values.location,
    sortByCompany: values.sortByCompany,
  })
}

const handleFormSubmit = handleSubmit(onSubmit)

const onSortChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  filterStore.setFilters({ sortByCompany: checked })
}

watch(
  () => filterStore.toQueryObject(),
  (queryObj) => {
    const urlQuery = { ...queryObj }
    if (aiMode.value) {
      urlQuery.aiMode = 'true'
    }
    router.push({ query: urlQuery })
  },
  { deep: true },
)
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
          <form @submit.prevent="handleFormSubmit" class="mb-6">
            <SearchAndCountry />
            <button type="submit" class="sr-only">Apply Search</button>
          </form>
        </div>
      </div>

      <!-- Filters (shown in both modes) -->
      <div class="mt-6">
        <Filter />
      </div>

      <!-- Results count and sorting (shown in both modes) -->
      <div
        class="flex flex-wrap md:flex-nowrap flex-col md:flex-row items-center justify-between pt-6 mt-6 border-t gap-8"
      >
        <div class="flex items-center gap-2 w-full">
          <!-- Toggle Button -->
          <div class="flex">
            <button
              @click="toggleSearchMode"
              class="group flex items-center h-12 gap-2 mr-4 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              :title="aiMode ? 'Switch to Regular Search' : 'Switch to AI Search'"
            >
              <ArrowLeftRight
                :class="[
                  'w-4 h-4 transition-transform duration-300',
                  !aiMode ? 'rotate-180 text-cyan-400' : '',
                ]"
              />
              <span
                :class="[
                  'flex items-center gap-1 text-xs relative',
                  !aiMode ? 'text-cyan-400' : 'text-cyan-900',
                ]"
              >
                <Sparkles v-if="!aiMode" class="w-2.5 h-2.5 absolute -top-2.5 -right-2.5" />
                {{ !aiMode ? 'AI' : 'Regular' }}
              </span>
            </button>
          </div>

          <span
            class="relative mr-6 after:content-['.'] after:ml-1 after:text-3xl after:absolute after:top-[-1rem] after:opacity-70 after:blur-[0.06rem]"
          >
            159 results
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
