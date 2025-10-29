<script setup lang="ts">

interface Job {
  id: number
  company: string
  logo: string
  new: boolean
  featured: boolean
  position: string
  role: string
  level: string
  postedAt: string
  contract: string
  location: string
  languages: string[]
  tools: string[]
}

const { job } = defineProps<{ job: Job }>()
</script>

<template>
  <li
    :class="`relative bg-white rounded-md shadow-[0_12px_16px_0_#d7e9ec] h-[25.7rem] mb-16 p-7 px-9 ${job.featured && `before:content-[''] before:absolute before:w-2 before:h-full before:bg-[#5ea4a6] before:top-0 before:left-0`} before:rounded-l-md`"
  >
    <img :src="`${job.logo}`" alt="banner" class="relative w-12 h-12 -top-16 mb-[-16px]" />

    <div class="flex items-center justify-start gap-1">
      <h2 class="text-sm text-cyan-400 mr-5 whitespace-nowrap font-semibold">{{ job.company }}</h2>
      <span
        v-if="job.new"
        class="bg-cyan-400 text-white uppercase px-3 pt-1 rounded-full flex items-center justify-center text-xs font-bold"
      >
        New!
      </span>
      <span
        v-if="job.featured"
        class="bg-black text-white uppercase px-3 py-1 rounded-full flex items-center justify-center text-xs font-bold"
      >
        Feature
      </span>
    </div>

    <h3
      class="mt-3 hover:text-cyan-400 transition-colors duration-200 cursor-pointer text-base font-bold"
    >
      {{ job.position }}
    </h3>

    <div
      class="mt-4 pb-6 border-b border-[#c0c2c1] flex items-center flex-wrap text-sm text-[#7b8e8e]"
    >
      <span
        class="relative mr-6 after:content-['.'] after:ml-1 after:text-3xl after:absolute after:top-[-1rem] after:opacity-70 after:blur-[0.06rem]"
      >
        {{ job.postedAt }}
      </span>
      <span
        class="relative mr-6 after:content-['.'] after:ml-1 after:text-3xl after:absolute after:top-[-1rem] after:opacity-70 after:blur-[0.06rem]"
      >
        {{ job.contract }}
      </span>
      <span>{{ job.location }}</span>
    </div>

    <div class="mt-4 flex flex-wrap">
      <button
        v-for="role in job.languages"
        :data-role="role"
        :key="role"
        class="mb-4 mr-3 px-3 py-2 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200"
      >
        {{ role }}
      </button>
      <button
        v-for="tool in job.tools"
        :data-tool="tool"
        :key="tool"
        class="mb-4 mr-3 px-3 py-2 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200"
      >
        {{ tool }}
      </button>
    </div>
  </li>
</template>

<style scoped></style>
