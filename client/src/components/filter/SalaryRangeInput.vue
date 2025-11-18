<script setup lang="ts">
import { Field, FieldLabel } from '@/components/ui/field'
import { Field as VeeField } from 'vee-validate'
import Input from '../ui/input/Input.vue'
</script>

<template>
  <div class="space-y-4 flex">
    <div class="flex items-center justify-between sr-only">
      <FieldLabel class="text-cyan-900">Compensation</FieldLabel>
    </div>

    <div class="flex gap-4">
      <!-- Min Salary -->
      <div class="flex gap-4 items-center h-fit">
        <VeeField v-slot="{ field, errors }" name="minSalary">
          <Field :data-invalid="!!errors.length">
            <FieldLabel class="sr-only">Min Salary</FieldLabel>
            <Input
              type="number"
              placeholder="Min"
              :id="`form-vee-demo-minSalary`"
              v-bind="field"
              :aria-invalid="!!errors.length"
              class="w-24 h-12 px-3 transition-all focus:outline-none focus:ring-2"
            />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>
        <span class="text-gray-500">-</span>
        <!-- Max Salary -->
        <VeeField v-slot="{ field, errors }" name="maxSalary">
          <Field :data-invalid="!!errors.length">
            <FieldLabel class="sr-only">Max Salary</FieldLabel>
            <Input
              :id="`form-vee-demo-maxSalary`"
              type="number"
              v-bind="field"
              :aria-invalid="!!errors.length"
              placeholder="Max"
              class="w-24 h-12 px-3 transition-all focus:outline-none focus:ring-2"
            />
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>
      </div>
      <slot name="currency" />
    </div>
  </div>
</template>
