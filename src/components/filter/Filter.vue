<script setup lang="ts">
import { defineProps } from 'vue'
import FilterBtn from './FilterBtn.vue'

interface FilterProps {
  selectedBtn: string[]
  removeBtn: (btn: string) => void
  clearAllBtns: () => void
}

defineProps<FilterProps>()
</script>

<template>
  <div class="px-10">
    <div
      :class="`${
        selectedBtn.length > 0 ? 'block' : 'hidden'
      } w-full max-w-3xl lg:max-w-6xl mx-auto bg-white px-6 py-4 mb-16 relative h-auto rounded-md shadow-[0_16px_26px_-6px_#d7e9ec] -top-10`"
    >
      <div class="flex flex-wrap gap-4">
        <FilterBtn :btns="selectedBtn" :removeBtn="removeBtn" />
      </div>
      <button
        class="absolute right-6 top-4 text-teal-600 font-semibold cursor-pointer hover:underline"
        @click="clearAllBtns"
      >
        Clear
      </button>
    </div>
  </div>
</template>
