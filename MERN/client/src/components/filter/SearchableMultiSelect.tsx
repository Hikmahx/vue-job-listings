import { useState } from 'react';
import { Search } from 'lucide-react';

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
}

interface SearchableMultiSelectProps {
  name: string;
  label: string;
  options: SearchableMultiSelectOption[];
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
}

const SearchableMultiSelect = ({
  label,
  options,
  placeholder = 'Search...',
  value,
  onChange,
}: SearchableMultiSelectProps) => {
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleOption = (optionValue: string, checked: boolean) => {
    const next = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);
    onChange(next);
  };

  return (
    <div>
      <label className="font-bold text-cyan-900 block">{label}</label>
      <div className="relative mt-2">
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="h-12 py-1 px-3 pl-9 w-full border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 text-cyan-900 placeholder:text-slate-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="size-4" />
          </span>
        </div>
        <div className="max-h-40 overflow-auto border border-gray-200 rounded-md mt-2 p-2 space-y-1">
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No results found.</p>
          ) : (
            filteredOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center space-x-2 p-2 rounded hover:bg-cyan-50 cursor-pointer text-sm text-cyan-900"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    toggleOption(opt.value, e.target.checked)
                  }
                  className="accent-cyan-400 rounded"
                />
                <span>{opt.label}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchableMultiSelect;
