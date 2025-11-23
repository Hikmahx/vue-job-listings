<script setup lang="ts">
import removeIcon from '@/assets/img/icon-remove.svg'

interface FilterBtnProps {
  btns: string[]
  removeBtn: (btn: string) => void
}

defineProps<FilterBtnProps>()
</script>

<template>
  <div v-for="(btn, index) in btns" :key="index">
    <button
      class="flex items-center gap-2 bg-cyan-50 text-cyan-400 font-semibold rounded-md overflow-hidden capitalize"
    >
      <span class="px-2">{{ btn }}</span>
      <span
        class="bg-teal-600 hover:bg-cyan-400 p-2 cursor-pointer flex items-center justify-center"
        @click="() => removeBtn(btn)"
      >
        <img :src="removeIcon" alt="Remove" class="w-3 h-3" />
      </span>
    </button>
  </div>
</template>
