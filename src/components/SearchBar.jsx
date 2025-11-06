import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search images..."
        className="w-full rounded-full bg-gray-900/60 border border-gray-800 pl-10 pr-32 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-full"
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
