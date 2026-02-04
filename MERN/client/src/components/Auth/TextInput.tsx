interface TextInputProps {
  value?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  onChange?: (value: string) => void;
}

const TextInput = ({
  value = '',
  type = 'text',
  placeholder,
  error,
  onChange,
}: TextInputProps) => {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div>
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 placeholder-grayish-cyan focus:outline-none focus:ring-1 focus:ring-cyan-400"
        onChange={handleInput}
      />
      {error && <p className="text-red-500 italic text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;
