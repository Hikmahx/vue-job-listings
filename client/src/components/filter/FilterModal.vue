<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { h, ref } from 'vue'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = toTypedSchema(
  z.object({
    keyword: z.string().min(2).max(50),
  }),
)

const showDialog = ref(false)

function onSubmit(values: any) {
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
}
</script>

<template>
  <Form v-slot="{ handleSubmit }" as="" keep-values :validation-schema="formSchema">
    <Button variant="default" class="bg-cyan-400" @click="showDialog = true">
      Advanced Filters
    </Button>
    
    <Dialog :open="showDialog" @update:open="(value) => showDialog = value">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form id="dialogForm" @submit="handleSubmit($event, onSubmit)">
          <FormField v-slot="{ componentField }" name="keyword">
            <FormItem>
              <FormLabel>Keyword</FormLabel>
              <FormControl>
                <Input type="text" placeholder="shadcn" v-bind="componentField" />
              </FormControl>
              <FormDescription> This is your public display name. </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <DialogFooter>
          <Button type="submit" form="dialogForm">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
