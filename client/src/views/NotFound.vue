<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p class="text-xl text-gray-600 mb-6">Page not found</p>
      <Button 
        @click="router.push('/dashboard')"
        class="bg-cyan-400 hover:bg-cyan-900 text-white"
      >
        Go to Dashboard
      </Button>
    </div>
  </div>
</template>
