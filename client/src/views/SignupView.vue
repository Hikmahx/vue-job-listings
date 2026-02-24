<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService, type RegisterPayload } from '@/services/authService'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import SignupStepsForm from '@/components/auth/SignupStepsForm.vue'

const router = useRouter()

const isLoading = ref(false)
const errorMessage = ref('')
const currentStep = ref(1)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dob: '',
  password: '',
  confirmPassword: '',
  accountType: '',
  experience: '',
  linkedin: '',
  github: '',
  portfolio: '',
  resume: '',
})

const handleFormSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    // Map founder and employee to team_member role
    const role = formData.value.accountType === 'job_seeker' ? 'job_seeker' : 'team_member'

    const payload: RegisterPayload = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      password: formData.value.password,
      password2: formData.value.confirmPassword,
      phoneNumber: formData.value.phone,
      gender: formData.value.gender,
      dateOfBirth: formData.value.dob,
      role: role,
      location: '',
      experienceYears: parseInt(formData.value.experience) || 0,
      linkedinUrl: formData.value.linkedin,
      githubUrl: formData.value.github,
      portfolioUrl: formData.value.portfolio,
    }
    await authService.register(payload)
    router.push('/dashboard')
  } catch (error: any) {
    errorMessage.value = error.detail || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleStepChange = (step: number) => {
  currentStep.value = step
}

const handleFormChange = (data: typeof formData.value) => {
  formData.value = data
}
</script>

<template>
  <AuthLayout
    title="Create Account"
    :show-divider="true"
    :current-step="currentStep"
    :signup-page="true"
  >
    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4"
    >
      {{ errorMessage }}
    </div>

    <SignupStepsForm
      :model-value="formData"
      :current-step="currentStep"
      :is-loading="isLoading"
      @update:model-value="handleFormChange"
      @step-change="handleStepChange"
      @complete="handleFormSubmit"
    />

    <template #footer>
      Already have an account?
      <router-link to="/login" class="text-cyan-900 font-semibold underline"> Log in </router-link>
    </template>
  </AuthLayout>
</template>
