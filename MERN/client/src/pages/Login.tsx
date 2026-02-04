import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { login } from '../redux/reducers/authSlice';
import AuthLayout from '../components/auth/AuthLayout';
import TextInput from '../components/auth/TextInput';
import PasswordInput from '../components/auth/PasswordInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [submitCount, setSubmitCount] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitCount(submitCount + 1);
    if (!validate()) return;

    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout title="Login">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <TextInput
          value={email}
          type="email"
          placeholder="Email address"
          error={submitCount > 0 ? errors.email : ''}
          onChange={setEmail}
        />

        {/* Password */}
        <PasswordInput
          value={password}
          placeholder="Password"
          error={submitCount > 0 ? errors.password : ''}
          onChange={setPassword}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      </form>

      <div className="mt-6 text-center text-grayish-cyan">
        Don't have an account?{' '}
        <Link to="/signup" className="text-cyan-900 font-semibold underline">
          Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
