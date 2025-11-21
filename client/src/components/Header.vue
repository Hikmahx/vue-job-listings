<script setup lang="ts">
import { defineProps, provide, ref } from 'vue'
import SearchFilter from './filter/SearchFilter.vue'

// For the grouped filter, we need:
// -  work type (eg remote),
// - Language (if not english, eg French)
// - Salary range with the currency (eg $10k-$40k)
// - Skills (eg React.js if one and if more eg Skills . 3)
// - Market (same as skills eg Market • 2)
// - Company size (same as skills eg Company Size • 2)
// - Job Types (same as skills eg Job Types • 2)
// - Role Types (same as skills eg Role Types • 2)
const filters = ref({
  search: '',
  country: '',
  minSalary: undefined,
  maxSalary: undefined,
  workType: '',
  spokenLanguages: '',
  skills: [],
  markets: [],
  companySizes: [],
  jobTypes: [],
  roleTypes: [],
  currency: '',
})

const groupedFilters = (item) => {
  filters.value = { ...filters.value, ...item }
  
  const data = Object.entries(item)
  const mappedData = data
    .filter(
      ([key, value]) =>
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'string' && value.trim() === ''),
    )
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 1 || value.length < 1) {
          return { [key]: value[0] }
        }
        if (value.length > 1) {
          return { [key]: value.length }
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        return { [key]: value }
      }
    })
  console.log('Filtered data:', mappedData)
  return mappedData
}

provide('groupedFilters', groupedFilters)
provide('filters', filters)
</script>

<template>
  <div>
    <header class="h-40 md:h-[250px] w-f ull bg-cyan-400">
      <div class="relative w-full h-full">
        <img
          src="@/assets/img/bg-header-desktop.svg"
          class="absolute inset-0 w-full lg:hidden object-cover object-right h-full"
          alt="bg-header-mobile"
        />
        <img
          src="@/assets/img/bg-header-desktop.svg"
          class="absolute inset-0 hidden lg:flex h-full"
          alt="bg-header-desktop"
        />
      </div>
    </header>
    <SearchFilter />
  </div>
</template>
