<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BarChart3, Briefcase, Settings, LogOut, Menu, X } from 'lucide-vue-next'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const router = useRouter()
const route = useRoute()
const isSidebarOpen = ref(false)

const sidebarItems = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { id: 'applied-jobs', label: 'Applied Jobs', icon: Briefcase, path: '/dashboard/applied-jobs' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]

const activeItem = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'overview'
  if (path.includes('applied-jobs')) return 'applied-jobs'
  if (path.includes('settings')) return 'settings'
  return 'overview'
})

const handleLogout = () => {
  router.push('/')
}

const navigateTo = (path: string) => {
  router.push(path)
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-cyan-50">
    
    <div class="flex h-screen">
      <Sidebar 
      :items="sidebarItems"
      :active-item="activeItem"
      :is-open="isSidebarOpen"
      @navigate="navigateTo"
      @close="isSidebarOpen = false"
        @logout="handleLogout"
      />
      
      <div class="overflow-auto w-[calc(100%_-_96px)]j w-full ml-auto">
        <Navbar />
        <button
          @click="isSidebarOpen = true"
          class="md:hidden fixed top-[120px] left-4 z-30 bg-white p-2 rounded-lg shadow-md text-gray-900 hover:bg-gray-100"
        >
          <Menu class="w-6 h-6" />
        </button>

        <div class="p-6 md:p-12 pl-[104px] md:pl-32">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>
