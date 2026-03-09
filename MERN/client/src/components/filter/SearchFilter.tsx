import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Sparkles } from 'lucide-react';
import { AppDispatch, RootState } from '../../redux/store';
import {
  setSearch,
  setLocation,
  setSortByCompany,
  setAIMode,
  loadFromObject,
} from '../../redux/reducers/filterSlice';
import { toQueryObject } from '../../redux/reducers/filterSlice';
import { fetchJobs } from '../../redux/reducers/jobSlice';
import Filter from './Filter';
import FilterModal from './FilterModal';
import SearchAndCountry from './SearchAndCountry';
import AISearchInput from './AISearchInput';

const SearchFilter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useSelector((state: RootState) => state.filters);
  const { search, location, sortByCompany, aiMode } = filters;

  // Load from URL params (on mount and when searchParams change, e.g. back/forward)
  useEffect(() => {
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
    if (Object.keys(query).length > 0) {
      dispatch(loadFromObject(query));
    }
  }, [dispatch, searchParams]);

  // Update URL when filters change (match Vue: toQueryObject)
  useEffect(() => {
    const queryObj = toQueryObject(filters);
    setSearchParams(queryObj);
  }, [
    filters.search,
    filters.location,
    filters.sortByCompany,
    filters.aiMode,
    filters.workType,
    filters.level,
    filters.minSalary,
    filters.maxSalary,
    filters.currency,
    filters.timeframe,
    filters.skills,
    filters.markets,
    filters.roles,
    filters.companySizes,
    filters.contract,
    filters.aiFilters,
    setSearchParams,
  ]);

  const toggleSearchMode = () => {
    const newMode = !aiMode;
    dispatch(setAIMode(newMode));
    if (!newMode) {
      dispatch(fetchJobs({ page: 1 }));
    }
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearch(value));
  };

  const handleLocationChange = (value: string) => {
    dispatch(setLocation(value));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchJobs({ page: 1 }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSortByCompany(e.target.checked));
  };

  return (
    <div className="px-4 lg:px-10 w-full max-w-3xl lg:max-w-6xl m-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 -mt-12 lg:-mt-20 relative z-20 w-full">
        <div className="w-full flex">
          {/* AI Search Mode */}
          {aiMode && (
            <div className="w-full">
              <AISearchInput />
            </div>
          )}

          {/* Regular Search Mode */}
          {!aiMode && (
            <div className="w-full">
              <form onSubmit={handleFormSubmit} className="mb-6">
                <SearchAndCountry
                  searchValue={search}
                  locationValue={location}
                  onSearchChange={handleSearchChange}
                  onLocationChange={handleLocationChange}
                />
                <button type="submit" className="sr-only">
                  Apply Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Filters (shown in both modes) */}
        <div className="mt-6">
          <Filter />
        </div>

        {/* Results count and sorting (shown in both modes) - match Vue layout */}
        <div className="flex flex-wrap md:flex-nowrap flex-col md:flex-row items-center justify-between pt-6 mt-6 border-t gap-8">
          <div className="flex items-center gap-2 w-full">
            {/* Toggle Button - match Vue */}
            <div className="flex">
              <button
                type="button"
                onClick={toggleSearchMode}
                className="group flex items-center h-12 gap-2 mr-4 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                title={aiMode ? 'Switch to Regular Search' : 'Switch to AI Search'}
              >
                <ArrowLeftRight
                  className={`w-4 h-4 transition-transform duration-300 ${
                    !aiMode ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
                <span
                  className={`flex items-center gap-1 text-xs relative ${
                    !aiMode ? 'text-cyan-400' : 'text-cyan-900'
                  }`}
                >
                  {!aiMode && (
                    <Sparkles className="w-2.5 h-2.5 absolute -top-2.5 -right-2.5" />
                  )}
                  {!aiMode ? 'AI' : 'Regular'}
                </span>
              </button>
            </div>

            <span className="relative mr-6 after:content-['.'] after:ml-1 after:text-3xl after:absolute after:top-[-1rem] after:opacity-70 after:blur-[0.06rem]">
              159 results
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-cyan-700"
                checked={sortByCompany}
                onChange={handleSortChange}
              />
              <span className="text-[10px]">Sort by Company (A-Z)</span>
            </label>
          </div>
          <FilterModal />
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
