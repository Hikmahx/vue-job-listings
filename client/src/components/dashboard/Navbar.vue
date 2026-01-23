<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref(5)
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 h-[120px] flex items-center px-6">
    <div class="w-full flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Job Portal</h1>
      </div>
      
      <div class="flex items-center gap-6">
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">Hikman Y.</p>
            <p class="text-xs text-gray-600">Talent</p>
          </div>
          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
