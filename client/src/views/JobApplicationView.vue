<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import Navbar from '@/components/common/Navbar.vue'
import { ChevronRight } from 'lucide-vue-next'
import { useJobStore } from '@/stores/JobStore'
import Header from '../components/Header.vue'

// Hooks
const router = useRouter()
const route = useRoute()
const jobStore = useJobStore()
const isLoading = ref(false)

const jobId = computed(() => route.params.jobId as string)
const jobDetail = computed(() => jobStore.currentJob)

const formSchema = toTypedSchema(
  z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  }),
)

const { handleSubmit, errors, values } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true
  try {
    console.log('Application submitted:', formValues)
  } catch (error) {
    console.error('Application error:', error)
  } finally {
    isLoading.value = false
  }
})

const breadcrumbs = computed(() => [
  { label: 'Jobs', to: '/jobs' },
  { label: jobDetail.value?.position || 'Job', to: `/jobs/${jobId.value}` },
  { label: 'Apply', to: '' },
])

onMounted(async () => {
  await jobStore.getJobById(jobId.value)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
        
    <div class="container mx-auto max-w-4xl px-4 py-12 -mt-32 relative">
      <div class="flex items-center gap-2 mb-8">
        <router-link v-for="(crumb, index) in breadcrumbs" :key="crumb.label" :to="crumb.to" class="flex items-center gap-2">
          <span :class="{ 'text-cyan-50/60 font-medium': index === breadcrumbs.length - 1, 'text-white hover:underline': index !== breadcrumbs.length - 1 }">
            {{ crumb.label }}
          </span>
          <ChevronRight v-if="index < breadcrumbs.length - 1" class="w-4 h-4 text-cyan-50" />
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-cyan-900 mb-2">Apply for Position</h1>
        <p class="text-gray-600 mb-8">Fill out the form below to submit your application</p>

        <form @submit="onSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="fullName" class="text-gray-700">Full Name</Label>
              <Input
                id="fullName"
                v-model="values.fullName"
                type="text"
                placeholder="John Doe"
              />
              <p v-if="errors.fullName" class="text-red-500 text-sm">{{ errors.fullName }}</p>
            </div>

            <div class="space-y-2">
              <Label for="email" class="text-gray-700">Email Address</Label>
              <Input
                id="email"
                v-model="values.email"
                type="email"
                placeholder="you@example.com"
              />
              <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="phone" class="text-gray-700">Phone Number</Label>
            <Input
              id="phone"
              v-model="values.phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
            <p v-if="errors.phone" class="text-red-500 text-sm">{{ errors.phone }}</p>
          </div>

          <div class="space-y-2">
            <Label for="coverLetter" class="text-gray-700">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              v-model="values.coverLetter"
              placeholder="Tell us why you're a great fit for this role..."
              class="min-h-48"
            />
            <p v-if="errors.coverLetter" class="text-red-500 text-sm">{{ errors.coverLetter }}</p>
          </div>

          <div class="flex gap-4 pt-4">
            <Button
              type="submit"
              :disabled="isLoading"
              class="bg-cyan-400 hover:bg-cyan-900 text-white px-8 h-12"
            >
              {{ isLoading ? 'Submitting...' : 'Submit Application' }}
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="router.back()"
              class="px-8 h-12"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
