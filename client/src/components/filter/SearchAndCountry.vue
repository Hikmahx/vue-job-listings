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
import countriesData from 'countries-list-json'
import { valLabel } from '@/utils/filters'

const countries = valLabel(Object.values(countriesData).map((country: any) => country.name))
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 w-full">
    <!-- Search Input -->
    <div class="flex-1">
      <VeeField v-slot="{ field, errors, value }" name="search">
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
            :model-value="value"
            :aria-invalid="!!errors.length"
            @update:model-value="field.onChange"
          />
        </Field>
      </VeeField>
    </div>

    <!-- Location Select -->
    <div class="relative flex justify-end">
      <VeeField v-slot="{ field, value }" name="location">
        <Combobox
          :model-value="value"
          @update:model-value="field.onChange"
          class="w-full sm:w-[200px]"
        >
          <ComboboxAnchor>
            <div class="relative w-full max-w-sm items-center">
              <ComboboxInput
                class="pl-9 h-12"
                :display-value="
                  (val) => {
                    const location = countries.find((c) => c.value === val)
                    return location?.label || ''
                  }
                "
                placeholder="Select location..."
              />
              <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                <MapPin class="size-4 text-muted-foreground" />
              </span>
            </div>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxEmpty>No location found.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="location in countries"
                :key="location.value"
                :value="location.value"
              >
                {{ location.label }}
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </VeeField>
    </div>
  </div>
</template>
