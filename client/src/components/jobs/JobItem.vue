<script setup lang="ts">
import { useFilterStore } from '@/stores/FilterStore'
import type { Job } from '@/types'

const filterStore = useFilterStore()

defineProps<{ job: Job }>()

const handleFilterClick = (e: Event, filterType: 'role' | 'level' | 'skills') => {
  const clickedText = (e.target as HTMLElement).textContent?.trim()
  if (clickedText) {
    filterStore.onFilterClick(clickedText, filterType)
  }
}
</script>

<template>
  <li
    :class="`relative flex flex-col lg:flex-row gap-8 lg:gap-4 bg-white rounded-md shadow-[0_12px_16px_0_#d7e9ec] mb-8 lg:mb-4 p-7 px-6 lg:px-10 ${job.featured && `before:content-[''] before:absolute before:w-1.5 before:h-full before:bg-[#5ea4a6] before:top-0 before:left-0 before:rounded-l-md`}`"
  >
    <img
      :src="`${job.logo}`"
      alt="banner"
      class="relative w-16 h-16 lg:w-[88px] lg:h-[88px] -mt-14 md:mt-0 mb-[-16px]"
    />
    <div class="flex-1 flex flex-col lg:flex-row lg:items-center">
      <div class="">
        <div class="flex items-center justify-start gap-1 flex-wrap">
          <router-link
            :to="{ name: 'job-detail', params: { id: job.id } }"
            aria-label="`View details for ${job.position} at ${job.company}`"
            class="text-sm text-cyan-400 hover:text-cyan-400/50 mr-5 whitespace-nowrap font-semibold hover:underline"
          >
            <h2>
              {{ job.company }}
            </h2>
          </router-link>
          <span
            v-if="job.new"
            class="bg-cyan-400 text-white uppercase px-2 pt-1 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          >
            New!
          </span>
          <span
            v-if="job.featured"
            class="bg-black text-white uppercase px-2 pt-1 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          >
            Featured
          </span>
        </div>

        <h3
          class="mt-3 hover:text-cyan-400 transition-colors duration-200 cursor-pointer text-base font-bold"
        >
          {{ job.position }}
        </h3>

        <div class="mt-4 flex items-center flex-wrap text-sm text-[#7b8e8e]">
          <span
            class="relative mr-6 after:content-['.'] after:ml-1.5 after:text-3xl after:absolute after:top-[-18px] after:opacity-70 after:blur-[0.06rem]"
          >
            {{ job.postedAt }}
          </span>
          <span
            class="relative mr-6 after:content-['.'] after:ml-1.5 after:text-3xl after:absolute after:top-[-18px] after:opacity-70 after:blur-[0.06rem] capitalize"
          >
            {{ job.contract }}
          </span>
          <span>{{ job.location }}</span>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-x-3 gap-y-4 lg:ml-auto">
        <button
          @click="(e) => handleFilterClick(e, 'role')"
          class="px-3 py-2 h-8 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200 capitalize"
        >
          {{ job.role }}
        </button>
        <button
          @click="(e) => handleFilterClick(e, 'level')"
          class="px-3 py-2 h-8 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200 capitalize"
        >
          {{ job.level }}
        </button>
        <button
          v-for="skill in job.skills"
          :data-skill="skill"
          :key="skill"
          @click="(e) => handleFilterClick(e, 'skills')"
          class="px-3 py-2 h-8 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200 capitalize"
        >
          {{ skill }}
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped></style>
