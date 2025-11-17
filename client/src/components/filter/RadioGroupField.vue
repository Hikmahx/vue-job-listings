<script setup lang="ts">
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field as VeeField } from 'vee-validate'

interface Props {
  name: string
  label: string
  options: string[]
  style?: string
}

defineProps<Props>()
</script>

<template>
  <FieldGroup :class="style">
    <VeeField v-slot="{ field, errors }" :name="name">
      <FieldSet>
        <FieldLegend class="font-bold mb-6">{{ label }}</FieldLegend>

        <RadioGroup
          :name="field.name"
          :model-value="field.value"
          :aria-invalid="!!errors.length"
          @update:model-value="field.onChange"
          class="grid grid-cols-3 gap-3"
        >
          <FieldLabel
            v-for="option in options"
            :key="option"
            :for="`${name}-${option}`"
            class="!border-2 has-[[data-state=checked]]:!bg-cyan-400/30 has-[[data-state=checked]]:border-2 has-[[data-state=checked]]:!border-cyan-900/50 has-[[data-state=checked]]:!text-cyan-900/90 has-[[data-state=checked]]:!font-bold capitalize"
          >
            <Field orientation="horizontal" class="flex-row-reverse">
              <FieldContent>
                <FieldTitle>{{ option }}</FieldTitle>
              </FieldContent>
              <RadioGroupItem
                :id="`${name}-${option}`"
                :value="option"
                :aria-invalid="!!errors.length"
                class="accent-cyan-400"
              />
            </Field>
          </FieldLabel>
        </RadioGroup>
        <FieldError v-if="errors.length" :errors="errors" />
      </FieldSet>
    </VeeField>
  </FieldGroup>
</template>
