import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { setFilters } from '../../redux/reducers/filterSlice';
import { fetchJobs } from '../../redux/reducers/jobSlice';
import SearchAndCountry from './SearchAndCountry';
import RadioGroupField from './RadioGroupField';
import SelectField from './SelectField';
import SalaryRangeInput from './SalaryRangeInput';
import SearchableMultiSelect from './SearchableMultiSelect';
import CheckboxGroupField from './CheckboxGroupField';
import {
  skillsOptions,
  marketsOptions,
  levelsOptions,
  currenciesOptions,
  workTypesOptions,
  companySizesOptions,
  contractOptions,
  rolesOptions,
  timeframeOptions,
} from '../../constants/filters';
import { valLabel } from '../../utils/filters';
import { FilterFields } from '../../types';
import { z } from 'zod';

const formSchema = z
  .object({
    search: z.string().default(''),
    location: z.string().default(''),
    minSalary: z.number().min(0, 'Salary cannot be negative').optional(),
    maxSalary: z.number().min(0, 'Salary cannot be negative').optional(),
    workType: z.string().default(''),
    level: z.string().default(''),
    skills: z.array(z.string()).default([]),
    markets: z.array(z.string()).default([]),
    companySizes: z.array(z.string()).default([]),
    contract: z.array(z.string()).default([]),
    roles: z.array(z.string()).default([]),
    currency: z.string().default(''),
    timeframe: z.string().default(''),
  })
  .refine(
    (data) => {
      if (data.minSalary != null && data.maxSalary != null) {
        return data.minSalary <= data.maxSalary;
      }
      return true;
    },
    {
      message: 'Minimum salary cannot be higher than maximum salary',
      path: ['maxSalary'],
    },
  )
  .refine(
    (data) => {
      const hasMin = typeof data.minSalary === 'number';
      const hasMax = typeof data.maxSalary === 'number';
      const hasAnySalary = hasMin || hasMax;
      const hasTimeOrCurrency = !!data.timeframe || !!data.currency;
      if (!hasAnySalary && hasTimeOrCurrency) return false;
      return true;
    },
    {
      message: 'Min or max value must be provided when selecting timeframe or currency',
      path: ['maxSalary'],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const FilterModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
  const [showModal, setShowModal] = useState(false);
  const [salaryError, setSalaryError] = useState<string | undefined>();

  const [form, setForm] = useState<FormValues>({
    search: '',
    location: '',
    minSalary: undefined,
    maxSalary: undefined,
    workType: '',
    level: '',
    skills: [],
    markets: [],
    companySizes: [],
    contract: [],
    roles: [],
    currency: '',
    timeframe: '',
  });

  useEffect(() => {
    if (showModal) {
      setForm({
        search: filters.search,
        location: filters.location,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        workType: filters.workType,
        level: filters.level,
        skills: [...(filters.skills || [])],
        markets: [...(filters.markets || [])],
        companySizes: [...(filters.companySizes || [])],
        contract: [...(filters.contract || [])],
        roles: [...(filters.roles || [])],
        currency: filters.currency,
        timeframe: filters.timeframe,
      });
      setSalaryError(undefined);
    }
  }, [showModal]);

  const updateForm = (patch: Partial<FormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const maxSalaryErr = result.error.flatten().fieldErrors.maxSalary?.[0];
      if (maxSalaryErr) setSalaryError(maxSalaryErr);
      return;
    }
    setSalaryError(undefined);
    dispatch(setFilters(result.data as Partial<FilterFields>));
    dispatch(fetchJobs({ page: 1 }));
    setShowModal(false);
  };

  const skillsOpts = valLabel(skillsOptions);
  const marketsOpts = valLabel(marketsOptions);
  const timeframeOpts = valLabel(timeframeOptions);

  return (
    <div className="w-full flex md:justify-end">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-cyan-400 hover:bg-cyan-900 focus:outline-none h-12 font-medium text-base tracking-wider w-full md:w-fit text-white border-0 rounded-md px-6"
      >
        Advanced Filters
      </button>

      {showModal && createPortal(
        <>
          <div
            className="fixed inset-0 z-[100] bg-gray-900/50"
            onClick={() => setShowModal(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-modal-title"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-h-[80vh] overflow-y-auto sm:max-w-2xl lg:max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-8 px-6">
                <h2 id="filter-modal-title" className="sr-only">
                  Advanced Job Filters
                </h2>
                <p className="sr-only">
                  Use the form below to apply advanced filters to your job search.
                </p>
                <form
            id="dialogForm"
            onSubmit={handleSubmit}
            className="w-full flex flex-row flex-wrap gap-5"
          >
            <div className="w-full">
              <SearchAndCountry
                searchValue={form.search}
                locationValue={form.location}
                onSearchChange={(v) => updateForm({ search: v })}
                onLocationChange={(v) => updateForm({ location: v })}
              />
            </div>

            <div className="w-full border rounded-md p-4">
              <RadioGroupField
                name="workType"
                label="Work Type"
                options={workTypesOptions}
                value={form.workType}
                onChange={(v) => updateForm({ workType: v })}
              />
            </div>
            <hr className="w-full" />

            <div className="w-full border rounded-md p-4">
              <p className="font-bold mb-8 text-cyan-900">Level and Compensation</p>
              <div className="flex flex-wrap lg:flex-nowrap flex-row gap-6 w-full">
                <div className="flex-1 space-y-4 mt-auto">
                  <SelectField
                    name="level"
                    label="Level"
                    options={levelsOptions}
                    placeholder="Select level..."
                    value={form.level}
                    onChange={(v) => updateForm({ level: v })}
                  />
                </div>
                <SalaryRangeInput
                  minSalary={form.minSalary}
                  maxSalary={form.maxSalary}
                  onMinSalaryChange={(v) => updateForm({ minSalary: v })}
                  onMaxSalaryChange={(v) => updateForm({ maxSalary: v })}
                  salaryError={salaryError}
                  currencySlot={
                    <div className="flex-1">
                      <SelectField
                        name="currency"
                        label="Currency"
                        options={currenciesOptions}
                        placeholder="Select currency"
                        value={form.currency}
                        onChange={(v) => updateForm({ currency: v })}
                      />
                    </div>
                  }
                  timeframeSlot={
                    <div className="flex-1">
                      <SelectField
                        name="timeframe"
                        label="Timeframe"
                        options={timeframeOpts}
                        placeholder="Select timeframe"
                        value={form.timeframe}
                        onChange={(v) => updateForm({ timeframe: v })}
                      />
                    </div>
                  }
                />
              </div>
            </div>
            <hr className="w-full" />

            <div className="flex flex-wrap lg:flex-nowrap flex-row gap-6 w-full">
              <div className="w-full border rounded-md p-4 flex-1">
                <SearchableMultiSelect
                  name="skills"
                  label="Skills"
                  options={skillsOpts}
                  placeholder="Search skills..."
                  value={form.skills}
                  onChange={(v) => updateForm({ skills: v })}
                />
              </div>
              <div className="w-full border rounded-md p-4 flex-1">
                <SearchableMultiSelect
                  name="markets"
                  label="Markets"
                  options={marketsOpts}
                  placeholder="Search markets..."
                  value={form.markets}
                  onChange={(v) => updateForm({ markets: v })}
                />
              </div>
            </div>
            <hr className="w-full" />

            <div className="flex flex-col md:flex-row w-full gap-6">
              <div className="w-full border rounded-md p-4">
                <CheckboxGroupField
                  name="companySizes"
                  label="Company Size"
                  options={companySizesOptions}
                  value={form.companySizes}
                  onChange={(v) => updateForm({ companySizes: v })}
                />
              </div>
              <div className="w-full border rounded-md p-4">
                <CheckboxGroupField
                  name="contract"
                  label="Contract"
                  options={contractOptions}
                  value={form.contract}
                  onChange={(v) => updateForm({ contract: v })}
                />
              </div>
            </div>
            <hr className="w-full" />

            <div className="w-full border rounded-md p-4">
              <CheckboxGroupField
                name="roles"
                label="Roles"
                options={rolesOptions}
                value={form.roles}
                onChange={(v) => updateForm({ roles: v })}
              />
            </div>
          </form>
              </div>
              <div className="sticky bottom-0 w-full pt-4 px-6 pb-6 border-t bg-white flex justify-start">
                <button
                  type="submit"
                  form="dialogForm"
                  className="bg-cyan-400 hover:bg-cyan-900 focus:outline-none h-12 font-medium text-base tracking-wider px-6 text-white border-0 rounded-md"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default FilterModal;
