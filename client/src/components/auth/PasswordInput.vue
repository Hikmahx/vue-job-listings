<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    error?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Password',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <div class="relative">
      <input
        :value="modelValue || ''"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        class="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 placeholder-grayish-cyan focus:outline-none focus:ring-1 focus:ring-cyan-400"
        @input="handleInput"
      />
      <button
        type="button"
        @click="togglePassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-grayish-cyan hover:text-cyan-900 transition"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
      >
        <Eye v-if="!showPassword" class="w-5 h-5" />
        <EyeOff v-else class="w-5 h-5" />
      </button>
    </div>
    <p v-if="error" class="text-red-500 italic text-xs mt-1">{{ error }}</p>
  </div>
</template>
