<script setup lang="ts">
import jobData from '@/data.json'
import { ref } from 'vue'
import JobItem from './JobItem.vue'

const jobs = ref(jobData)

console.log(jobs.value)
</script>

<template>
  <ul class="pt-24 px-10 pb-px">
    <JobItem v-for="job in jobs" :key="job.id" :job="job" />
  </ul>
</template>

<style scoped></style>
