<script setup lang="ts">
import { inject, ref, watch } from 'vue'
// import FilterBtn from './FilterBtn.vue'
import FilterModal from './FilterModal.vue'
import SearchAndCountry from './SearchAndCountry.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { FieldGroup, FieldLabel } from '@/components/ui/field'

// interface SearchFormProps {
//   selectedBtn: string[]
//   removeBtn: (btn: string) => void
//   clearAllBtns: () => void
// }

// defineProps<SearchFormProps>()

const sortByDate = ref(false)

const handleSearch = () => {
  console.log('Searching...', { sortByDate: sortByDate.value })
}

const filters = inject('filters')
const groupedFilters = inject('groupedFilters')

const formSchema = toTypedSchema(
  z.object({
    search: z.string().optional(),
    country: z.string().optional(),
  }),
)

const { handleSubmit, values, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: () => ({
    search: filters.value.search,
    country: filters.value.country,
  }),
})

// Watch for form changes and update shared filters
watch(values, (newValues) => {
  console.log('Search form values changed:', newValues)
  filters.value.search = newValues.search
  filters.value.country = newValues.country
  
  // Call groupedFilters to process the changes
  groupedFilters(newValues)
})

// Watch for changes in shared filters (from FilterModal) and update form
watch(filters, (newFilters) => {
  setValues({
    search: newFilters.search,
    country: newFilters.country,
  })
})

const handleFormSubmit = handleSubmit((values) => {
  console.log('Form submitted on change:', values)
})
</script>

<template>
  <div class="px-4 lg:px-10 w-full max-w-3xl lg:max-w-6xl m-auto">
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-8 -mt-12 lg:-mt-20 relative z-20">
      <form @submit.prevent="handleFormSubmit" class="mb-6">
        <SearchAndCountry />
      </form>

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
            <input type="checkbox" class="w-4 h-4 rounded accent-cyan-700" />
            <span class="text-sm"> Sort by Date </span>
          </label>
        </div>
        <FilterModal />
      </div>
    </div>
  </div>
</template>
