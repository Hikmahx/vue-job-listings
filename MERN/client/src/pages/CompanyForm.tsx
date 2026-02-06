import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Save } from 'lucide-react'
import { AppDispatch, RootState } from '../redux/store'
import {
  fetchCompanyBySlug,
  createCompany,
  updateCompany,
} from '../redux/reducers/companySlice'

const CompanyForm = () => {
  const { slug } = useParams<{ slug: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentCompany, loading } = useSelector(
    (state: RootState) => state.companies,
  )

  const isEdit = !!slug && slug !== 'create'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    market: '',
    location: '',
    logo: '',
    teamSize: undefined as number | undefined,
    foundedYear: undefined as number | undefined,
    website: '',
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  const marketOptions = [
    { value: 'saas', label: 'SaaS' },
    { value: 'fintech', label: 'Fintech' },
    { value: 'healthtech', label: 'Healthtech' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'education', label: 'Education' },
    { value: 'software', label: 'Software' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'ai_ml', label: 'AI/ML' },
    { value: 'devtools', label: 'Dev Tools' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'cryptocurrency', label: 'Cryptocurrency' },
    { value: 'security', label: 'Security' },
    { value: 'climate_tech', label: 'Climate Tech' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'travel', label: 'Travel' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'others', label: 'Others' },
  ]

  useEffect(() => {
    if (isEdit && slug) {
      dispatch(fetchCompanyBySlug(slug))
    }
  }, [dispatch, isEdit, slug])

  useEffect(() => {
    if (isEdit && currentCompany) {
      setFormData({
        name: currentCompany.name,
        description: currentCompany.description,
        market: currentCompany.market,
        location: currentCompany.location,
        logo: currentCompany.logo || '',
        teamSize: currentCompany.teamSize,
        foundedYear: currentCompany.foundedYear,
        website: currentCompany.website || '',
      })
    }
  }, [isEdit, currentCompany])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors([])

    // Validation
    const errors: string[] = []
    if (!formData.name.trim()) errors.push('Company name is required')
    if (!formData.description.trim()) errors.push('Description is required')
    if (!formData.market) errors.push('Market is required')
    if (!formData.location.trim()) errors.push('Location is required')
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.push('Website must be a valid URL')
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const data: any = {
        name: formData.name,
        description: formData.description,
        market: formData.market,
        location: formData.location,
      }
      if (formData.logo) data.logo = formData.logo
      if (formData.teamSize) data.teamSize = formData.teamSize
      if (formData.foundedYear) data.foundedYear = formData.foundedYear
      if (formData.website) data.website = formData.website

      if (isEdit && slug) {
        await dispatch(updateCompany({ slug, data })).unwrap()
      } else {
        await dispatch(createCompany(data)).unwrap()
      }
      navigate('/dashboard/companies')
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(
          err.response.data.errors.map((e: any) => e.msg || e.message),
        )
      } else {
        setFormErrors([err.response?.data?.message || 'Failed to save company'])
      }
    }
  }

  const handleBack = () => {
    navigate('/dashboard/companies')
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-8'>
      <button
        onClick={handleBack}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
      >
        <ArrowLeft className='w-5 h-5' />
        Back
      </button>

      <h1 className='text-3xl font-bold text-gray-900 mb-8'>
        {isEdit ? 'Edit Company' : 'Create Company'}
      </h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {formErrors.length > 0 && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
            <ul className='list-disc list-inside'>
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Company Name *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            required
          ></textarea>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Market *
            </label>
            <select
              value={formData.market}
              onChange={(e) =>
                setFormData({ ...formData, market: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
              required
            >
              <option value=''>Select Market</option>
              {marketOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Location *
            </label>
            <input
              type='text'
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
              required
            />
          </div>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Logo URL
            </label>
            <input
              type='url'
              value={formData.logo}
              onChange={(e) =>
                setFormData({ ...formData, logo: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Website
            </label>
            <input
              type='url'
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
              placeholder='https://example.com'
            />
          </div>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Team Size
            </label>
            <input
              type='number'
              min='1'
              value={formData.teamSize || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  teamSize: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Founded Year
            </label>
            <input
              type='number'
              min='1800'
              max={new Date().getFullYear()}
              value={formData.foundedYear || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  foundedYear: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            />
          </div>
        </div>

        <div className='flex gap-4 pt-4'>
          <button
            type='button'
            onClick={handleBack}
            className='px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-900 text-white rounded-lg font-semibold transition-colors disabled:opacity-50'
          >
            <Save className='w-5 h-5' />
            {loading
              ? 'Saving...'
              : isEdit
                ? 'Update Company'
                : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyForm
