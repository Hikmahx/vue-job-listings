<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    type?: string
    error?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div>
    <input
      :value="modelValue || ''"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 placeholder-grayish-cyan focus:outline-none focus:ring-1 focus:ring-cyan-400"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>
