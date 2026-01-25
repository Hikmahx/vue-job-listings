<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import Logo from '../icons/Logo.vue'
import { Info } from 'lucide-vue-next'

interface SidebarItem {
  id: string
  label: string
  icon: Component
  path: string
}

defineProps<{
  items: SidebarItem[]
  activeItem: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  navigate: [path: string]
  close: []
  logout: []
}>()

const isExpanded = ref(false)
</script>

<template>
  <aside
    class="fixed md:w-20 w-20 h-[calc(100vh-1rem)] m-2 rounded-sm bg-cyan-900 border-r border-gray-300 transition-all duration-300 ease-in-out z-40 hover:w-64"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- {/* Logo */} -->

    <div class="py-6 pl-3 border-b border-gray-200">
      <a href="/" class="group transition-all duration-300">
        <Logo
          :icon-class="!isExpanded ? 'fill-white' : 'fill-cyan-400'"
          :text-class="!isExpanded ? 'fill-white' : 'fill-cyan-400'"
          :hide-text="!isExpanded"
          logo-class="w-[100px]"
        />
      </a>
    </div>
    <!-- {/* Navigation Items */} -->
    <nav class="px-3 py-4 space-y-2">
      <button
        v-for="item in items"
        :key="item.id"
        @click="emit('navigate', item.path)"
        :class="[
          'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap',
          activeItem === item.id
            ? 'bg-cyan-400 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-600',
        ]"
      >
        <span class="flex-shrink-0">
          <component :is="item.icon" class="w-6 h-6" />
        </span>
        <span
          :class="['transition-opacity duration-300', isExpanded ? 'opacity-100' : 'opacity-0 w-0']"
        >
          {{ item.label }}
        </span>
      </button>
    </nav>
    <!-- <Logo icon-class="fill-white" text-class="fill-cyan-400" :hide-text="!isExpanded" /> -->

    <!-- {/* Footer Items */} -->
    <div class="border-t border-gray-300 px-3 py-4 space-y-2 absolute bottom-0 left-0 right-0">
      <button
        class="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap"
      >
        <span class="flex-shrink-0">
          <!-- <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg> -->
          <Info class="w-6 h-6" />
        </span>
        <span
          :class="['transition-opacity duration-300', isExpanded ? 'opacity-100' : 'opacity-0 w-0']"
        >
          Help
        </span>
      </button>

      <button
        @click="emit('logout')"
        class="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap"
      >
        <span class="flex-shrink-0">
          <!-- <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg> -->
          <LogOut class="w-6 h-6" />
        </span>
        <span
          :class="['transition-opacity duration-300', isExpanded ? 'opacity-100' : 'opacity-0 w-0']"
        >
          Logout
        </span>
      </button>
    </div>
  </aside>
</template>
