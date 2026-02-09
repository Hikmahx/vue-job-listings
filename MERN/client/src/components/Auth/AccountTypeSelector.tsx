import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';

interface AccountTypeSelectorProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  options: Array<{ value: string; label: string }>;
}

function AccountTypeSelector<T extends FieldValues>({
  name,
  control,
  options,
}: AccountTypeSelectorProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <>
      <div className="space-y-3 mt-6">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => field.onChange(option.value)}
            className={`px-4 py-3 rounded cursor-pointer transition border ${
              field.value === option.value
                ? 'bg-cyan-400 text-white border-cyan-400'
                : 'text-grayish-cyan hover:bg-gray-100 border-gray-300'
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
      {error?.message && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </>
  );
}

export default AccountTypeSelector;
