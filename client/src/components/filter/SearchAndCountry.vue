<script setup lang="ts">
// import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Check, MapPin, Search } from 'lucide-vue-next'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from '@/components/ui/combobox'
import { reactive } from 'vue'
// defineProps<{
//   state: {
//     countries: { value: string; label: string }[]
//   }
// }>()

const state = reactive({
  countries: [
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
  ],
})

</script>
<template>
  <div class="flex gap-3 w-full">
    <!-- {/* Search Input */} -->
    <div class="relative flex-1">
      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
        <Search class="size-4 text-muted-foreground" />
      </span>
      <Input
        type="text"
        placeholder="Search by role, skill, or company..."
        class="w-full pl-9 h-12 pr-4 py-4 rborder-2 transition-all focus:outline-none focus:ring-2"
      />
    </div>

    <div class="relative">
      <div
        class="flex items-center gap-2 transition-all hover:shadow-md whitespace-nowrap min-w-[200px] justify-between"
      >
        <Combobox v-model="state.countries" by="countries">
          <ComboboxAnchor>
            <div class="relative w-full max-w-sm items-center">
              <ComboboxInput
                class="pl-9 h-12"
                :display-value="(val) => val?.label ?? ''"
                placeholder="Select country..."
              />
              <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                <MapPin class="size-4 text-muted-foreground" />
              </span>
            </div>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxEmpty> No country found. </ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="country in state.countries"
                :key="country.value"
                :value="country"
              >
                {{ country.label }}
                <!-- <ComboboxItemIndicator>
                  <Check class="ml-auto size-4" />
                </ComboboxItemIndicator> -->
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </div>
    </div>
  </div>
</template>
