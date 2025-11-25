<script setup lang="ts">
import { defineProps, provide, ref, watch } from 'vue'
import SearchFilter from './filter/SearchFilter.vue'

const filters = ref({
  search: '',
  country: '',
  minSalary: undefined,
  maxSalary: undefined,
  workType: '',
  level: '',
  skills: [],
  markets: [],
  companySizes: [],
  contract: [],
  roles: [],
  currency: '',
  sortByDate: false,
})

const groupedFilters = (item) => {
  Object.keys(item).forEach((key) => {
    if (item[key] !== undefined && item[key] !== null) {
      filters.value[key] = item[key]
    }
  })

  const data = Object.entries(filters.value)
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
        if (value.length === 1) {
          return { [key]: value[0] }
        }
        if (value.length > 1) {
          return { [key]: value.length }
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        return { [key]: value }
      } else if (typeof value === 'boolean' && value === true) {
        return { [key]: value }
      }
    })
    .filter(Boolean) // removes undefined, null, false, 0, "", NaN

  console.log('Filtered data:', mappedData)

  return mappedData
}

provide('groupedFilters', groupedFilters)
provide('filters', filters)
</script>

<template>
  <div>
    <header class="h-40 md:h-[250px] w-full bg-cyan-400">
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
