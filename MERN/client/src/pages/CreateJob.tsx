import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import countries from 'countries-list-json';
import { AppDispatch, RootState } from '../redux/store';
import { createJob } from '../redux/reducers/jobSlice';
import { fetchMyCompanies } from '../redux/reducers/companySlice';

const countryOptions: Array<{ value: string; label: string }> = Object.values(countries)
  .map((c: { name: string; code: string }) => ({ value: c.name, label: c.name }))
  .sort((a, b) => a.label.localeCompare(b.label));

const CreateJob = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.jobs);
  const { companies } = useSelector((state: RootState) => state.companies);

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    role: '',
    level: 'junior',
    contract: 'full-time',
    location: '',
    featured: false,
    currency: 'USD',
    minSalary: '',
    maxSalary: '',
    timeframe: 'year',
    workType: 'remote',
    skills: [] as string[],
    details: {
      description: '',
      requirements: { content: '', items: [] as string[] },
      responsibilities: { content: '', items: [] as string[] },
      externalApply: false,
      apply: '',
      experienceRequired: '',
    },
  });

  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentResponsibility, setCurrentResponsibility] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchMyCompanies());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Validation
    const errors: string[] = [];
    if (!formData.company) errors.push('Company is required');
    if (!formData.position.trim()) errors.push('Position is required');
    if (!formData.role.trim()) errors.push('Role is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.details.description.trim()) errors.push('Description is required');
    if (!formData.minSalary || !formData.maxSalary) {
      errors.push('Salary range is required');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const jobData: any = {
        company: formData.company,
        position: formData.position,
        role: formData.role,
        level: formData.level,
        contract: formData.contract,
        location: formData.location,
        featured: formData.featured,
        currency: formData.currency,
        minSalary: parseInt(formData.minSalary),
        maxSalary: parseInt(formData.maxSalary),
        timeframe: formData.timeframe,
        workType: formData.workType,
        skills: formData.skills,
        details: {
          description: formData.details.description,
          requirements: formData.details.requirements,
          responsibilities: formData.details.responsibilities,
          externalApply: formData.details.externalApply,
          apply: formData.details.apply,
          experienceRequired: formData.details.experienceRequired,
        },
      };

      await dispatch(createJob(jobData)).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors.map((e: any) => e.msg || e.message));
      } else {
        setFormErrors([err.response?.data?.message || 'Failed to create job']);
      }
    }
  };

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          requirements: {
            ...formData.details.requirements,
            items: [...formData.details.requirements.items, currentRequirement.trim()],
          },
        },
      });
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        requirements: {
          ...formData.details.requirements,
          items: formData.details.requirements.items.filter((_, i) => i !== index),
        },
      },
    });
  };

  const addResponsibility = () => {
    if (currentResponsibility.trim()) {
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          responsibilities: {
            ...formData.details.responsibilities,
            items: [...formData.details.responsibilities.items, currentResponsibility.trim()],
          },
        },
      });
      setCurrentResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        responsibilities: {
          ...formData.details.responsibilities,
          items: formData.details.responsibilities.items.filter((_, i) => i !== index),
        },
      },
    });
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()],
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <ul className="list-disc list-inside">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Company Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
          <select
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            required
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="e.g. Frontend, Backend, Fullstack"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            >
              <option value="junior">Junior</option>
              <option value="midweight">Midweight</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract *</label>
            <select
              value={formData.contract}
              onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
            <select
              value={formData.workType}
              onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <select
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            required
          >
            <option value="">Select country...</option>
            {countryOptions.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {/* Salary */}
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary *</label>
            <input
              type="number"
              value={formData.minSalary}
              onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary *</label>
            <input
              type="number"
              value={formData.maxSalary}
              onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={formData.timeframe}
              onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="hour">Per Hour</option>
              <option value="day">Per Day</option>
              <option value="week">Per Week</option>
              <option value="month">Per Month</option>
              <option value="year">Per Year</option>
            </select>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Add a skill and press Enter"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-900"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-cyan-100 text-cyan-900 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            value={formData.details.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                details: { ...formData.details, description: e.target.value },
              })
            }
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            required
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
          <textarea
            value={formData.details.requirements.content}
            onChange={(e) =>
              setFormData({
                ...formData,
                details: {
                  ...formData.details,
                  requirements: { ...formData.details.requirements, content: e.target.value },
                },
              })
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent mb-2"
            placeholder="Requirements description"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentRequirement}
              onChange={(e) => setCurrentRequirement(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Add requirement item"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-900"
            >
              Add
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {formData.details.requirements.items.map((req, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{req}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
          <textarea
            value={formData.details.responsibilities.content}
            onChange={(e) =>
              setFormData({
                ...formData,
                details: {
                  ...formData.details,
                  responsibilities: {
                    ...formData.details.responsibilities,
                    content: e.target.value,
                  },
                },
              })
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent mb-2"
            placeholder="Responsibilities description"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentResponsibility}
              onChange={(e) => setCurrentResponsibility(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addResponsibility();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Add responsibility item"
            />
            <button
              type="button"
              onClick={addResponsibility}
              className="px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-900"
            >
              Add
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {formData.details.responsibilities.items.map((resp, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{resp}</span>
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Additional Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Required
            </label>
            <input
              type="text"
              value={formData.details.experienceRequired}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: { ...formData.details, experienceRequired: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="e.g. 3+ years"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply URL</label>
            <input
              type="url"
              value={formData.details.apply}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: { ...formData.details, apply: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="https://example.com/apply"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="externalApply"
            checked={formData.details.externalApply}
            onChange={(e) =>
              setFormData({
                ...formData,
                details: { ...formData.details, externalApply: e.target.checked },
              })
            }
            className="w-4 h-4"
          />
          <label htmlFor="externalApply" className="text-sm text-gray-700">
            External Apply (redirects to external URL)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="featured" className="text-sm text-gray-700">
            Featured Job
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-900 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
