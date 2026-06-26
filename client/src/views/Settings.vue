<script setup lang="ts">
/**
 * Settings.vue — mirrors MERN Settings.tsx exactly.
 * Uses AuthStore (equivalent of useSelector + useDispatch).
 */
import { ref, watch, onMounted } from 'vue'
import { Save } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()

const form = ref({
  firstName: '', lastName: '', email: '', phoneNumber: '',
  gender: '', dateOfBirth: '', location: '', experienceYears: 0,
  linkedinUrl: '', githubUrl: '', portfolioUrl: '',
})
const formErrors = ref<string[]>([])
const successMessage = ref('')

onMounted(() => authStore.getProfile())

watch(() => authStore.user, (user) => {
  if (!user) return
  form.value = {
    firstName: user.firstName || '', lastName: user.lastName || '',
    email: user.email || '', phoneNumber: user.phoneNumber || '',
    gender: user.gender || '', dateOfBirth: user.dateOfBirth || '',
    location: user.location || '', experienceYears: user.experienceYears || 0,
    linkedinUrl: user.linkedinUrl || '', githubUrl: user.githubUrl || '',
    portfolioUrl: user.portfolioUrl || '',
  }
}, { immediate: true })

const handleSubmit = async () => {
  formErrors.value = []; successMessage.value = ''
  const errors: string[] = []
  if (!form.value.firstName.trim()) errors.push('First name is required')
  if (!form.value.lastName.trim()) errors.push('Last name is required')
  if (!form.value.email.trim()) errors.push('Email is required')
  if (form.value.email && !/\S+@\S+\.\S+/.test(form.value.email)) errors.push('Invalid email address')
  if (errors.length) { formErrors.value = errors; return }
  try {
    await authStore.updateProfile(form.value)
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string; errors?: { msg?: string }[] } } }
    if (e.response?.data?.errors) {
      formErrors.value = e.response.data.errors.map(e => e.msg || '')
    } else {
      formErrors.value = [e.response?.data?.message || 'Failed to update profile']
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
    <div class="border-t border-gray-200 my-6" />

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="formErrors.length" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <ul class="list-disc list-inside"><li v-for="(e, i) in formErrors" :key="i">{{ e }}</li></ul>
      </div>
      <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{{ successMessage }}</div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input v-model="form.firstName" type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input v-model="form.lastName" type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input v-model="form.email" type="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input v-model="form.phoneNumber" type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select v-model="form.gender" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input v-model="form.dateOfBirth" type="date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input v-model="form.location" type="text" placeholder="City, Country" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
        <input v-model.number="form.experienceYears" type="number" min="0" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Social Links</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
          <input v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/yourprofile" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
          <input v-model="form.githubUrl" type="url" placeholder="https://github.com/yourusername" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
          <input v-model="form.portfolioUrl" type="url" placeholder="https://yourportfolio.com" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent" />
        </div>
      </div>

      <div class="flex gap-4 pt-4">
        <button type="submit" :disabled="authStore.loading"
          class="flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-900 text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
          <Save class="w-5 h-5" />
          {{ authStore.loading ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
