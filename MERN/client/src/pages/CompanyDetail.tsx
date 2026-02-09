import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Edit, MapPin, Calendar, Globe, Users, Building2 } from 'lucide-react';
import { AppDispatch, RootState } from '../redux/store';
import { fetchCompanyBySlug } from '../redux/reducers/companySlice';

const CompanyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentCompany, loading, error } = useSelector((state: RootState) => state.companies);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCompanyBySlug(slug));
    }
  }, [dispatch, slug]);

  const handleEdit = () => {
    navigate(`/dashboard/companies/${slug}/edit`);
  };

  const handleBack = () => {
    navigate('/dashboard/companies');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Companies
      </button>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading company details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : currentCompany ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {currentCompany.logo ? (
                <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentCompany.logo}
                    alt={currentCompany.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {currentCompany.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentCompany.name}</h1>
                <p className="text-gray-600">{currentCompany.description}</p>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Company
            </button>
          </div>

          {/* Company Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-semibold text-gray-900">{currentCompany.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-cyan-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Market</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {currentCompany.market?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {currentCompany.foundedYear && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Founded</p>
                  <p className="font-semibold text-gray-900">{currentCompany.foundedYear}</p>
                </div>
              </div>
            )}

            {currentCompany.teamSize && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cyan-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Team Size</p>
                  <p className="font-semibold text-gray-900">
                    {currentCompany.teamSize} employees
                  </p>
                </div>
              </div>
            )}

            {currentCompany.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-cyan-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  <a
                    href={currentCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-cyan-400 hover:underline"
                  >
                    {currentCompany.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Founders Section */}
          {currentCompany.founders && currentCompany.founders.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Founders</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {currentCompany.founders.map((founder) => (
                  <div key={founder.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {founder.user.firstName} {founder.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{founder.user.email}</p>
                        {founder.title && (
                          <p className="text-sm text-gray-500 mt-1">{founder.title}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                          founder.permission === 'owner'
                            ? 'bg-purple-100 text-purple-700'
                            : founder.permission === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {founder.permission}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Joined {new Date(founder.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Section */}
          {currentCompany.team && currentCompany.team.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Members</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {currentCompany.team.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                        {member.title && (
                          <p className="text-sm text-gray-500 mt-1">{member.title}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                          member.permission === 'owner'
                            ? 'bg-purple-100 text-purple-700'
                            : member.permission === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.permission}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!currentCompany.founders || currentCompany.founders.length === 0) &&
            (!currentCompany.team || currentCompany.team.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No team members found.</p>
              </div>
            )}
        </div>
      ) : null}
    </div>
  );
};

export default CompanyDetail;
