<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { BarChart3, Briefcase, Settings, Menu, Building2, Mail } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/AuthStore'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const sidebarItems = computed(() => {
  const role = authStore.user?.role
  const items: Array<{ id: string; label: string; icon: unknown; path: string }> = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  ]
  if (role === 'team_member') {
    items.push({ id: 'companies', label: 'Companies', icon: Building2, path: '/dashboard/companies' })
  }
  if (role === 'job_seeker') {
    items.push({ id: 'applied-jobs', label: 'Applied Jobs', icon: Briefcase, path: '/dashboard/applied-jobs' })
  }
  items.push({ id: 'cold-email-tracker', label: 'Cold Email Tracker', icon: Mail, path: '/dashboard/cold-email-tracker' })
  items.push({ id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' })
  return items
})

const activeItem = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'overview'
  if (path.includes('companies')) return 'companies'
  if (path.includes('applied-jobs')) return 'applied-jobs'
  if (path.includes('cold-email-tracker')) return 'cold-email-tracker'
  if (path.includes('settings')) return 'settings'
  return 'overview'
})

const handleLogout = async () => {
  await authStore.logout()
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

      <div class="overflow-auto w-[calc(100%_-_96px)] w-full ml-auto">
        <Navbar />
        <button
          class="md:hidden fixed top-[120px] left-4 z-30 bg-white p-2 rounded-lg shadow-md text-gray-900 hover:bg-gray-100"
          @click="isSidebarOpen = true"
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
