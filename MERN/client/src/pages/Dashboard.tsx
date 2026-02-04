import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

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

      {user?.role === 'job_seeker' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Applications</h3>
          <p className="text-gray-600">You have 3 active applications</p>
          <button className="mt-4 bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold">
            View Applications
          </button>
        </div>
      )}

      {user?.role === 'team_member' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Jobs</h3>
          <p className="text-gray-600">Your team has 5 open positions</p>
          <button className="mt-4 bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold">
            Manage Positions
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
