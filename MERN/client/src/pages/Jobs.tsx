import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchJobs, setCurrentPage } from '../redux/reducers/jobSlice';
import Header from '../components/layout/Header';
import Footer from '../components/Home/Footer';
import SearchFilter from '../components/filter/SearchFilter';
import JobItem from '../components/Jobs/JobItem';
import JobItemSkeleton from '../components/Jobs/JobItemSkeleton';

const Jobs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error, currentPage, totalPages } = useSelector(
    (state: RootState) => state.jobs
  );
  const filters = useSelector((state: RootState) => state.filters);

  useEffect(() => {
    const filterParams: any = {
      page: currentPage,
      page_size: 10,
    };

    if (filters.search) filterParams.search = filters.search;
    if (filters.location) filterParams.location = filters.location;
    if (filters.level) filterParams.level = filters.level;
    if (filters.workType) filterParams.workType = filters.workType;
    if (filters.currency) filterParams.currency = filters.currency;
    if (filters.minSalary) filterParams.minSalary = filters.minSalary;
    if (filters.maxSalary) filterParams.maxSalary = filters.maxSalary;
    if (filters.timeframe) filterParams.timeframe = filters.timeframe;
    if (filters.skills.length > 0) filterParams.skills = filters.skills;
    if (filters.markets.length > 0) filterParams.markets = filters.markets;
    if (filters.companySizes.length > 0) filterParams.companySizes = filters.companySizes;
    if (filters.contract.length > 0) filterParams.contract = filters.contract;
    if (filters.roles.length > 0) filterParams.roles = filters.roles;
    if (filters.sortByCompany) filterParams.sortByCompany = 'true';

    dispatch(fetchJobs(filterParams));
  }, [dispatch, currentPage, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header>
        <SearchFilter />
      </Header>

      <div className="max-w-3xl lg:max-w-6xl mx-auto flex-grow">
        <div className="py-24 px-4 lg:px-10">
          {loading ? (
            <ul className="flex flex-col gap-6">
              {Array.from({ length: 6 }).map((_, n) => (
                <JobItemSkeleton key={n} />
              ))}
            </ul>
          ) : error ? (
            <div className="text-red-500 font-semibold text-center py-20">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-gray-500 font-medium text-center py-20">
              No jobs found matching your filters.
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-6">
                {jobs.map((job) => (
                  <JobItem key={job.id} job={job} />
                ))}
              </ul>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => dispatch(setCurrentPage(page))}
                      className={`px-4 py-2 rounded ${
                        currentPage === page
                          ? 'bg-cyan-400 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
