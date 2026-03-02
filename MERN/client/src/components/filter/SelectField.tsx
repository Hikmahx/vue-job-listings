export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  style?: string;
}

const SelectField = ({
  name,
  label,
  options,
  placeholder = 'Select',
  value,
  onChange,
  style = '',
}: SelectFieldProps) => {
  return (
    <div className={style}>
      <div className="gap-0">
        <label htmlFor={`form-vee-select-${name}`} className="sr-only">
          {label}
        </label>
        <select
          id={`form-vee-select-${name}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-w-[120px] h-12 py-1 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 text-cyan-900 ${value === '' ? 'text-slate-400' : ''}`}
        >
          <option value="" className="text-slate-400">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectField;
