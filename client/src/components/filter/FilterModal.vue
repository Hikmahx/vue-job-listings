<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { h, ref } from 'vue'
import * as z from 'zod'
import SearchAndCountry from './SearchAndCountry.vue'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  // DialogHeader,
  // DialogTitle,
  // DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  //   FormControl,
  //   FormDescription,
  //   FormField,
  //   FormItem,
  //   FormLabel,
  //   FormMessage,
} from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useForm, Field as VeeField } from 'vee-validate'
import {
  Field,
  FieldContent,
  FieldDescription,
  // FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import CheckboxGroupField from './CheckboxGroupField.vue'
import Input from '../ui/input/Input.vue'

const formSchema = toTypedSchema(
  z.object({
    workType: z.string().min(2).max(50),
    // keyword: z.string().min(2).max(50),
    spokenLanguages: z.string(),
    skills: z.array(z.string()).default([]),
    markets: z.array(z.string()).default([]),
  }),
)

const { handleSubmit, resetForm, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    workType: '',
    skills: [],
    markets: [],
  },
})

const showDialog = ref(false)

const onSubmit = handleSubmit((values) => {
  console.log('Form submitted with values:', values)
  console.log({
    title: 'You submitted the following values:',
    description: h(
      'pre',
      { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' },
      h('code', { class: 'text-white' }, JSON.stringify(values, null, 2)),
    ),
  })

  showDialog.value = false
})

const valLabel = (arr: string[]) => {
  return arr.map((item: string) => ({
    value: item.toLowerCase(),
    label: item,
  }))
}
const spokenLanguages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
] as const

const allSkills = [
  'JavaScript',
  'React.js',
  'React',
  'Python',
  'Node.js',
  'TypeScript',
  'Java',
  'Ruby on Rails',
  'CSS',
  'HTML',
  'Angular',
  'Vue.js',
  'Sass',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'GraphQL',
  'REST API',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Redux',
  'Next.js',
  'Express.js',
]

const allMarkets = [
  'SaaS',
  'FinTech',
  'HealthTech',
  'E-commerce',
  'Education',
  'Enterprise Software',
  'Marketplace',
  'AI/ML',
  'DevTools',
  'Gaming',
  'Social Media',
  'Cryptocurrency',
  'Security',
  'Climate Tech',
  'Real Estate',
  'Travel',
  'Food & Beverage',
]

const allRoleTypes = [
  'Backend Engineer',
  'Frontend Engineer',
  'Full-Stack Engineer',
  'Mobile Engineer',
  'DevOps Engineer',
  'Data Engineer',
]
const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+']
const jobTypes = ['full-time', 'part-time', 'contract', 'internship']
const roleTypes = [
  'Backend Engineer',
  'Frontend Engineer',
  'Full-Stack Engineer',
  'Mobile Engineer',
  'DevOps Engineer',
  'Data Engineer',
]
const compensation = { min: 1000, max: 20000 }
const currencies = valLabel(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'SGD'])

const skills = valLabel(allSkills)
const selectedSkills = ref([skills[0], skills[1]])
const markets = valLabel(allMarkets)
</script>

