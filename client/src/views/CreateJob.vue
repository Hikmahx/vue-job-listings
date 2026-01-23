<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const router = useRouter()

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Create New Job</h2>
    <p class="text-gray-600 mb-6">Fill in the details to create a new job posting</p>
    
    <Separator class="my-6" />

    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
        <input type="text" placeholder="e.g., Senior Developer" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
        <textarea placeholder="Describe the job role and responsibilities" rows="6" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input type="text" placeholder="e.g., Remote, New York" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
          <input type="text" placeholder="e.g., $80k - $120k" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        </div>
      </div>

      <div class="flex gap-4 pt-4">
        <Button @click="handleCancel" variant="outline" class="border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancel
        </Button>
        <Button class="bg-cyan-400 hover:bg-cyan-900 text-white">
          Create Job
        </Button>
      </div>
    </div>
  </div>
</template>
