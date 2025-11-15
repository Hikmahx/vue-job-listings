<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { h, ref } from 'vue'
import * as z from 'zod'

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
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
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
const formSchema = toTypedSchema(
  z.object({
    workType: z.string().min(2).max(50),
    keyword: z.string().min(2).max(50),
    // keyword: z.string().min(2).max(50),
    // keyword: z.string().min(2).max(50),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    workType: '',
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
</script>

<template>
  <form @submit="onSubmit">
    <Button variant="default" class="bg-cyan-400" @click="showDialog = true">
      Advanced Filters
    </Button>

    <Dialog :open="showDialog" @update:open="(value) => (showDialog = value)">
      <DialogContent class="sm:max-w-2xl lg:max-w-5xl w-[95%] mx-auto py-12">
        <!-- <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader> -->
        <div class="flex flex-wrap gap-5">
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
                <!-- <FieldError v-if="errors.length"
               :errors="errors"
                /> -->
              </FieldSet>
            </VeeField>
          </FieldGroup>

        </div>
        <DialogFooter>
          <Button type="submit" form="dialogForm"> Save changes </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </form>
</template>
