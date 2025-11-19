<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { MapPin, Search } from 'lucide-vue-next'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Field as VeeField } from 'vee-validate'

const countries = [
  { value: 'worldwide', label: 'Worldwide' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'spain', label: 'Spain' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'italy', label: 'Italy' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'india', label: 'India' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'japan', label: 'Japan' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'mexico', label: 'Mexico' },
]
</script>

<template>
  <div class="flex gap-3 w-full">
    <!-- Search Input -->
    <div class="flex-1">
      <VeeField v-slot="{ field, errors }" name="search">
        <Field :data-invalid="!!errors.length" class="relative">
          <FieldLabel class="sr-only">Search Jobs</FieldLabel>
          <span class="absolute left-0 inset-y-0 flex items-center px-3 -z-10 w-4">
            <Search class="size-4 text-muted-foreground" />
          </span>
          <Input
            type="text"
            placeholder="Search by role, skill, or company..."
            class="w-full pl-9 h-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
            :id="`form-vee-search`"
            v-bind="field"
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            @update:model-value="field.onChange"
          />
        </Field>
      </VeeField>
    </div>

    <!-- Country Select -->
    <div class="relative">
      <VeeField v-slot="{ field }" name="country">
        <Combobox :model-value="field.value" @update:model-value="field.onChange">
          <ComboboxAnchor>
            <div class="relative w-full max-w-sm items-center">
              <ComboboxInput
                class="pl-9 h-12"
                :display-value="
                  (val) => {
                    const country = countries.find((c) => c.value === val)
                    return country?.label || ''
                  }
                "
                placeholder="Select country..."
              />
              <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                <MapPin class="size-4 text-muted-foreground" />
              </span>
            </div>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxEmpty>No country found.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="country in countries"
                :key="country.value"
                :value="country.value"
              >
                {{ country.label }}
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </VeeField>
    </div>
  </div>
</template>
