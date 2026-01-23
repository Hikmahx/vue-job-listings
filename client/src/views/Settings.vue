<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const emailNotifications = ref(false)
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
    
    <Separator class="my-6" />

    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Email Notifications</h3>
        <p class="text-gray-600 mb-4">Manage your notification preferences</p>
        <Button variant="outline" class="border-cyan-400 text-cyan-400 hover:bg-cyan-50">
          Configure Notifications
        </Button>
      </div>

      <Separator />

      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Privacy</h3>
        <p class="text-gray-600 mb-4">Control your privacy settings</p>
        <Button variant="outline" class="border-cyan-400 text-cyan-400 hover:bg-cyan-50">
          Privacy Settings
        </Button>
      </div>

      <Separator />

      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Account</h3>
        <p class="text-gray-600 mb-4">Manage your account settings</p>
        <Button variant="outline" class="border-cyan-400 text-cyan-400 hover:bg-cyan-50">
          Account Settings
        </Button>
      </div>
    </div>
  </div>
</template>
