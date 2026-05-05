import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type RegisterPayload, type LoginPayload } from '@/services/authService'

export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: 'job_seeker' | 'team_member'
  phoneNumber?: string
  gender?: 'male' | 'female' | 'other'
  dateOfBirth?: string
  location?: string
  experienceYears?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  createdAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authService.getStoredUser())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => authService.isAuthenticated())

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.register(payload)
      user.value = res.user
      return res.user
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      error.value = e.detail || e.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(payload)
      user.value = res.user
      return res.user
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      error.value = e.detail || e.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authService.logout()
    } finally {
      user.value = null
      loading.value = false
    }
  }

  async function getProfile() {
    loading.value = true
    error.value = null
    try {
      const profile = await authService.getProfile()
      user.value = profile
      return profile
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      error.value = e.detail || e.message || 'Failed to get profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    loading.value = true
    error.value = null
    try {
      const profile = await authService.updateProfile(data)
      user.value = profile
      return profile
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      error.value = e.detail || e.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return {
    user, loading, error, isAuthenticated,
    register, login, logout, getProfile, updateProfile, clearError,
  }
})
