<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const isHovered = ref(false)

const navLinks = [
  { to: '/jobs', label: 'Jobs' },
  { to: '#companies', label: 'Companies' },
  { to: '#about', label: 'About' }
]

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const navigateTo = (path: string) => {
  if (!path.startsWith('#')) {
    router.push(path)
    closeMobileMenu()
  }
}
</script>

<template>
  <nav
    class="relative lg:absolute top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out lg:hover:bg-white/20"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="container mx-auto max-w-3xl lg:max-w-6xl 2xl:max-w-7xl px-4 py-8 lg:py-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-20">
          <router-link to="/" class="flex items-center flex-shrink-0">
            <img src="/logo.svg" alt="JobList Logo" class="h-5" />
          </router-link>

          <div class="hidden md:flex items-center gap-6 ml-[84px]">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="transition-colors duration-300"
              :class="isHovered ? 'text-cyan-900' : 'text-white'"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <router-link to="/login">
            <Button
              variant="ghost"
              class="border-0 px-6 lg:px-7 h-12 transition-all duration-300"
              :class="isHovered ? 'text-cyan-900 hover:bg-cyan-50' : 'text-white hover:bg-cyan-900/50'"
            >
              Login
            </Button>
          </router-link>

          <router-link to="/signup">
            <Button
              class="px-6 lg:px-7 h-12 transition-all duration-300"
              :class="isHovered 
                ? 'bg-cyan-50 text-cyan-900 hover:bg-cyan-100' 
                : 'bg-cyan-900 text-white hover:bg-cyan-800'"
            >
              Signup
            </Button>
          </router-link>
        </div>

        <button
          class="md:hidden transition-colors duration-300"
          :class="isHovered ? 'text-cyan-900' : 'text-white'"
          @click="isMobileMenuOpen = true"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Dialog :open="isMobileMenuOpen" @update:open="(v) => (isMobileMenuOpen = v)">
      <DialogContent
        class="!fixed !right-0 !top-0 !left-auto !h-full !w-[300px] !max-w-full !translate-x-0 !translate-y-0 !rounded-none border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right [&>button]:hidden"
      >
        <div class="flex flex-col h-full">
          <div class="flex justify-end mb-8">
            <button @click="closeMobileMenu" class="text-cyan-900 hover:text-cyan-400 transition">
              <X class="w-6 h-6" />
            </button>
          </div>

          <nav class="flex flex-col gap-6 flex-1">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              @click="closeMobileMenu"
              class="text-cyan-900 font-medium hover:text-cyan-400 transition"
            >
              {{ link.label }}
            </router-link>
          </nav>

          <div class="flex flex-col gap-4 pt-6 border-t">
            <router-link to="/login">
              <Button
                variant="outline"
                class="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-50"
                @click="closeMobileMenu"
              >
                Login
              </Button>
            </router-link>

            <router-link to="/signup">
              <Button
                class="w-full bg-cyan-400 hover:bg-cyan-900 text-white"
                @click="closeMobileMenu"
              >
                Signup
              </Button>
            </router-link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </nav>
</template>
