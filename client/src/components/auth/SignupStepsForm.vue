<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import TextInput from './TextInput.vue'
import SelectInput from './SelectInput.vue'
import PasswordInput from './PasswordInput.vue'
import DateInput from './DateInput.vue'

const props = defineProps<{
  modelValue: {
    firstName: string
    lastName: string
    email: string
    phone: string
    gender: string
    dob: string
    password: string
    confirmPassword: string
    accountType: string
    experience: string
    linkedin: string
    github: string
    portfolio: string
    resume: string
  }
  currentStep: number
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
  stepChange: [step: number]
  complete: []
}>()

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const accountTypeOptions = [
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'founder', label: 'Founder' },
  { value: 'employee', label: 'Employee' },
]

// Create separate schemas for each step
const step1Schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    gender: z.string().min(1, 'Gender is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
)

const step2Schema = toTypedSchema(
  z.object({
    accountType: z.string().min(1, 'Account type is required'),
  })
)

const step3Schema = toTypedSchema(
  z.object({
    experience: z.string().min(1, 'Years of experience is required'),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  })
)

// Create separate form instances for each step
const step1Form = useForm({
  validationSchema: step1Schema,
  initialValues: {
    firstName: props.modelValue.firstName,
    lastName: props.modelValue.lastName,
    email: props.modelValue.email,
    phone: props.modelValue.phone,
    gender: props.modelValue.gender,
    dob: props.modelValue.dob,
    password: props.modelValue.password,
    confirmPassword: props.modelValue.confirmPassword,
  },
})

const step2Form = useForm({
  validationSchema: step2Schema,
  initialValues: {
    accountType: props.modelValue.accountType,
  },
})

const step3Form = useForm({
  validationSchema: step3Schema,
  initialValues: {
    experience: props.modelValue.experience,
    linkedin: props.modelValue.linkedin,
    github: props.modelValue.github,
    portfolio: props.modelValue.portfolio,
  },
})

const submitAttempted = ref(false)

// Get current form based on step
const currentForm = computed(() => {
  switch (props.currentStep) {
    case 1: return step1Form
    case 2: return step2Form
    case 3: return step3Form
    default: return step1Form
  }
})

const currentErrors = computed(() => currentForm.value.errors.value)
const currentValues = computed(() => currentForm.value.values)

// Sync form values to parent on change
watch(
  () => props.modelValue,
  (newValue) => {
    step1Form.setValues({
      firstName: newValue.firstName,
      lastName: newValue.lastName,
      email: newValue.email,
      phone: newValue.phone,
      gender: newValue.gender,
      dob: newValue.dob,
      password: newValue.password,
      confirmPassword: newValue.confirmPassword,
    })
    step2Form.setValues({
      accountType: newValue.accountType,
    })
    step3Form.setValues({
      experience: newValue.experience,
      linkedin: newValue.linkedin,
      github: newValue.github,
      portfolio: newValue.portfolio,
    })
  },
  { deep: true },
)

