<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/AuthStore'
const authStore = useAuthStore()
const initials = () => authStore.user?.fullName?.charAt(0) || 'U'
const shortName = () => {
  const parts = (authStore.user?.fullName || '').split(' ')
  return parts.length >= 2 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0] || 'User'
}
</script>
<template>
  <nav class="relative bg-cyan-400 shadow-sm border-b border-gray-200 h-20 flex items-center px-6 md:px-12">
    <div class="w-full flex items-center justify-between relative">
      <div />
      <div class="flex items-center gap-6">
        <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell class="w-6 h-6 text-cyan-50" />
        </button>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-medium text-cyan-50">{{ shortName() }}</p>
            <p class="text-xs text-cyan-50 capitalize">{{ authStore.user?.role?.replace('_', ' ') || 'User' }}</p>
          </div>
          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-cyan-900 font-bold">{{ initials() }}</span>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
