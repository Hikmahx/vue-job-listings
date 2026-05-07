<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { authService } from '@/services/authService'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import TextInput from '@/components/auth/TextInput.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'

const router = useRouter()

const { handleSubmit, errors, values, setFieldValue, submitCount } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  ),
  initialValues: {
    email: '',
    password: '',
  },
})

const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authService.login({
      email: formValues.email,
      password: formValues.password,
    })
    router.push('/dashboard')
  } catch (error: any) {
    const payload = error.response?.data || error
    errorMessage.value = payload.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
})

const updateField = (field: 'email' | 'password', value: string) => {
  setFieldValue(field, value)
}
</script>

<template>
  <AuthLayout title="Login">
    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
    >
      {{ errorMessage }}
    </div>

    <form @submit.prevent="onSubmit" class="space-y-5">
      <!-- Email Input -->
      <TextInput
        :model-value="values.email"
        type="email"
        placeholder="Email address"
        :error="submitCount > 0 ? errors.email : ''"
        @update:model-value="updateField('email', $event)"
      />

      <!-- Password -->
      <PasswordInput
        :model-value="values.password"
        placeholder="Password"
        :error="submitCount > 0 ? errors.password : ''"
        @update:model-value="updateField('password', $event)"
      />

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {{ isLoading ? 'Logging in...' : 'Submit' }}
      </button>
    </form>

    <template #footer>
      Don't have an account?
      <router-link to="/signup" class="text-cyan-900 font-semibold underline">
        Sign Up
      </router-link>
    </template>
  </AuthLayout>
</template>
