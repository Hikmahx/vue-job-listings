<script setup lang="ts">
</script>

<template>
  <li
    class="relative flex flex-col lg:flex-row gap-8 lg:gap-4 bg-white rounded-md shadow-[0_12px_16px_0_#d7e9ec] mb-16 lg:mb-10 p-7 px-6 lg:px-10 animate-pulse h-[142px]"
  >
    <!-- Logo -->
    <div class="w-16 h-16 lg:w-[88px] lg:h-[88px] bg-gray-200 rounded-full -mt-14 md:mt-0 mb-[-16px]"></div>

    <div class="flex-1 flex flex-col lg:flex-row lg:items-center gap-4">
      <div class="flex-1">
        <!-- Company & badges -->
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <div class="w-24 h-4 bg-gray-200 rounded"></div>
          <div class="w-10 h-4 bg-gray-300 rounded"></div>
          <div class="w-16 h-4 bg-gray-300 rounded"></div>
        </div>

        <!-- Position -->
        <div class="w-48 h-5 bg-gray-200 rounded mb-4"></div>

        <!-- PostedAt, Contract, Location -->
        <div class="flex items-center flex-wrap gap-4 text-sm">
          <div class="w-20 h-3 bg-gray-200 rounded"></div>
          <div class="w-16 h-3 bg-gray-200 rounded"></div>
          <div class="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- (Role, Level, Skills) -->
      <div class="mt-4 flex flex-wrap gap-x-3 gap-y-4 lg:ml-auto">
        <div class="w-20 h-8 bg-gray-200 rounded-sm"></div>
        <div class="w-20 h-8 bg-gray-200 rounded-sm"></div>
        <div class="w-16 h-8 bg-gray-200 rounded-sm" v-for="n in 3" :key="n"></div>
      </div>
    </div>
  </li>
</template>

