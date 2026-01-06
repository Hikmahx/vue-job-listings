<script setup lang="ts">
import { Button } from '@/components/ui/button'
import SvgSlanted from '../icons/SvgSlanted.vue'
</script>

<template>
  <section
    class="px-4 py-12 md:py-16 lg:py-20 from-cyan-50 from-50% to-50% to-cyan-900 bg-gradient-to-b"
  >
    <div class="max-w-7xl mx-auto">
      <div
        class="relative rounded-xl px-6 py-12 md:px-12 md:py-16 lg:px-20 lg:py-20 text-center bg-cyan-400 overflow-hidden"
      >
        <SvgSlanted class="text-cyan-900 opacity-15 absolute right-0 -top-32" />
        <div class="relative">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Ready to Get Started?
          </h2>
          <p class="text-cyan-50 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Start exploring job opportunities tailored to your preferences today. Discover roles
            faster using powerful filters and intelligent AI-powered search.
          </p>
          <Button
            class="bg-cyan-900 hover:bg-cyan-50 text-white hover:text-cyan-900 h-12 font-medium text-base tracking-wider w-full max-w-[168px]"
          >
            Contact us
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
