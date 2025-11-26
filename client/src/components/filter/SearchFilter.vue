<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/FilterStore'
import Filter from './Filter.vue'
import FilterModal from './FilterModal.vue'
import SearchAndCountry from './SearchAndCountry.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

const filterStore = useFilterStore()
const { search, country, sortByDate } = storeToRefs(filterStore)

const formSchema = toTypedSchema(
  z.object({
    search: z.string().optional(),
    country: z.string().optional(),
    sortByDate: z.boolean().default(false),
  }),
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    search: search.value,
    country: country.value,
    sortByDate: sortByDate.value || false,
  },
})

// Update form values when filters change
watch(
  () => ({ search: search.value, country: country.value }),
  (newFilters) => {
    setValues({
      search: newFilters.search || '',
      country: newFilters.country || '',
      sortByDate: sortByDate.value || false,
    })
  },
  { deep: true },
)

const onSubmit = (values: any) => {
  console.log('Form submitted:', values)
  filterStore.setFilters({
    search: values.search,
    country: values.country,
    sortByDate: values.sortByDate,
  })
}

const handleFormSubmit = handleSubmit(onSubmit)

const onSortChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  filterStore.setFilters({ sortByDate: checked })
}
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
              :checked="sortByDate"
              @change="onSortChange"
            />
            <span class="text-sm">Sort by Date</span>
          </label>
        </div>
        <FilterModal />
      </div>
    </div>
  </div>
</template>
