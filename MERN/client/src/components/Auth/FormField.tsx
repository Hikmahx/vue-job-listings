import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';
import TextInput from './TextInput';
import PasswordInput from './PasswordInput';

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'password';
  component?: 'text' | 'password' | 'select';
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

function FormField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  component = 'text',
  options,
  className,
}: FormFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController<T>({
    name,
    control,
  });

  const errorMessage = error?.message;

  if (component === 'password') {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-cyan-900 mb-2">
            {label}
          </label>
        )}
        <PasswordInput
          value={field.value || ''}
          placeholder={placeholder}
          onChange={field.onChange}
          error={errorMessage}
        />
      </div>
    );
  }

  if (component === 'select') {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-cyan-900 mb-2">
            {label}
          </label>
        )}
        <select
          value={field.value || ''}
          onChange={field.onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-cyan-900 mb-2">
          {label}
        </label>
      )}
      <TextInput
        value={field.value || ''}
        type={type}
        placeholder={placeholder}
        onChange={field.onChange}
        error={errorMessage}
      />
    </div>
  );
}

export default FormField;
