import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../common/Navbar';
import SearchAndCountry from '../filter/SearchAndCountry';
import awsLogo from '../../assets/img/trustedby/aws.svg';
import fbLogo from '../../assets/img/trustedby/fb.svg';
import frontendMentorLogo from '../../assets/img/trustedby/frontend-mentor.svg';
import githubLogo from '../../assets/img/trustedby/github.svg';
import googleLogo from '../../assets/img/trustedby/google.svg';
import microsoftLogo from '../../assets/img/trustedby/microsoft.svg';
import vercelLogo from '../../assets/img/trustedby/vercel.svg';
import bgHeroMobile from '../../assets/img/bg-hero-mobile.svg';
import bgHeroDesktop from '../../assets/img/bg-hero-desktop.svg';

const trustedCompanies = [
  { name: 'Frontend Mentor', logo: frontendMentorLogo },
  { name: 'Vercel', logo: vercelLogo },
  { name: 'Facebook', logo: fbLogo },
  { name: 'AWS', logo: awsLogo },
  { name: 'Google', logo: googleLogo },
  { name: 'GitHub', logo: githubLogo },
  { name: 'Microsoft', logo: microsoftLogo },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (location) params.set('location', location);
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="bg-cyan-400 text-white relative overflow-hidden">
      <img
        src={bgHeroMobile}
        className="absolute inset-0 w-full lg:hidden object-cover object-top h-full"
        alt="bg-hero-mobile"
      />
      <img
        src={bgHeroDesktop}
        className="absolute inset-0 hidden lg:flex w-full h-full"
        alt="bg-hero-desktop"
      />
      {/* Header Navigation */}
      <Navbar />
      {/* Hero Content */}
      <div className="container mx-auto px-4 pb-16 lg:pb-24 pt-8 lg:pt-16 relative">
        <div className="max-w-4xl mx-auto text-center mt-32">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-[60px] sm:!leading-[76px] tracking-[0.6px] max-w-80 sm:max-w-[20rem] md:max-w-[28rem] lg:max-w-[39rem] mx-auto">
            Your Next Great Role In One Place
          </h1>
          <p className="text-sm md:text-base mb-8 lg:mb-12 tracking-[0.6px] leading-6 text-cyan-50 font-normal max-w-2xl mx-auto">
            Discover Curated Roles. Smart Filters, And Real-Time Updates Built For Modern Teams And
            Job Seekers
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-[856px] mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0 text-cyan-900">
                <SearchAndCountry
                  searchValue={search}
                  locationValue={location}
                  onSearchChange={setSearch}
                  onLocationChange={setLocation}
                />
              </div>
              <button
                type="submit"
                className="bg-cyan-400 hover:bg-cyan-900 text-white px-6 lg:px-7 h-12 gap-3 whitespace-nowrap w-full sm:w-auto flex-shrink-0 self-end sm:self-center flex items-center justify-center rounded-lg font-semibold"
              >
                <Search className="w-6 h-6" />
                <span>Search</span>
              </button>
            </div>
          </form>

          <div className="mt-12 lg:mt-16 flex flex-wrap items-center justify-center gap-6 lg:gap-8 opacity-80">
            <div className="flex items-center justify-center gap-4 lg:gap-6">
              {trustedCompanies.map((company) => (
                <img
                  key={company.name}
                  src={company.logo}
                  alt={company.name}
                  className="h-2 sm:h-3 md:h-4 hover:opacity-70 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
