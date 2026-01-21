<script setup lang="ts">
defineProps<{
  currentStep: number
  signupPage: boolean
  title: string
}>()
</script>

<template>
  <div class="space-y-8">
    <div v-if="signupPage" class="flex items-center justify-start gap-4 border-b pb-5 pt-8">
      <div v-for="step in 3" :key="step" class="flex items-center">
        <div
          :class="[
            'w-7 h-7 rounded-md flex items-center justify-center text-xs transition-all',
            currentStep === step || currentStep > step
              ? 'bg-cyan-400 text-white font-semibold'
              : 'bg-gray-300 text-grayish-cyan font-thin',
          ]"
        >
          {{ step }}
        </div>
        <div
          :class="[
            'ml-2 text-xs',
            (step === 1 && currentStep > 0) ||
            (step === 2 && currentStep > 1) ||
            (step === 3 && currentStep > 2)
              ? 'text-cyan-900'
              : 'text-grayish-cyan',
          ]"
        >
          {{ step === 1 ? 'Sign Up' : step === 2 ? 'Account Type' : 'Profile Details' }}
        </div>

        <!-- <div v-if="step < 3" class="w-12 h-px bg-gray-300 mx-2"></div> -->
      </div>
    </div>
    <div v-if="signupPage">
      <p class="text-xs text-grayish-cyan mb-3">Step {{ currentStep }}/3</p>
      <!-- Title -->
      <h1 class="text-4xl font-semibold text-cyan-900 mb-9">
        <!-- {{ title }}</h1> -->
        <!-- <h2 class="text-3xl font-bold text-cyan-900"> -->
        {{
          currentStep === 1
            ? 'Create Account'
            : currentStep === 2
              ? 'Choose an Account'
              : 'Complete Registration'
        }}
      </h1>
    </div>
    <div v-else>
      <!-- Title -->
      <h1 class="text-4xl font-semibold text-cyan-900 mb-9">{{ title }}</h1>
    </div>
  </div>
</template>
