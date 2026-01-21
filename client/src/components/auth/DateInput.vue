<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    error?: string
  }>(),
  {
    modelValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <input
      :value="modelValue || ''"
      type="date"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-400"
      @input="handleInput"
    />
    <p v-if="error" class="text-red-500 italic text-xs mt-1">{{ error }}</p>
  </div>
</template>