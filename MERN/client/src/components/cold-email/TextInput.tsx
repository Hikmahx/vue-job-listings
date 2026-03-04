interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: TextInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
      />
    </div>
  );
}
