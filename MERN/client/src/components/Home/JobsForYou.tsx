import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchJobs } from '../../redux/reducers/jobSlice';
import SectionTitle from './SectionTitle';
import JobItem from '../Jobs/JobItem';

const JobsForYou = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(fetchJobs({ page: 1, page_size: 5 }));
    }
  }, [dispatch, jobs.length]);

  const displayedJobs = jobs.slice(0, 5);

  return (
    <section className="py-16 lg:py-24 bg-cyan-50">
      <div className="container max-w-3xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
        <SectionTitle title="JOBS FOR YOU" />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-grayish-cyan">Loading jobs...</p>
          </div>
        ) : displayedJobs.length > 0 ? (
          <>
            <ul className="mb-12">
              {displayedJobs.map((job) => (
                <JobItem key={job.id} job={job} />
              ))}
            </ul>
            <div className="text-center">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center bg-cyan-400 hover:bg-cyan-900 text-white px-8 h-12 font-medium text-base tracking-wider w-full max-w-[168px] rounded-lg transition-colors"
              >
                More Jobs
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-grayish-cyan">No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobsForYou;
