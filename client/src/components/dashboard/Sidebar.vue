<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { LogOut, Info } from 'lucide-vue-next'
import Logo from '@/components/icons/Logo.vue'

interface SidebarItem {
  id: string
  label: string
  icon: unknown
  path: string
}

const props = defineProps<{
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
    class="fixed md:w-20 w-20 h-screen bg-cyan-900 transition-all duration-300 ease-in-out z-40 hover:w-64"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- Logo -->
    <div class="py-6 pl-3 border-b border-gray-200">
      <RouterLink to="/" class="group transition-all duration-300">
        <Logo
          :icon-class="!isExpanded ? 'fill-white' : 'fill-cyan-400'"
          :text-class="!isExpanded ? 'fill-white' : 'fill-cyan-400'"
          :hide-text="!isExpanded"
          logo-class="w-[100px]"
        />
      </RouterLink>
    </div>

    <!-- Navigation Items -->
    <nav class="px-3 py-4 space-y-2">
      <button
        v-for="item in props.items"
        :key="item.id"
        class="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap"
        :class="
          props.activeItem === item.id
            ? 'bg-cyan-400 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-600'
        "
        @click="emit('navigate', item.path)"
      >
        <span class="flex-shrink-0">
          <component :is="item.icon" class="w-6 h-6" />
        </span>
        <span
          class="transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0 w-0'"
        >
          {{ item.label }}
        </span>
      </button>
    </nav>

    <!-- Footer Items -->
    <div class="border-t border-gray-300 px-3 py-4 space-y-2 absolute bottom-0 left-0 right-0">
      <button
        class="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap"
      >
        <span class="flex-shrink-0"><Info class="w-6 h-6" /></span>
        <span
          class="transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0 w-0'"
        >Help</span>
      </button>

      <button
        class="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap"
        @click="emit('logout')"
      >
        <span class="flex-shrink-0"><LogOut class="w-6 h-6" /></span>
        <span
          class="transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0 w-0'"
        >Logout</span>
      </button>
    </div>
  </aside>
</template>
