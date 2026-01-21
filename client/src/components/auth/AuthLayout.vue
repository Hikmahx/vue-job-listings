<script setup lang="ts">
import StepIndicator from './StepIndicator.vue'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showDivider?: boolean
    currentStep: number
    signupPage: boolean
  }>(),
  {
    showDivider: true,
  },
)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-cyan-50">
    <!-- Left Side: Form -->
    <div
      class="w-full lg:w-1/2 flex flex-col px-8 py-12 overflow-hidden"
      :class="!signupPage ? 'mt-[15%] lg:mt-[10%] pb-16' : ' pb-8'"
    >
      <!-- Logo -->
      <div class="flex-shrink-0">
        <router-link to="/" class="flex items-center absolute top-6 left-6">
          <img src="/logo-dark.svg" alt="JobList Logo" class="h-5" />
        </router-link>
      </div>
      <!-- Step Indicator -->
      <StepIndicator :current-step="currentStep" :signup-page="signupPage" :title="title" />
      <!-- Form Container with Scroll -->
      <div class="flex-1 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-md p-8 space-y-6 min-h-fit">
          <slot></slot>
        </div>
      </div>

      <!-- Footer (sticky at bottom) -->
      <div class="flex-shrink-0 mt-6 text-center text-grayish-cyan">
        <slot name="footer"></slot>
      </div>
    </div>

    <!-- Right Side: Cyan Container (hidden on mobile/tablet) -->
    <div
      v-if="showDivider"
      class="hidden lg:flex w-1/2 bg-cyan-400 rounded-3xl m-6 flex-col justify-between p-12 relative overflow-hidden"
    >
      <!-- Decorative Circles -->
      <div class="absolute top-10 right-20 w-24 h-24 bg-white opacity-20 rounded-full"></div>
      <div class="absolute bottom-20 left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      <div class="absolute top-1/2 right-10 w-20 h-20 bg-white opacity-15 rounded-full"></div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center items-center h-full gap-8">
        <!-- Mockup Box -->
        <div class="bg-white bg-opacity-20 rounded-xl p-6 w-full max-w-xs space-y-3">
          <div class="h-6 bg-white bg-opacity-40 rounded w-20"></div>
          <div class="space-y-2">
            <div class="h-3 bg-white bg-opacity-30 rounded"></div>
            <div class="h-3 bg-white bg-opacity-30 rounded w-5/6"></div>
            <div class="h-3 bg-white bg-opacity-30 rounded w-4/5"></div>
          </div>
          <div class="flex gap-2 pt-3">
            <div class="h-4 bg-white bg-opacity-30 rounded flex-1"></div>
            <div class="h-4 bg-white bg-opacity-30 rounded flex-1"></div>
          </div>
        </div>

        <!-- Text -->
        <div class="text-center text-white">
          <h2 class="text-3xl font-bold mb-4">Your next opportunity starts here</h2>
          <p class="text-lg opacity-90 leading-relaxed">
            Create your profile, showcase your skills, and connect with companies that are actively
            hiring people like you.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
