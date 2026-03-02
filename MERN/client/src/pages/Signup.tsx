import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AppDispatch, RootState } from '../redux/store'
import { register } from '../redux/reducers/authSlice'
import AuthLayout from '../components/Auth/AuthLayout'
import FormField from '../components/Auth/FormField'
import FormNavigation from '../components/Auth/FormNavigation'
import AccountTypeSelector from '../components/Auth/AccountTypeSelector'

// Separate schemas for each step
const step1Schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    gender: z.string().min(1, 'Gender is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const step2Schema = z.object({
  accountType: z.string().min(1, 'Account type is required'),
})

const step3Schema = z.object({
  experience: z.string().min(1, 'Years of experience is required'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio: z
    .string()
    .url('Invalid portfolio URL')
    .optional()
    .or(z.literal('')),
})

type Step1FormData = z.infer<typeof step1Schema>
type Step2FormData = z.infer<typeof step2Schema>
type Step3FormData = z.infer<typeof step3Schema>

const accountTypeOptions = [
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'founder', label: 'Founder' },
  { value: 'employee', label: 'Employee' },
]

const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  // Create separate form instances for each step
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      dob: '',
      password: '',
      confirmPassword: '',
    },
  })

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      accountType: '',
    },
  })

  const step3Form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      experience: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
  })

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onStep1Submit = step1Form.handleSubmit(() => {
    handleNext()
  })

  const onStep2Submit = step2Form.handleSubmit(() => {
    handleNext()
  })

  const onStep3Submit = step3Form.handleSubmit(async (data) => {
    // Get all form values
    const step1Data = step1Form.getValues()
    const step2Data = step2Form.getValues()

    // Map founder and employee to team_member role
    const role =
      step2Data.accountType === 'job_seeker' ? 'job_seeker' : 'team_member'

    const payload = {
      firstName: step1Data.firstName,
      lastName: step1Data.lastName,
      email: step1Data.email,
      password: step1Data.password,
      password2: step1Data.confirmPassword,
      phoneNumber: step1Data.phone,
      gender: step1Data.gender,
      dateOfBirth: step1Data.dob,
      role: role,
      location: '',
      experienceYears: parseInt(data.experience) || 0,
      linkedinUrl: data.linkedin || '',
      githubUrl: data.github || '',
      portfolioUrl: data.portfolio || '',
    }

    const result = await dispatch(register(payload))
    if (register.fulfilled.match(result)) {
      // Clear any stored tokens from registration (user should login)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  })

  return (
    <AuthLayout
      title='Create Account'
      showDivider={true}
      currentStep={currentStep}
      signupPage={true}
      footer={
        <>
          Already have an account?{' '}
          <Link to='/login' className='text-cyan-900 font-semibold underline'>
            Log in
          </Link>
        </>
      }
    >
      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4'>
          {error}
        </div>
      )}

      {/* STEP 1: Basic Info + Password */}
      {currentStep === 1 && (
        <form onSubmit={onStep1Submit} className='space-y-5'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              name='firstName'
              control={step1Form.control}
              placeholder='First Name'
            />
            <FormField
              name='lastName'
              control={step1Form.control}
              placeholder='Last Name'
            />
          </div>

          <FormField
            name='email'
            control={step1Form.control}
            type='email'
            placeholder='Email address'
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              name='phone'
              control={step1Form.control}
              type='tel'
              placeholder='Phone Number'
            />
            <FormField
              name='gender'
              control={step1Form.control}
              component='select'
              options={genderOptions}
            />
          </div>

          <FormField
            name='dob'
            control={step1Form.control}
            type='date'
            placeholder='Date of Birth'
          />

          <FormField
            name='password'
            control={step1Form.control}
            component='password'
            placeholder='Password'
          />

          <FormField
            name='confirmPassword'
            control={step1Form.control}
            component='password'
            placeholder='Confirm Password'
          />

          <FormNavigation
            currentStep={currentStep}
            totalSteps={3}
            onBack={handleBack}
          />
        </form>
      )}

      {/* STEP 2: Account Type Only */}
      {currentStep === 2 && (
        <form onSubmit={onStep2Submit} className='space-y-4'>
          <AccountTypeSelector
            name='accountType'
            control={step2Form.control}
            options={accountTypeOptions}
          />

          <FormNavigation
            currentStep={currentStep}
            totalSteps={3}
            onBack={handleBack}
          />
        </form>
      )}

      {/* STEP 3: Profile Details */}
      {currentStep === 3 && (
        <form onSubmit={onStep3Submit} className='space-y-5'>
          <FormField
            name='experience'
            control={step3Form.control}
            type='number'
            placeholder='Years of Experience'
          />
          <FormField
            name='linkedin'
            control={step3Form.control}
            placeholder='LinkedIn URL (optional)'
          />
          <FormField
            name='github'
            control={step3Form.control}
            placeholder='GitHub URL (optional)'
          />
          <FormField
            name='portfolio'
            control={step3Form.control}
            placeholder='Portfolio URL (optional)'
          />

          <FormNavigation
            currentStep={currentStep}
            totalSteps={3}
            onBack={handleBack}
            isLoading={loading}
          />
        </form>
      )}
    </AuthLayout>
  )
}

export default Signup
