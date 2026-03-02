import type { ReactNode } from 'react';

interface SalaryRangeInputProps {
  minSalary: number | undefined;
  maxSalary: number | undefined;
  onMinSalaryChange: (value: number | undefined) => void;
  onMaxSalaryChange: (value: number | undefined) => void;
  salaryError?: string;
  currencySlot: ReactNode;
  timeframeSlot: ReactNode;
}

const SalaryRangeInput = ({
  minSalary,
  maxSalary,
  onMinSalaryChange,
  onMaxSalaryChange,
  salaryError,
  currencySlot,
  timeframeSlot,
}: SalaryRangeInputProps) => {
  return (
    <div className="space-y-4 flex">
      <div className="flex items-center justify-between sr-only">
        <span className="text-cyan-900">Compensation</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 relative">
        <div className="flex gap-4 items-center h-fit">
          <div className="relative">
            <label htmlFor="form-vee-demo-minSalary" className="sr-only">
              Min Salary
            </label>
            <input
              type="number"
              id="form-vee-demo-minSalary"
              placeholder="Min"
              min={0}
              value={minSalary ?? ''}
              onChange={(e) =>
                onMinSalaryChange(
                  e.target.value === '' || e.target.value === null
                    ? undefined
                    : Number(e.target.value),
                )
              }
              className="w-24 h-12 py-1 px-3 border border-gray-200 rounded-md transition-all focus:outline-none focus:border-gray-400 text-cyan-900 placeholder:text-slate-400"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="relative">
            <label htmlFor="form-vee-demo-maxSalary" className="sr-only">
              Max Salary
            </label>
            <input
              type="number"
              id="form-vee-demo-maxSalary"
              placeholder="Max"
              min={0}
              value={maxSalary ?? ''}
              onChange={(e) =>
                onMaxSalaryChange(
                  e.target.value === '' || e.target.value === null
                    ? undefined
                    : Number(e.target.value),
                )
              }
              className="w-24 h-12 py-1 px-3 border border-gray-200 rounded-md transition-all focus:outline-none focus:border-gray-400 text-cyan-900 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {currencySlot}
          {timeframeSlot}
        </div>
        {salaryError && (
          <p className="absolute -top-6 left-0 text-xs italic text-red-400">{salaryError}</p>
        )}
      </div>
    </div>
  );
};

export default SalaryRangeInput;
