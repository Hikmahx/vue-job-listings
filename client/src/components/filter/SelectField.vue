<script setup lang="ts">
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field as VeeField } from 'vee-validate'

interface Option {
  value: string
  label: string
}

interface Props {
  name: string
  label: string
  options: Option[]
  placeholder?: string
  style?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Select',
  style: '',
})
</script>

<template>
  <FieldGroup :class="style">
    <VeeField v-slot="{ field, errors, value }" :name="name">
      <Field orientation="responsive" :data-invalid="!!errors.length" class="gap-0">
        <FieldContent class="sr-only">
          <FieldLabel :for="`form-vee-select-${name}`">{{ label }}</FieldLabel>
          <FieldError v-if="errors.length" :errors="errors" />
        </FieldContent>

        <Select :name="field.name" :model-value="value" @update:model-value="field.onChange">
          <SelectTrigger
            :id="`form-vee-select-${name}`"
            :aria-invalid="!!errors.length"
            class="min-w-[120px] h-12"
          >
            <SelectValue :placeholder="placeholder">
              {{ options.find((opt) => opt.value === value)?.label || placeholder }}
            </SelectValue>
          </SelectTrigger>

          <SelectContent position="item-aligned">
            <SelectItem v-for="option in options" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </VeeField>
  </FieldGroup>
</template>
