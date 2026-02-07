import { Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  debounce = 300,
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      onSearch(value);
    }, debounce);

    setTimeoutId(newTimeoutId);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
      />
      {/* {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
        </button>
      )} */}
    </div>
  );
}