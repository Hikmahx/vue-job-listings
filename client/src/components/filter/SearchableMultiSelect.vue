<script setup lang="ts">
import { Field as VeeField } from 'vee-validate'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'

interface Option {
  value: string
  label: string
}

interface Props {
  name: string
  label: string
  options: Option[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
})
</script>

<template>
  <VeeField v-slot="{ field, errors }" :name="name">
    <Field orientation="responsive" :data-invalid="!!errors.length">
      <FieldContent>
        <FieldLabel class="font-bold">{{ label }}</FieldLabel>
        <FieldError v-if="errors.length" :errors="errors" />
      </FieldContent>
      <Command>
        <CommandInput :placeholder="placeholder" class="h-12" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup class="max-h-40 overflow-auto">
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="flex items-center space-x-2 p-2"
            >
              <Checkbox
                :model-value="field.value?.includes(option.value) ?? false"
                :aria-invalid="!!errors.length"
                @update:model-value="
                  (checked) => {
                    const current = field.value || []
                    const newValue = checked
                      ? [...current, option.value]
                      : current.filter((v) => v !== option.value)
                    field.onChange(newValue)
                  }
                "
              />
              <span>{{ option.label }}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </Field>
  </VeeField>
</template>
