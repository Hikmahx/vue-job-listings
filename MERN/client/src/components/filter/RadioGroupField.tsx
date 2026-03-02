interface RadioGroupFieldProps {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  style?: string;
}

const RadioGroupField = ({
  name,
  label,
  options,
  value,
  onChange,
  style = '',
}: RadioGroupFieldProps) => {
  return (
    <div className={style}>
      <fieldset>
        <legend className="font-bold mb-6 text-cyan-900">{label}</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {options.map((option) => (
            <label
              key={option}
              htmlFor={`${name}-${option}`}
              className={`flex flex-row items-center gap-2 border-2 rounded-md p-3 h-10 cursor-pointer capitalize transition-colors w-full ${
                value === option
                  ? 'bg-cyan-400/30 border-cyan-900/50 text-cyan-900 font-bold'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                id={`${name}-${option}`}
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="accent-cyan-400"
              />
              <span className="text-xs">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default RadioGroupField;
