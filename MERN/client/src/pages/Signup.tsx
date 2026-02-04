import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { register } from '../redux/reducers/authSlice';
import AuthLayout from '../components/auth/AuthLayout';
import TextInput from '../components/auth/TextInput';
import PasswordInput from '../components/auth/PasswordInput';

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    password: '',
    confirmPassword: '',
    accountType: 'job_seeker',
    experience: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNext();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      phoneNumber: formData.phone,
      gender: formData.gender,
      dateOfBirth: formData.dob,
      role: formData.accountType,
      location: '',
      experienceYears: parseInt(formData.experience) || 0,
      linkedinUrl: formData.linkedin,
      githubUrl: formData.github,
      portfolioUrl: formData.portfolio,
    };

    const result = await dispatch(register(payload));
    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      showDivider={true}
      currentStep={currentStep}
      signupPage={true}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-900 font-semibold underline">
            Log in
          </Link>
        </>
      }
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {currentStep === 1 && (
          <>
            <TextInput
              value={formData.firstName}
              placeholder="First Name"
              onChange={(value) => setFormData({ ...formData, firstName: value })}
            />
            <TextInput
              value={formData.lastName}
              placeholder="Last Name"
              onChange={(value) => setFormData({ ...formData, lastName: value })}
            />
            <TextInput
              value={formData.email}
              type="email"
              placeholder="Email address"
              onChange={(value) => setFormData({ ...formData, email: value })}
            />
            <TextInput
              value={formData.phone}
              placeholder="Phone Number"
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-cyan-900 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <TextInput
              value={formData.dob}
              type="date"
              placeholder="Date of Birth"
              onChange={(value) => setFormData({ ...formData, dob: value })}
            />
            <div>
              <label className="block text-sm font-medium text-cyan-900 mb-2">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="job_seeker">Job Seeker</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
            <TextInput
              value={formData.experience}
              type="number"
              placeholder="Years of Experience"
              onChange={(value) => setFormData({ ...formData, experience: value })}
            />
          </>
        )}

        {currentStep === 3 && (
          <>
            <PasswordInput
              value={formData.password}
              placeholder="Password"
              onChange={(value) => setFormData({ ...formData, password: value })}
            />
            <PasswordInput
              value={formData.confirmPassword}
              placeholder="Confirm Password"
              onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            />
            <TextInput
              value={formData.linkedin}
              placeholder="LinkedIn URL (optional)"
              onChange={(value) => setFormData({ ...formData, linkedin: value })}
            />
            <TextInput
              value={formData.github}
              placeholder="GitHub URL (optional)"
              onChange={(value) => setFormData({ ...formData, github: value })}
            />
            <TextInput
              value={formData.portfolio}
              placeholder="Portfolio URL (optional)"
              onChange={(value) => setFormData({ ...formData, portfolio: value })}
            />
          </>
        )}

        <div className="flex gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading
              ? 'Signing up...'
              : currentStep < 3
                ? 'Next'
                : 'Submit'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
