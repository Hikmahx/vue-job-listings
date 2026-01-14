<script setup lang="ts">
// import { useFilterStore } from '@/stores/FilterStore'
// import SearchFilter from './filter/SearchFilter.vue'

// const FilterStore = useFilterStore()
// provide('groupedFilters', groupedFilters)
// provide('filters', filters)
import { useAttrs } from 'vue'

import Navbar from '@/components/common/Navbar.vue'
const attrs = useAttrs()
</script>

<template>
  <div>
    <Navbar />
    <header
      class="h-40 md:h-[250px] w-full bg-cyan-400"
      v-bind="attrs"
    >
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
    <slot />
  </div>
</template>
