import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../redux/store';
import { Briefcase } from 'lucide-react';

const AppliedJobs = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // For now, this is a placeholder since there's no backend endpoint for applied jobs yet
  // In a real app, you would fetch applied jobs from an API endpoint like:
  // GET /api/applications/my-applications

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-gray-900">Applied Jobs</h2>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-gray-600 mb-6">
          {user?.role === 'job_seeker'
            ? "You haven't applied to any jobs yet. Start browsing jobs to find your next opportunity!"
            : "You haven't received any applications yet."}
        </p>
        {user?.role === 'job_seeker' && (
          <Link
            to="/jobs"
            className="inline-block bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse Jobs
          </Link>
        )}
      </div>

      {/* Future: List of applied jobs would go here */}
      {/* 
      {appliedJobs.length > 0 ? (
        <div className="space-y-4">
          {appliedJobs.map((application) => (
            <div key={application.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{application.job.position}</h3>
              <p className="text-sm text-gray-600">{application.job.company}</p>
              <p className="text-sm text-gray-500 mt-2">
                Applied on {new Date(application.appliedAt).toLocaleDateString()}
              </p>
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {application.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        // Empty state shown above
      )}
      */}
    </div>
  );
};

export default AppliedJobs;
