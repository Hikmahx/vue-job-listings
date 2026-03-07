import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin } from 'lucide-react';
import countries from 'countries-list-json';

const countryList = Object.values(countries).map((country: any) => ({
  value: country.code,
  label: country.name,
}));

const locationOptions = [
  { value: '', label: 'Worldwide' },
  ...countryList,
];

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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 200 });
  const locationTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSearch(searchValue);
  }, [searchValue]);
  useEffect(() => {
    setLocation(locationValue);
  }, [locationValue]);

  useEffect(() => {
    if (isLocationOpen && locationTriggerRef.current) {
      const rect = locationTriggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    }
  }, [isLocationOpen]);

  useEffect(() => {
    if (!isLocationOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationTriggerRef.current?.contains(e.target as Node) ||
        (e.target as Element).closest('[data-country-dropdown]')
      )
        return;
      setIsLocationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationOpen]);

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

  const selectedLocation = locationOptions.find((c) => c.value === location);

  const dropdownContent = isLocationOpen && (
    <div
      data-country-dropdown
      className="fixed z-[100] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      {locationOptions.map((country) => (
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
  );

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
          className="w-full pl-9 h-12 py-1 px-3 pr-4 transition-all focus:outline-none focus:border-gray-400 border border-gray-200 rounded-md text-cyan-900 placeholder:text-slate-400"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Location Select */}
      <div className="relative flex justify-end">
        <div className="relative w-full sm:w-[200px]">
          <button
            ref={locationTriggerRef}
            type="button"
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            className="relative w-full pl-9 h-12 pr-4 py-1 px-3 border border-gray-200 rounded-md text-left focus:outline-none focus:border-gray-400 bg-white"
          >
            <span className="absolute start-0 inset-y-0 flex items-center justify-center px-3">
              <MapPin className="size-4 text-muted-foreground" />
            </span>
            <span className={`block truncate ${selectedLocation?.label ? 'text-cyan-900' : 'text-slate-400'}`}>
              {selectedLocation?.label ?? 'Select location...'}
            </span>
          </button>

          {dropdownContent && createPortal(dropdownContent, document.body)}
        </div>
      </div>
    </div>
  );
};

export default SearchAndCountry;
