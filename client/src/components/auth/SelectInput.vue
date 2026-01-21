<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    options: Array<{ value: string; label: string }>
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
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div>
    <select
      :value="modelValue || ''"
      class="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none bg-white cursor-pointer"
      @change="handleInput"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="text-red-500 italic text-xs mt-1">{{ error }}</p>
  </div>
</template>