<template>
  <Form v-slot="{ handleSubmit }" as="" keep-values :validation-schema="formSchema">
    <Button variant="default" class="bg-cyan-400" @click="showDialog = true">
      Advanced Filters
    </Button>

    <Dialog :open="showDialog" @update:open="(value) => (showDialog = value)" class="relative">
      <DialogContent
        class="h-full max-h-[70vh] overflow-scroll sm:max-w-2xl lg:max-w-5xl w-[95%] mx-auto py-12"
      >
        <!-- <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader> -->
        <form
          id="dialogForm"
          @submit="handleSubmit($event, onSubmit)"
          class="flex flex-row flex-wrap gap-5"
        >
          <SearchAndCountry />
          <FieldGroup class="">
            <VeeField v-slot="{ field, errors }" name="workType">
              <FieldSet>
                <FieldLegend class="font-bold mb-6">Work Type</FieldLegend>
                <RadioGroup
                  :name="field.name"
                  :model-value="field.value"
                  :aria-invalid="!!errors.length"
                  @update:model-value="field.onChange"
                  class="grid grid-cols-3 gap-3"
                >
                  <FieldLabel
                    v-for="(workType, index) in ['remote', 'hybrid', 'onsite']"
                    :key="index"
                    :for="`form-vee-radiogroup-${workType}`"
                    class="!border-2 has-[[data-state=checked]]:!bg-cyan-400/30 has-[[data-state=checked]]:border-2 has-[[data-state=checked]]:!border-cyan-900/50 has-[[data-state=checked]]:!text-cyan-900/90 has-[[data-state=checked]]:!font-bold capitalize"
                  >
                    <Field orientation="horizontal" class="flex-row-reverse">
                      <FieldContent>
                        <FieldTitle>{{ workType }}</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        :id="`form-vee-radiogroup-${workType}`"
                        :value="workType"
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
          <div class="flex flex-wrap lg:flex-nowrap flex-row gap-6 w-full">
            <FieldGroup class="flex-1">
              <VeeField v-slot="{ errors }" name="language">
                <Field orientation="responsive" :data-invalid="!!errors.length">
                  <FieldContent>
                    <FieldLabel for="form-vee-select-language"> Spoken Language </FieldLabel>
                    <FieldError v-if="errors.length" :errors="errors" />
                  </FieldContent>
                  <Combobox v-model="spokenLanguages" multiple by="countries">
                    <ComboboxAnchor>
                      <div class="relative w-full max-w-sm items-center">
                        <ComboboxInput
                          class="pl-9 h-12"
                          :display-value="(val) => val?.label ?? ''"
                          placeholder="Select language..."
                        />
                        <span
                          class="absolute start-0 inset-y-0 flex items-center justify-center px-3"
                        >
                          <MapPin class="size-4 text-muted-foreground" />
                        </span>
                      </div>
                    </ComboboxAnchor>
                    <ComboboxList>
                      <ComboboxEmpty> No language found. </ComboboxEmpty>
                      <ComboboxGroup>
                        <ComboboxItem
                          v-for="language in spokenLanguages"
                          :key="language.value"
                          :value="language"
                        >
                          {{ language.label }}
                          <ComboboxItemIndicator>
                            <Check class="ml-auto size-4" />
                          </ComboboxItemIndicator>
                        </ComboboxItem>
                      </ComboboxGroup>
                    </ComboboxList>
                  </Combobox>
                </Field>
              </VeeField>
            </FieldGroup>
            <div class="space-y-4 flex">
              <div class="flex items-center justify-between">
                <FieldLabel class="text-cyan-900">Compensation</FieldLabel>
              </div>

              <div class="flex gap-4">
                <!-- MIN SALARY -->
                <div class="flex gap-4 items-center">
                  <div>
                    <FieldLabel class="text-sm text-cyan-400/60 sr-only">Min Salary</FieldLabel>
                    <Field>
                      <Input
                        type="text"
                        placeholder="e.g. 50000"
                        v-model="compensation.min"
                        class="w-full pl-9 h-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
                      />
                    </Field>
                  </div>
                  <span>-</span>
                  <!-- MAX SALARY -->
                  <div>
                    <FieldLabel class="text-sm text-cyan-400/60 sr-only">Max Salary</FieldLabel>
                    <Field>
                      <Input
                        placeholder="e.g. 150000"
                        v-model="compensation.max"
                        class="w-full pl-9 h-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
                      />
                    </Field>
                  </div>
                </div>
                <!-- CURRENCY -->
                <FieldGroup>
                  <VeeField v-slot="{ field, errors }" name="currency">
                    <FieldContent class="sr-only">
                      <FieldLabel for="form-vee-select-currency"> Currency </FieldLabel>

                      <FieldError v-if="errors.length" :errors="errors" />
                    </FieldContent>
                    <Field orientation="responsive" :data-invalid="!!errors.length" class="gap-0">
                      <Select
                        :name="field.name"
                        :model-value="field.value"
                        @update:model-value="field.onChange"
                      >
                        <SelectTrigger
                          id="form-vee-select-currency"
                          :aria-invalid="!!errors.length"
                          class="min-w-[120px] h-12"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="auto"> Auto </SelectItem>
                          <SelectSeparator />
                          <SelectItem
                            v-for="currency in currencies"
                            :key="currency.value"
                            :value="currency.value"
                          >
                            {{ currency.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </VeeField>
                </FieldGroup>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap lg:flex-nowrap flex-row gap-6 w-full">
            <FieldGroup class="flex-1">
              <VeeField v-slot="{ errors }" name="skills">
                <Field orientation="responsive" :data-invalid="!!errors.length">
                  <FieldContent>
                    <FieldLabel>Skills</FieldLabel>
                    <FieldError v-if="errors.length" :errors="errors" />
                  </FieldContent>
                  <Command>
                    <CommandInput placeholder="Search skills..." class="h-12" />
                    <CommandList>
                      <CommandEmpty>No skills found.</CommandEmpty>
                      <CommandGroup class="max-h-40 overflow-auto">
                        <CommandItem
                          v-for="skill in skills"
                          :key="skill.value"
                          :value="skill.value"
                          class="flex items-center space-x-2 p-2"
                        >
                          <Checkbox />
                          <span>{{ skill.label }}</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </Field>
              </VeeField>
            </FieldGroup>
            <FieldGroup class="flex-1">
              <VeeField v-slot="{ errors }" name="markets">
                <Field orientation="responsive" :data-invalid="!!errors.length">
                  <FieldContent>
                    <FieldLabel>Markets</FieldLabel>
                    <FieldError v-if="errors.length" :errors="errors" />
                  </FieldContent>

                  <Command>
                    <CommandInput placeholder="Search markets..." class="h-12" />
                    <CommandList>
                      <CommandEmpty>No markets found.</CommandEmpty>
                      <CommandGroup class="max-h-40 overflow-auto">
                        <CommandItem
                          v-for="market in markets"
                          :key="market.value"
                          :value="market.value"
                          class="flex items-center space-x-2 p-2"
                        >
                          <Checkbox />
                          <span>{{ market.label }}</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </Field>
              </VeeField>
            </FieldGroup>
          </div>
          <div class="flex w-full gap-6">
            <CheckboxGroupField
              name="companySizes"
              label="Company Size"
              :options="companySizes"
              :style="'flex-1'"
            />
            <CheckboxGroupField
              name="jobTypes"
              label="Job Types"
              :options="jobTypes"
              :style="'flex-1'"
            />
          </div>
          <CheckboxGroupField name="roleTypes" label="Role Types" :options="roleTypes" />
        </form>

        <DialogFooter class="w-full sticky pt-4 px-8 bottom-0">
          <Button type="submit" form="dialogForm"> Save changes </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
