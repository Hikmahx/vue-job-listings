<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import Header from './components/Header.vue'
import Jobs from './components/jobs/Jobs.vue'
import Filter from './components/filter/Filter.vue'
import type { Job } from './types'

onMounted(() => {
  getData()
})

const state = reactive<{
  jobs: Job[]
  selectedBtn: string[]
}>({
  jobs: [],
  selectedBtn: [],
})

const getData = async (): Promise<void> => {
  try {
    const data = await fetch('./data.json')
    // console.log(data)
    const jobs = await data.json()
    state.jobs = jobs
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
  }
}

const onClickFilter = (e: Event) => {
  let btn = (e.target as HTMLElement).textContent
  if (btn && !state.selectedBtn.includes(btn)) {
    state.selectedBtn = [...state.selectedBtn, btn]
  }
}

const removeBtn = (btn: string): void => {
  state.selectedBtn = state.selectedBtn.filter((selectBtn) => selectBtn !== btn)
}

const clearAllBtns = (): void => {
  state.selectedBtn = []
}

const uniqueSelectedBtns = computed(() => Array.from(new Set(state.selectedBtn)))
</script>

<template>
  <Header />
  <div class="max-w-3xl lg:max-w-7xl mx-auto">
  <Filter :removeBtn="removeBtn" :selectedBtn="uniqueSelectedBtns" :clearAllBtns="clearAllBtns" />
  <Jobs :jobs="state.jobs" :selectedBtn="uniqueSelectedBtns" :onClickFilter="onClickFilter" />
  </div>
</template>

<style scoped></style>
