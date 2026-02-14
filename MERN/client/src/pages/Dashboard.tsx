import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { getProfile } from '../redux/reducers/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch user profile on mount to ensure we have the latest data
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome Back, {user?.fullName || 'User'}
      </h2>
      <p className="text-gray-600 mb-6">
        Role:{' '}
        <span className="font-medium capitalize">
          {user?.role?.replace('_', ' ') || 'User'}
        </span>
      </p>

      <div className="border-t border-gray-200 my-6"></div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      ) : (
        <>
          {user?.role === 'job_seeker' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Applications</h3>
              <p className="text-gray-600">View and manage your job applications</p>
              <Link
                to="/dashboard/applied-jobs"
                className="inline-block mt-4 bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Applications
              </Link>
            </div>
          )}

          {user?.role === 'team_member' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Company Management</h3>
              <p className="text-gray-600">Manage your companies and create job postings</p>
              <div className="flex gap-4 mt-4">
                <Link
                  to="/dashboard/companies"
                  className="bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  My Companies
                </Link>
                <Link
                  to="/dashboard/create-job"
                  className="bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Create Job
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
