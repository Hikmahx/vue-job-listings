<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/FilterStore'
import Filter from './Filter.vue'
import FilterModal from './FilterModal.vue'
import SearchAndCountry from './SearchAndCountry.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

const filterStore = useFilterStore()
const route = useRoute()
const router = useRouter()

// Use watch with immediate: true to catch query params when they become available
watch(
  () => route.query,
  (query) => {
    console.log('Loading from URL params:', query)
    if (Object.keys(query).length > 0) {
      filterStore.loadFromObject(query)
    }
  },
  { immediate: true, deep: true },
)

const { search, location, sortByCompany } = storeToRefs(filterStore)

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
  console.log('Form submitted:', values)
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

// Sync to URL when filters change
watch(
  () => filterStore.toQueryObject(),
  (queryObj) => {
    router.push({ query: queryObj })
  },
  { deep: true },
)
</script>

<template>
  <div class="px-4 lg:px-10 w-full max-w-3xl lg:max-w-6xl m-auto">
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-8 -mt-12 lg:-mt-20 relative z-20">
      <form @submit.prevent="handleFormSubmit" class="mb-6">
        <SearchAndCountry />
        <button type="submit" class="sr-only">Apply Search</button>
      </form>
      <!-- Filters buttton -->
      <div class="">
        <Filter />
      </div>

      <!-- Below the filter tags-->
      <div
        class="flex flex-wrap md:flex-nowrap flex-col md:flex-row items-center justify-between pt-6 mt-6 border-t gap-8"
      >
        <div class="flex items-center gap-2 w-full">
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
