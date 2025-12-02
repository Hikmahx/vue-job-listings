<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { ref, watch, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { useFilterStore } from '@/stores/FilterStore'
import SearchAndCountry from './SearchAndCountry.vue'
import RadioGroupField from './RadioGroupField.vue'
import SelectField from './SelectField.vue'
import SalaryRangeInput from './SalaryRangeInput.vue'
const SearchableMultiSelect = defineAsyncComponent(() => import('./SearchableMultiSelect.vue'))
const CheckboxGroupField = defineAsyncComponent(() => import('./CheckboxGroupField.vue'))
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  skillsOptions,
  marketsOptions,
  levelsOptions,
  currenciesOptions,
  workTypesOptions,
  companySizesOptions,
  contractOptions,
  rolesOptions,
} from '@/constants/filters'
import { valLabel } from '@/utils/filters';

const filterStore = useFilterStore()
const filterState = storeToRefs(filterStore)

const formSchema = toTypedSchema(
  z
    .object({
      search: z.string().default(''),
      location: z.string().default(''),
      minSalary: z.union([z.number().min(0, 'Salary cannot be negative'), z.nan()]).optional(),
      maxSalary: z.union([z.number().min(0, 'Salary cannot be negative'), z.nan()]).optional(),
      workType: z.string().default(''),
      level: z.string().default(''),
      skills: z.array(z.string()).default([]),
      markets: z.array(z.string()).default([]),
      companySizes: z.array(z.string()).default([]),
      contract: z.array(z.string()).default([]),
      roles: z.array(z.string()).default([]),
      currency: z.string().default(''),
    })
    .refine(
      (data) => {
        if (data.minSalary && data.maxSalary) {
          return data.minSalary <= data.maxSalary
        }
        return true
      },
      {
        message: 'Minimum salary cannot be higher than maximum salary',
        path: ['maxSalary'],
      },
    ),
)

const showDialog = ref(false)

const { handleSubmit, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    search: filterState.search.value,
    location: filterState.location.value,
    minSalary: filterState.minSalary.value,
    maxSalary: filterState.maxSalary.value,
    workType: filterState.workType.value,
    level: filterState.level.value,
    skills: filterState.skills.value,
    markets: filterState.markets.value,
    companySizes: filterState.companySizes.value,
    contract: filterState.contract.value,
    roles: filterState.roles.value,
    currency: filterState.currency.value,
  },
})

// Set values when dialog opens
watch(showDialog, (isOpen) => {
  if (isOpen) {
    setValues({
      search: filterState.search.value,
      location: filterState.location.value,
      minSalary: filterState.minSalary.value,
      maxSalary: filterState.maxSalary.value,
      workType: filterState.workType.value,
      level: filterState.level.value,
      skills: filterState.skills.value,
      markets: filterState.markets.value,
      companySizes: filterState.companySizes.value,
      contract: filterState.contract.value,
      roles: filterState.roles.value,
      currency: filterState.currency.value,
    })
  }
})

const onSubmit = (values: any) => {
  filterStore.setFilters(values)
  showDialog.value = false
}

const handleFormSubmit = handleSubmit(onSubmit)
</script>

<template>
  <div class="w-full flex md:justify-end">
    <Button
      type="button"
      variant="default"
      size="lg"
      class="bg-cyan-400 h-12 font-medium text-base tracking-wider w-full md:w-fit"
      @click="showDialog = true"
    >
      Advanced Filters
    </Button>

    <Dialog :open="showDialog" @update:open="(value) => (showDialog = value)" class="relative">
      <DialogContent
        v-if="showDialog"
        class="h-full max-h-[80vh] overflow-scroll sm:max-w-2xl lg:max-w-5xl w-[95%] mx-auto py-12"
      >
        <DialogTitle class="sr-only">Advanced Job Filters</DialogTitle>
        <DialogDescription class="sr-only">
          Use the form below to apply advanced filters to your job search.
        </DialogDescription>
        <form
          id="dialogForm"
          @submit.prevent="handleFormSubmit"
          class="w-full flex flex-row flex-wrap gap-5"
        >
          <SearchAndCountry />

          <div class="w-full border rounded-md p-4">
            <RadioGroupField name="workType" label="Work Type" :options="workTypesOptions" />
          </div>
          <hr class="w-full" />

          <div class="w-full border rounded-md p-4">
            <FieldLabel class="font-bold mb-8">Level and Compensation</FieldLabel>
            <div class="flex flex-wrap lg:flex-nowrap flex-row gap-6 w-full">
              <FieldGroup class="flex-1 space-y-4 mt-auto">
                <SelectField
                  name="level"
                  label="Level"
                  :options="levelsOptions"
                  placeholder="Select level..."
                />
              </FieldGroup>

              <SalaryRangeInput>
                <template #currency>
                  <SelectField
                    name="currency"
                    label="Currency"
                    :options="currenciesOptions"
                    placeholder="Select currency"
                  />
                </template>
              </SalaryRangeInput>
            </div>
          </div>
          <hr class="w-full" />

          <div class="flex flex-wrap lg:flex-nowrap flex-row gap-6 w-full">
            <div class="w-full border rounded-md p-4">
              <FieldGroup class="flex-1">
                <SearchableMultiSelect
                  name="skills"
                  label="Skills"
                  :options="valLabel(skillsOptions)"
                  placeholder="Search skills..."
                />
              </FieldGroup>
            </div>
            <div class="w-full border rounded-md p-4">
              <FieldGroup class="flex-1">
                <SearchableMultiSelect
                  name="markets"
                  label="Markets"
                  :options="valLabel(marketsOptions)"
                  placeholder="Search markets..."
                />
              </FieldGroup>
            </div>
          </div>
          <hr class="w-full" />

          <div class="flex flex-col md:flex-row w-full gap-6">
            <div class="w-full border rounded-md p-4">
              <CheckboxGroupField
                name="companySizes"
                label="Company Size"
                :options="companySizesOptions"
              />
            </div>
            <div class="w-full border rounded-md p-4">
              <CheckboxGroupField name="contract" label="Contract" :options="contractOptions" />
            </div>
          </div>
          <hr class="w-full" />

          <div class="w-full border rounded-md p-4">
            <CheckboxGroupField name="roles" label="Roles" :options="rolesOptions" />
          </div>
        </form>

        <DialogFooter class="w-full sticky pt-4 md:px-8 bottom-0">
          <Button
            type="submit"
            form="dialogForm"
            class="h-12 font-medium text-base tracking-wider w-full md:w-fit"
            >Save changes</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
