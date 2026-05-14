<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { ref } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const notifications = ref(5)
</script>

<template>
  <nav
    class="relative bg-white shadow-sm border-b border-gray-200 h-20 flex items-center px-6 md:px-12"
  >
    <!-- <img
      src="@/assets/img/bg-header-desktop.svg"
      class="absolute inset-0 w-full lg:hidden object-cover object-right h-full"
      alt="bg-header-mobile"
    />
    <img
      src="@/assets/img/bg-header-desktop.svg"
      class="absolute inset-0 hidden lg:flex w-full h-full object-cover"
      alt="bg-header-desktop"
    /> -->
    <div class="w-full flex items-center justify-between relative">
      <div>
        <h1 class="text-2xl font-bold text-cyan-400 hidden">Job Portal</h1>
      </div>

      <div class="flex items-center gap-6">
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell class="w-6 h-6 text-cyan-900" />
        </button>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-medium text-cyan-900">John D.</p>
            <p class="text-xs text-cyan-900">Talent</p>
          </div>
          <div class="w-10 h-10 !bg-cyan-400 text-white rounded-full flex items-center justify-center">
            <Avatar>
              <AvatarImage
                src="https://images.unsplash.com/photo-1494790377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8xzZWFyY2h8Mnx8cGVyc29uJTIwcHJvZmlsZXxlbnwwfHwwHx8MA%3D%3D&auto=format&fit=crop&w=9000&q=60"
                alt="User Avatar"
              />

              <AvatarFallback class="bg-cyan-400 text-white">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
