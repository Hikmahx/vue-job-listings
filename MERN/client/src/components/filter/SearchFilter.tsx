import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store';
import { setFilters, setSearch, setLocation, setSortByCompany } from '../../redux/reducers/filterSlice';
import { fetchJobs } from '../../redux/reducers/jobSlice';
import Filter from './Filter';
import SearchAndCountry from './SearchAndCountry';

const SearchFilter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search, location, sortByCompany } = useSelector((state: RootState) => state.filters);

  useEffect(() => {
    // Load from URL params
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
    if (Object.keys(query).length > 0) {
      dispatch(setFilters(query as any));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    // Update URL when filters change
    const queryObj: Record<string, string> = {};
    if (search) queryObj.search = search;
    if (location) queryObj.location = location;
    if (sortByCompany) queryObj.sortByCompany = 'true';

    setSearchParams(queryObj);
  }, [search, location, sortByCompany, setSearchParams]);

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
          {/* Regular Search Mode */}
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
        </div>

        {/* Filters */}
        <div className="mt-6">
          <Filter />
        </div>

        {/* Results count and sorting */}
        <div className="flex flex-wrap md:flex-nowrap flex-col md:flex-row items-center justify-between pt-6 mt-6 border-t gap-8">
          <div className="flex items-center gap-2 w-full">
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
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
