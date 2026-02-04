import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { resetFilters, setFilters } from '../../redux/reducers/filterSlice';
import FilterBtn from './FilterBtn';
import { getSalaryDisplay } from '../../utils/salaryFormatter';
import { levelsOptions } from '../../constants/filters';

const Filter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);

  const selectedBtns: Array<{ text: string; key: string; value: any }> = [];

  // Build filter buttons from active filters
  if (filters.workType) {
    selectedBtns.push({
      text: filters.workType.replace(/^./, (c) => c.toUpperCase()),
      key: 'workType',
      value: '',
    });
  }

  if (filters.level) {
    const levelObj = levelsOptions.find((opt) => opt.value === filters.level);
    selectedBtns.push({
      text: levelObj?.label || filters.level,
      key: 'level',
      value: '',
    });
  }

  if (filters.minSalary || filters.maxSalary) {
    const salaryDisplay = getSalaryDisplay(
      filters.minSalary,
      filters.maxSalary,
      filters.currency,
      filters.timeframe
    );
    if (salaryDisplay) {
      selectedBtns.push({
        text: salaryDisplay,
        key: 'salary',
        value: { minSalary: undefined, maxSalary: undefined, currency: '', timeframe: '' },
      });
    }
  }

  if (filters.skills.length > 0) {
    filters.skills.forEach((skill) => {
      selectedBtns.push({ text: skill, key: 'skills', value: [] });
    });
  }

  if (filters.markets.length > 0) {
    filters.markets.forEach((market) => {
      selectedBtns.push({ text: market, key: 'markets', value: [] });
    });
  }

  if (filters.companySizes.length > 0) {
    filters.companySizes.forEach((size) => {
      selectedBtns.push({ text: size, key: 'companySizes', value: [] });
    });
  }

  if (filters.contract.length > 0) {
    filters.contract.forEach((contract) => {
      selectedBtns.push({ text: contract, key: 'contract', value: [] });
    });
  }

  if (filters.roles.length > 0) {
    filters.roles.forEach((role) => {
      selectedBtns.push({ text: role, key: 'roles', value: [] });
    });
  }

  const removeBtn = (btnText: string) => {
    const btnToRemove = selectedBtns.find((btn) => btn.text === btnText);

    if (btnToRemove) {
      if (btnToRemove.key === 'salary') {
        dispatch(
          setFilters({
            minSalary: undefined,
            maxSalary: undefined,
            currency: '',
            timeframe: '',
          })
        );
      } else {
        const key = btnToRemove.key as keyof typeof filters;
        dispatch(setFilters({ [key]: btnToRemove.value } as any));
      }
    }
  };

  const clearAllBtns = () => {
    dispatch(resetFilters());
  };

  if (selectedBtns.length === 0) return null;

  return (
    <div className="border-t pt-5">
      <div className="w-full relative h-auto">
        <div className="flex flex-wrap gap-4">
          <FilterBtn btns={selectedBtns.map((btn) => btn.text)} removeBtn={removeBtn} />
        </div>
        <button
          className="absolute right-6 top-4 text-teal-600 font-semibold cursor-pointer hover:underline"
          onClick={clearAllBtns}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Filter;
