<script setup lang="ts">
import { useJobStore } from './stores/JobStore'
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import Jobs from './components/jobs/Jobs.vue'

// Stores
const jobStore = useJobStore()
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
