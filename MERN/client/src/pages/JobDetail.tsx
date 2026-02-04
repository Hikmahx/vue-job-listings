import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchJobById } from '../redux/reducers/jobSlice';
import Header from '../components/layout/Header';
import Footer from '../components/Home/Footer';
import { Heart, Share2, MapPin, Clock, Briefcase, ExternalLink } from 'lucide-react';
import { getSalaryDisplay } from '../utils/salaryFormatter';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentJob, loading, error } = useSelector((state: RootState) => state.jobs);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id));
    }
  }, [dispatch, id]);

  const jobDetails = currentJob?.jobDetails;
  const salaryDisplay = currentJob
    ? getSalaryDisplay(
        currentJob.minSalary,
        currentJob.maxSalary,
        currentJob.currency,
        currentJob.timeframe
      )
    : '';

  const quickInfoItems = currentJob
    ? [
        {
          icon: Briefcase,
          label: 'Salary',
          value: salaryDisplay,
          show: !!salaryDisplay,
        },
        {
          icon: Clock,
          label: 'Experience',
          value: jobDetails?.experienceRequired,
          show: !!jobDetails?.experienceRequired,
        },
        {
          icon: MapPin,
          label: 'Location',
          value: currentJob.location,
          show: true,
          capitalize: true,
        },
        {
          icon: Briefcase,
          label: 'Level',
          value: currentJob.level,
          show: true,
          capitalize: true,
        },
      ].filter((item) => item.show)
    : [];

  const companyInfoItems = currentJob
    ? [
        {
          label: 'Market',
          value: currentJob.market,
          show: !!currentJob.market,
          capitalize: true,
        },
        {
          label: 'Founded',
          value: jobDetails?.foundedYear?.toString() || '',
          show: !!jobDetails?.foundedYear,
        },
        {
          label: 'Company Size',
          value: currentJob.companySize ? `${currentJob.companySize} employees` : null,
          show: !!currentJob.companySize,
        },
      ].filter((item) => item.show)
    : [];

  const handleApplyClick = () => {
    if (jobDetails?.externalApply && jobDetails?.apply) {
      window.open(jobDetails.apply, '_blank');
    } else {
      navigate(`/jobs/${id}/apply`);
    }
  };

  const handleShare = () => {
    if (navigator.share && currentJob) {
      navigator.share({
        title: currentJob.position,
        text: `Check out this job at ${currentJob.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-cyan-50 relative">
      <Header>
        {/* Loading State */}
        {loading && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="p-8 text-center">
              <p className="leading-loose text-grayish-cyan font-semibold">Loading job details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="p-8 text-center">
              <p className="leading-loose text-red-500 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {currentJob && !loading && !error && (
          <div className="relative max-w-6xl mx-auto px-4 h-full flex items-center">
            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 relative -top-20 pb-12">
              {/* Company Header Card */}
              <div className="bg-white rounded-md shadow-md mb-8 overflow-hidden">
                <div className="flex items-center justify-between p-8 md:p-12">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <img
                          src={currentJob.logo}
                          alt={currentJob.company}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-[#19202d] mb-2">
                        {currentJob.company}
                      </h1>
                      <p className="leading-loose text-grayish-cyan">
                        {currentJob.company.toLowerCase().replace(/\s+/g, '')}.com
                      </p>
                    </div>
                  </div>
                  {jobDetails?.website && (
                    <a
                      href={jobDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:block px-6 py-3 bg-cyan-50 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-cyan-50 transition-colors font-bold"
                    >
                      Company Site
                    </a>
                  )}
                </div>
                {jobDetails?.website && (
                  <a
                    href={jobDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:hidden block w-full py-3 bg-cyan-50 text-cyan-400 text-center hover:bg-cyan-400 hover:text-cyan-50 transition-colors font-bold"
                  >
                    Company Site
                  </a>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="bg-white rounded-md shadow-md p-8 md:p-12">
                    {/* Job Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 text-grayish-cyan mb-3">
                          <span>{currentJob.postedAt}</span>
                          <span>•</span>
                          <span className="capitalize">{currentJob.contract}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#19202d] mb-3">
                          {currentJob.position}
                        </h2>
                        <p className="leading-loose text-cyan-400 font-bold text-sm mb-4">
                          {currentJob.location}
                        </p>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => setIsFavorited(!isFavorited)}
                            className={`p-2 rounded-md transition-colors ${
                              isFavorited
                                ? 'bg-red-50 text-red-500'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="Save job"
                          >
                            <Heart fill={isFavorited ? 'currentColor' : 'none'} size={20} />
                          </button>
                          <button
                            onClick={handleShare}
                            className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            title="Share job"
                          >
                            <Share2 size={20} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handleApplyClick}
                        className="px-8 py-4 bg-cyan-400 text-white rounded-md hover:bg-cyan-900 transition-colors font-bold whitespace-nowrap flex items-center gap-2 justify-center"
                      >
                        <span>{jobDetails?.externalApply ? 'Apply' : 'Apply Now'}</span>
                        {jobDetails?.externalApply && <ExternalLink size={18} />}
                      </button>
                    </div>

                    {/* Job Description */}
                    {jobDetails && (
                      <div className="prose max-w-none">
                        <p className="leading-loose text-grayish-cyan mb-8 whitespace-pre-line">
                          {jobDetails.description}
                        </p>

                        {/* Requirements */}
                        {jobDetails.requirements && (
                          <div className="mb-8">
                            <h3 className="text-xl font-bold text-[#19202d] mb-4">Requirements</h3>
                            {jobDetails.requirements.content && (
                              <p className="leading-loose text-grayish-cyan mb-4 whitespace-pre-line">
                                {jobDetails.requirements.content}
                              </p>
                            )}
                            {jobDetails.requirements.items &&
                              jobDetails.requirements.items.length > 0 && (
                                <ul className="list-disc ml-6 space-y-3 text-grayish-cyan marker:text-cyan-400 marker:bg-cyan-50">
                                  {jobDetails.requirements.items.map((item, index) => (
                                    <li key={index} className="leading-loose">
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>
                        )}

                        {/* Responsibilities */}
                        {jobDetails.responsibilities && (
                          <div className="mb-8">
                            <h3 className="text-xl font-bold text-[#19202d] mb-4">What You Will Do</h3>
                            {jobDetails.responsibilities.content && (
                              <p className="leading-loose text-grayish-cyan mb-4 whitespace-pre-line">
                                {jobDetails.responsibilities.content}
                              </p>
                            )}
                            {jobDetails.responsibilities.items &&
                              jobDetails.responsibilities.items.length > 0 && (
                                <ol className="list-decimal ml-6 space-y-3 text-grayish-cyan marker:text-cyan-400 marker:font-bold marker:bg-cyan-50">
                                  {jobDetails.responsibilities.items.map((item, index) => (
                                    <li key={index} className="leading-loose">
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                  <div className="lg:sticky lg:top-8">
                    {/* Quick Info Card */}
                    <div className="bg-white rounded-md shadow-md p-6 mb-6">
                      <h3 className="text-lg font-bold text-[#19202d] mb-4">Job Details</h3>
                      <div className="space-y-4">
                        {quickInfoItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="flex items-start gap-3">
                              <Icon size={20} className="text-cyan-400 mt-0.5" />
                              <div>
                                <p className="leading-loose text-xs text-grayish-cyan mb-1">
                                  {item.label}
                                </p>
                                <p
                                  className={`font-semibold text-[#19202d] ${
                                    item.capitalize ? 'capitalize' : ''
                                  }`}
                                >
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Company Info Card */}
                    <div className="bg-white rounded-md shadow-md p-6 mb-6">
                      <h3 className="text-lg font-bold text-[#19202d] mb-4">About Company</h3>
                      <div className="space-y-3">
                        {companyInfoItems.map((item) => (
                          <div key={item.label}>
                            <p className="leading-loose text-xs text-grayish-cyan mb-1">
                              {item.label}
                            </p>
                            <p
                              className={`font-semibold text-[#19202d] ${
                                item.capitalize ? 'capitalize' : ''
                              }`}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                        {jobDetails?.website && (
                          <div>
                            <a
                              href={jobDetails.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-cyan-400 hover:underline font-semibold"
                            >
                              View Profile
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {currentJob.skills && currentJob.skills.length > 0 && (
                      <div className="bg-white rounded-md shadow-md p-6">
                        <h3 className="text-lg font-bold text-[#19202d] mb-4">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentJob.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-cyan-50 text-cyan-400 rounded-md text-sm font-semibold capitalize"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Apply Section */}
              <div className="bg-white rounded-md shadow-md p-6 mt-8 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-[#19202d] mb-1">
                      {currentJob.position}
                    </h3>
                    <p className="leading-loose text-grayish-cyan">{currentJob.company}</p>
                  </div>
                  <button
                    onClick={handleApplyClick}
                    className="w-full md:w-auto px-8 py-4 bg-cyan-400 text-white rounded-md hover:bg-cyan-900 transition-colors font-bold flex items-center gap-2 justify-center"
                  >
                    <span>{jobDetails?.externalApply ? 'Apply' : 'Apply Now'}</span>
                    {jobDetails?.externalApply && <ExternalLink size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Header>
      <Footer />
    </div>
  );
};

export default JobDetail;
