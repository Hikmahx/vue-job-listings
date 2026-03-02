import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { resetFilters, setFilters } from '../../redux/reducers/filterSlice';
import FilterBtn from './FilterBtn';
import { getSalaryDisplay } from '../../utils/salaryFormatter';
import {
  levelsOptions,
  skillsOptions,
  marketsOptions,
  rolesOptions,
} from '../../constants/filters';
import type { FilterState } from '../../redux/reducers/filterSlice';

function getGroupedFilters(state: FilterState): Array<Record<string, unknown>> {
  const data = Object.entries(state).filter(
    ([key]) => key !== 'selectedBtns' && key !== 'aiMode',
  );
  const mappedData = data
    .filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'string' && (value as string).trim() === ''),
    )
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 1) return { [key]: value[0] };
        if (value.length > 1) return { [key]: value.length };
      } else if (typeof value === 'string' || typeof value === 'number') {
        return { [key]: value };
      } else if (typeof value === 'boolean' && value === true) {
        return { [key]: value };
      }
      return null;
    })
    .filter(Boolean) as Array<Record<string, unknown>>;
  return mappedData;
}

const Filter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);

  const selectedBtns = useMemo(() => {
    const filterData = getGroupedFilters(filters);
    const btns: Array<{ text: string; key: string; value: unknown }> = [];

    for (const item of filterData) {
      const entries = Object.entries(item ?? {});
      const first = entries[0];
      if (!first) continue;
      const [key, value] = first;

      if (
        key === 'search' ||
        key === 'location' ||
        key === 'sortByCompany' ||
        key === 'timeframe'
      )
        continue;

      switch (key) {
        case 'workType':
          btns.push({
            text: String(value).replace(/^./, (c) => c.toUpperCase()),
            key: 'workType',
            value: '',
          });
          break;
        case 'level': {
          const levelObj = levelsOptions.find((opt) => opt.value === value);
          btns.push({
            text: levelObj?.label ?? String(value),
            key: 'level',
            value: '',
          });
          break;
        }
        case 'minSalary':
        case 'maxSalary': {
          const foundMin = filterData.find(
            (it) => it && 'minSalary' in it,
          ) as Record<string, unknown> | undefined;
          const foundMax = filterData.find(
            (it) => it && 'maxSalary' in it,
          ) as Record<string, unknown> | undefined;
          const foundCurrency = filterData.find(
            (it) => it && 'currency' in it,
          ) as Record<string, unknown> | undefined;
          const foundTimeframe = filterData.find(
            (it) => it && 'timeframe' in it,
          ) as Record<string, unknown> | undefined;
          const min = foundMin?.minSalary as number | undefined;
          const max = foundMax?.maxSalary as number | undefined;
          const currency = (foundCurrency?.currency as string) ?? '';
          const timeframe = (foundTimeframe?.timeframe as string) ?? '';
          const salaryDisplay = getSalaryDisplay(min, max, currency, timeframe);
          if (salaryDisplay && !btns.some((b) => b.key === 'salary')) {
            btns.push({
              text: salaryDisplay,
              key: 'salary',
              value: {
                minSalary: undefined,
                maxSalary: undefined,
                currency: '',
                timeframe: '',
              },
            });
          }
          break;
        }
        case 'skills':
        case 'markets':
        case 'companySizes':
        case 'contract':
        case 'roles': {
          const arrays: Record<string, string[] | undefined> = {
            skills: filters.skills,
            markets: filters.markets,
            companySizes: filters.companySizes,
            contract: filters.contract,
            roles: filters.roles,
          };
          const arr = arrays[key];
          if (typeof value === 'number') {
            const oneLabel =
              value === 1 && arr?.[0]
                ? key === 'skills'
                  ? skillsOptions.find(
                      (s) => s.toLowerCase().replace(/\s+/g, '-') === arr[0],
                    ) ?? arr[0]
                  : key === 'markets'
                    ? marketsOptions.find(
                        (m) =>
                          m.toLowerCase().replace(/\s+/g, '-') === arr[0],
                      ) ?? arr[0]
                    : arr[0]
                : '';
            btns.push({
              text: value === 1 ? oneLabel : `${key} • ${value}`,
              key,
              value: [],
            });
          } else {
            let label = String(value);
            if (key === 'skills') {
              const found = skillsOptions.find(
                (s) =>
                  s.toLowerCase().replace(/\s+/g, '-') === String(value),
              );
              label = found ?? String(value);
            } else if (key === 'markets') {
              const found = marketsOptions.find(
                (m) =>
                  m.toLowerCase().replace(/\s+/g, '-') === String(value),
              );
              label = found ?? String(value);
            } else if (key === 'roles') {
              const found = rolesOptions.find((r) => r === String(value));
              label = found ?? String(value);
            }
            btns.push({ text: label, key, value: [] });
          }
          break;
        }
        default:
          break;
      }
    }
    return btns;
  }, [filters]);

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
          }),
        );
      } else {
        const key = btnToRemove.key as keyof typeof filters;
        dispatch(setFilters({ [key]: btnToRemove.value } as never));
      }
    }
  };

  const clearAllBtns = () => {
    dispatch(resetFilters());
  };

  return (
    <div
      className={`${
        selectedBtns.length > 0 ? 'block' : 'hidden'
      } border-t pt-5`}
    >
      <div className="w-full relative h-auto">
        <div className="flex flex-wrap gap-4">
          <FilterBtn
            btns={selectedBtns.map((btn) => btn.text)}
            removeBtn={removeBtn}
          />
        </div>
        <button
          type="button"
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