const updateFormValue = (field: keyof typeof props.modelValue, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const getError = (field: string): string | undefined => {
  return submitAttempted.value ? (currentErrors.value as any)[field] : undefined
}

// Step submission handlers
const onStep1Submit = async () => {
  console.log('Step 1 submit clicked')
  submitAttempted.value = true
  
  const { valid } = await step1Form.validate()
  
  if (valid) {
    console.log('Step 1 validation passed, moving to step 2')
    submitAttempted.value = false
    emit('stepChange', 2)
  } else {
    console.log('Step 1 validation failed:', step1Form.errors.value)
  }
}

const onStep2Submit = async () => {
  console.log('Step 2 submit clicked')
  submitAttempted.value = true
  
  const { valid } = await step2Form.validate()
  
  if (valid) {
    console.log('Step 2 validation passed, moving to step 3')
    submitAttempted.value = false
    emit('stepChange', 3)
  } else {
    console.log('Step 2 validation failed:', step2Form.errors.value)
  }
}

const onStep3Submit = async () => {
  console.log('Step 3 submit clicked')
  submitAttempted.value = true
  
  const { valid } = await step3Form.validate()
  
  if (valid) {
    console.log('Step 3 validation passed, completing registration')
    submitAttempted.value = false
    
    // Validate all steps before completing
    const step1Valid = (await step1Form.validate()).valid
    const step2Valid = (await step2Form.validate()).valid
    const step3Valid = (await step3Form.validate()).valid
    
    if (step1Valid && step2Valid && step3Valid) {
      console.log('All steps valid, completing')
      emit('complete')
    } else {
      console.log('Some steps are invalid, cannot complete')
      // Go back to first invalid step
      if (!step1Valid) {
        submitAttempted.value = false
        emit('stepChange', 1)
      } else if (!step2Valid) {
        submitAttempted.value = false
        emit('stepChange', 2)
      }
    }
  } else {
    console.log('Step 3 validation failed:', step3Form.errors.value)
  }
}

const goBack = () => {
  console.log('Going back to step', props.currentStep - 1)
  submitAttempted.value = false
  emit('stepChange', props.currentStep - 1)
}

// Clear submitAttempted when step changes
watch(() => props.currentStep, () => {
  console.log('Step changed to:', props.currentStep)
  submitAttempted.value = false
}, { immediate: true })
</script>

<template>
  <div class="w-full space-y-6">


    <!-- STEP 1: Create Account -->
    <form v-if="currentStep === 1" @submit.prevent="onStep1Submit" class="space-y-4">
      <!-- First and Last Name Row -->
      <div class="grid grid-cols-2 gap-4">
        <TextInput
          :model-value="step1Form.values.firstName"
          placeholder="First Name"
          :error="getError('firstName')"
          @update:model-value="updateFormValue('firstName', $event)"
        />
        <TextInput
          :model-value="step1Form.values.lastName"
          placeholder="Last Name"
          :error="getError('lastName')"
          @update:model-value="updateFormValue('lastName', $event)"
        />
      </div>

      <!-- Email -->
      <TextInput
        :model-value="step1Form.values.email"
        type="email"
        placeholder="Email address"
        :error="getError('email')"
        @update:model-value="updateFormValue('email', $event)"
      />

      <!-- Phone and Gender Row -->
      <div class="grid grid-cols-2 gap-4">
        <TextInput
          :model-value="step1Form.values.phone"
          type="tel"
          placeholder="Phone Number"
          :error="getError('phone')"
          @update:model-value="updateFormValue('phone', $event)"
        />
        <SelectInput
          :model-value="step1Form.values.gender"
          placeholder="Gender"
          :options="genderOptions"
          :error="getError('gender')"
          @update:model-value="updateFormValue('gender', $event)"
        />
      </div>

      <!-- DOB -->
      <DateInput
        :model-value="step1Form.values.dob"
        :error="getError('dob')"
        @update:model-value="updateFormValue('dob', $event)"
      />

      <!-- Password -->
      <PasswordInput
        :model-value="step1Form.values.password"
        placeholder="Password"
        :error="getError('password')"
        @update:model-value="updateFormValue('password', $event)"
      />

      <!-- Confirm Password -->
      <PasswordInput
        :model-value="step1Form.values.confirmPassword"
        placeholder="Confirm Password"
        :error="getError('confirmPassword')"
        @update:model-value="updateFormValue('confirmPassword', $event)"
      />

      <!-- Next Button -->
      <button
        type="submit"
        class="w-full bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition"
      >
        Next Step
      </button>
    </form>

    <!-- STEP 2: Account Type -->
    <form v-else-if="currentStep === 2" @submit.prevent="onStep2Submit" class="space-y-4">
      <!-- Account Type Options Display -->
      <div class="space-y-3 mt-6">
        <div
          v-for="option in accountTypeOptions"
          :key="option.value"
          :class="[
            'px-4 py-3 rounded cursor-pointer transition border',
            step2Form.values.accountType === option.value
              ? 'bg-cyan-400 text-white border-cyan-400'
              : 'text-grayish-cyan hover:bg-gray-100 border-gray-300',
          ]"
          @click="updateFormValue('accountType', option.value)"
        >
          {{ option.label }}
        </div>
      </div>
      <p v-if="getError('accountType')" class="text-red-500 text-sm">
        {{ getError('accountType') }}
      </p>

      <!-- Navigation Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="goBack"
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-cyan-900 font-semibold py-3 rounded-lg transition"
        >
          Back
        </button>
        <button
          type="submit"
          class="flex-1 bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition"
        >
          Next Step
        </button>
      </div>
    </form>

    <!-- STEP 3: Profile Details -->
    <form v-else-if="currentStep === 3" @submit.prevent="onStep3Submit" class="space-y-4">
      <!-- Years of Experience -->
      <TextInput
        :model-value="step3Form.values.experience"
        placeholder="Years of Experience"
        :error="getError('experience')"
        @update:model-value="updateFormValue('experience', $event)"
      />

      <!-- LinkedIn URL -->
      <TextInput
        :model-value="step3Form.values.linkedin"
        placeholder="https://www.linkedin.com/in/username"
        :error="getError('linkedin')"
        @update:model-value="updateFormValue('linkedin', $event)"
      />

      <!-- GitHub URL -->
      <TextInput
        :model-value="step3Form.values.github"
        placeholder="https://www.github.com/username"
        :error="getError('github')"
        @update:model-value="updateFormValue('github', $event)"
      />

      <!-- Portfolio URL -->
      <TextInput
        :model-value="step3Form.values.portfolio"
        placeholder="https://www.portfolio.com"
        :error="getError('portfolio')"
        @update:model-value="updateFormValue('portfolio', $event)"
      />

      <!-- Navigation Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="goBack"
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-cyan-900 font-semibold py-3 rounded-lg transition"
        >
          Back
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="flex-1 bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {{ isLoading ? 'Completing...' : 'Complete' }}
        </button>
      </div>
    </form>
  </div>
</template>