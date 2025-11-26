<script setup lang="ts">
import { useJobStore } from './stores/JobStore'
// import { useFilterStore } from './stores/FilterStore'
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import Jobs from './components/jobs/Jobs.vue'
// import { storeToRefs } from 'pinia'

// Stores
const jobStore = useJobStore()
// const filterStore = useFilterStore()

// const { jobs } = storeToRefs(jobStore)
const { getData } = jobStore

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <Header />
    <div class="max-w-3xl lg:max-w-6xl mx-auto">
      <Jobs />
    </div>
  </div>
</template>

<style scoped></style>
