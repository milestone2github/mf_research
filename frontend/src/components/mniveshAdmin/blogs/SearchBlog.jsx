import React, { useState } from 'react';

// function SearchBlog({ searchQuery, setSearchQuery }) {
function SearchBlog({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value === "") {
      onSearch("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full md:w-auto">
      <input
        type="text"
        name="search"
        value={query}
        onChange={handleChange}
        placeholder="Search title"
        className="border border-gray-300 p-2 rounded-md w-full md:w-80"
      />
      <button type="submit" className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md">
        Search
      </button>
    </form>
  );
}

export default SearchBlog;
