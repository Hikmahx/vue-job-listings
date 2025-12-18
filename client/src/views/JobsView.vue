<script setup lang="ts">
import Header from '@/components/Header.vue'
import SearchFilter from '@/components/filter/SearchFilter.vue'
import Jobs from '@/components/jobs/Jobs.vue'
</script>

<template>
  <div>
    <Header>
      <SearchFilter />
    </Header>

    <div class="max-w-3xl lg:max-w-6xl mx-auto">
      <Jobs />
    </div>
  </div>
</template>
