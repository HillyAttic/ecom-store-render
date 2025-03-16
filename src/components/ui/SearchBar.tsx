"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close search when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative" suppressHydrationWarning>
      {/* Mobile Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
        suppressHydrationWarning
      >
        <Search size={20} />
      </button>

      {/* Desktop Search Bar */}
      <div 
        className={`
          absolute md:relative top-full right-0 mt-2 md:mt-0 w-screen md:w-auto
          ${isOpen ? 'block' : 'hidden md:block'}
        `}
        suppressHydrationWarning
      >
        <form 
          onSubmit={handleSearch}
          className="flex items-center bg-white rounded-lg shadow-sm md:shadow-none border border-gray-200 mx-4 md:mx-0"
          suppressHydrationWarning
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none"
            suppressHydrationWarning
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-2 text-gray-400 hover:text-gray-600"
              suppressHydrationWarning
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-r-lg"
            suppressHydrationWarning
          >
            <Search size={20} />
          </button>
        </form>
      </div>
    </div>
  );
} 