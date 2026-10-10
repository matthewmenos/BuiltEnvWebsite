import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

/** Controlled search box used to filter list tables client-side. */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
  resultCount,
}) => (
  <div className="search-input">
    <Search size={16} aria-hidden="true" className="search-input-icon" />
    <input
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
    {typeof resultCount === 'number' && value.trim() !== '' && (
      <span className="search-input-count">
        {resultCount} {resultCount === 1 ? 'match' : 'matches'}
      </span>
    )}
  </div>
);

export default SearchInput;
