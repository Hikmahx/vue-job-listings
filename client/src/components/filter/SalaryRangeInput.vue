<script setup lang="ts">
import { Field, FieldLabel } from '@/components/ui/field'
import Input from '../ui/input/Input.vue'

interface Props {
  minSalary?: number
  maxSalary?: number
}

const props = withDefaults(defineProps<Props>(), {
  minSalary: 1000,
  maxSalary: 20000,
})

const emit = defineEmits<{
  'update:minSalary': [value: number]
  'update:maxSalary': [value: number]
}>()
</script>

<template>
  <div class="space-y-4 flex">
    <div class="flex items-center justify-between sr-only">
      <FieldLabel class="text-cyan-900">Compensation</FieldLabel>
    </div>

    <div class="flex gap-4">
      <!-- Min Salary -->
      <div class="flex gap-4 items-center h-fit">
        <div>
          <FieldLabel class="sr-only">Min Salary</FieldLabel>
          <Field>
            <Input
              type="text"
              placeholder="e.g. 50000"
              :model-value="minSalary"
              @update:model-value="(value) => emit('update:minSalary', Number(value))"
              class="w-full pl-9 h-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
            />
          </Field>
        </div>
        <span>-</span>
        <!-- Max Salary -->
        <div>
          <FieldLabel class="sr-only">Max Salary</FieldLabel>
          <Field>
            <Input
              placeholder="e.g. 150000"
              :model-value="maxSalary"
              @update:model-value="(value) => emit('update:maxSalary', Number(value))"
              class="w-full pl-9 h-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
            />
          </Field>
        </div>
      </div>
      <slot name="currency" />
    </div>
  </div>
</template>