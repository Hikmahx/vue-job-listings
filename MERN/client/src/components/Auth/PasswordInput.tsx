import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value?: string;
  placeholder?: string;
  error?: string;
  onChange?: (value: string) => void;
}

const PasswordInput = ({
  value = '',
  placeholder = 'Password',
  error,
  onChange,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div>
      <div className="relative">
        <input
          value={value}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 placeholder-grayish-cyan focus:outline-none focus:ring-1 focus:ring-cyan-400"
          onChange={handleInput}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-grayish-cyan hover:text-cyan-900 transition"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-red-500 italic text-xs mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
