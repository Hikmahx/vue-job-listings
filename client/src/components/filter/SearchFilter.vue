<script setup lang="ts">
import { ref } from 'vue'
// import FilterBtn from './FilterBtn.vue'
import FilterModal from './FilterModal.vue'
import SearchAndCountry from './SearchAndCountry.vue'

interface SearchFormProps {
  selectedBtn: string[]
  removeBtn: (btn: string) => void
  clearAllBtns: () => void
}

defineProps<SearchFormProps>()

const showModal = ref(false)
const sortByDate = ref(false)

const toggleModal = () => {
  showModal.value = !showModal.value
}

const handleSearch = () => {
  console.log('Searching...', { sortByDate: sortByDate.value })
  showModal.value = false
}


</script>

<template>
  <div class="px-10 w-full max-w-3xl lg:max-w-6xl m-auto">
    <div class="bg-white rounded-lg shadow-lg p-8 -mt-12 lg:-mt-20 relative z-20">
      <div class="mb-6">
        <SearchAndCountry />
      </div>

      <!-- Below the filter tags-->
      <div class="flex items-center justify-between pt-6 mt-6 border-t">
        <div class="flex items-center gap-2">
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
