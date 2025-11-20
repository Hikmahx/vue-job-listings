<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Field as VeeField } from 'vee-validate'

defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: Array, required: true },
})
</script>

<template>
  <FieldGroup>
    <VeeField v-slot="{ field, errors, value }" :name="name">
      <FieldSet>
        <FieldLegend class="font-bold mb-6">{{ label }}</FieldLegend>

        <FieldGroup data-slot="checkbox-group" class="grid lg:grid-cols-3 gap-3 text-sm">
          <FieldLabel
            v-for="(option, index) in options"
            :key="index"
            :for="`${name}-${option}`"
            class="!border-2 has-[[data-state=checked]]:!bg-cyan-400/30 has-[[data-state=checked]]:!border-cyan-900/50 has-[[data-state=checked]]:!text-cyan-900/90 has-[[data-state=checked]]:!font-bold capitalize"
          >
            <Field orientation="horizontal" class="flex-row-reverse">
              <FieldContent>
                <FieldTitle>{{ option }}</FieldTitle>
              </FieldContent>

              <Checkbox
                :id="`${name}-${option}`"
                :model-value="value?.includes(option) ?? false"
                :aria-invalid="!!errors.length"
                class="accent-cyan-400"
                @update:model-value="
                  (checked) => {
                    const current = value || []
                    const newValue = checked
                      ? [...current, option]
                      : current.filter((v) => v !== option)
                    field.onChange(newValue)
                  }
                "
              />
            </Field>
          </FieldLabel>
        </FieldGroup>
      </FieldSet>
    </VeeField>
  </FieldGroup>
</template>
