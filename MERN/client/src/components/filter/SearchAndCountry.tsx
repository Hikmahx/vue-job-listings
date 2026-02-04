import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import countries from 'countries-list-json';

const countryList = Object.values(countries).map((country: any) => ({
  value: country.code,
  label: country.name,
}));

interface SearchAndCountryProps {
  onSearchChange?: (search: string) => void;
  onLocationChange?: (location: string) => void;
  searchValue?: string;
  locationValue?: string;
}

const SearchAndCountry = ({
  onSearchChange,
  onLocationChange,
  searchValue = '',
  locationValue = '',
}: SearchAndCountryProps) => {
  const [search, setSearch] = useState(searchValue);
  const [location, setLocation] = useState(locationValue);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleLocationSelect = (countryCode: string) => {
    setLocation(countryCode);
    setIsLocationOpen(false);
    onLocationChange?.(countryCode);
  };

  const selectedLocation = countryList.find((c) => c.value === location);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Search Input */}
      <div className="flex-1 relative">
        <span className="absolute left-0 inset-y-0 flex items-center px-3 -z-10 w-4">
          <Search className="size-4 text-muted-foreground" />
        </span>
        <input
          type="text"
          placeholder="Search by role, skill, or company..."
          className="w-full pl-9 h-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 border border-gray-300 rounded-md text-cyan-900"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Location Select */}
      <div className="relative flex justify-end">
        <div className="relative w-full sm:w-[200px]">
          <button
            type="button"
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            className="relative w-full pl-9 h-12 pr-4 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-900 bg-white"
          >
            <span className="absolute start-0 inset-y-0 flex items-center justify-center px-3">
              <MapPin className="size-4 text-muted-foreground" />
            </span>
            <span className="block truncate">
              {selectedLocation?.label || 'Select location...'}
            </span>
          </button>

          {isLocationOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {countryList.map((country) => (
                <button
                  key={country.value}
                  type="button"
                  onClick={() => handleLocationSelect(country.value)}
                  className="w-full text-left px-4 py-2 hover:bg-cyan-50 text-cyan-900"
                >
                  {country.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndCountry;
