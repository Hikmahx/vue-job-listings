interface CheckboxGroupFieldProps {
  name: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

const CheckboxGroupField = ({
  name,
  label,
  options,
  value,
  onChange,
}: CheckboxGroupFieldProps) => {
  const toggleOption = (option: string, checked: boolean) => {
    const next = checked ? [...value, option] : value.filter((v) => v !== option);
    onChange(next);
  };

  return (
    <fieldset>
      <legend className="font-bold mb-6 text-cyan-900">{label}</legend>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm w-full">
        {options.map((opt) => (
          <label
            key={opt}
            htmlFor={`${name}-${opt}`}
            className={`flex flex-row items-center gap-2 border-2 rounded-md p-3 h-[43.25px] cursor-pointer capitalize transition-colors w-full ${
              value.includes(opt)
                ? 'bg-cyan-400/30 border-cyan-900/50 text-cyan-900 font-bold'
                : 'border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              id={`${name}-${opt}`}
              checked={value.includes(opt)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                toggleOption(opt, e.target.checked)
              }
              className="accent-cyan-400 rounded"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default CheckboxGroupField;
