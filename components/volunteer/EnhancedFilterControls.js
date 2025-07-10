import { useEffect, useState } from "react";

export function EnhancedFilterControls({ 
  filter, 
  setFilter, 
  searchTerm, 
  setSearchTerm,
  locationFilter,
  setLocationFilter,
  dateRange,
  setDateRange,
  skillFilters,
  setSkillFilters,
  availableSkills 
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(localSearch), 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchTerm]);

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex space-x-4" role="radiogroup" aria-label="Opportunity filter">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="filter"
              value="matched"
              checked={filter === "matched"}
              onChange={() => setFilter("matched")}
              className="form-radio h-4 w-4 text-indigo-600"
            />
            <span className="text-sm font-medium text-gray-700">Matched to Me</span>
          </label>
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="filter"
              value="all"
              checked={filter === "all"}
              onChange={() => setFilter("all")}
              className="form-radio h-4 w-4 text-indigo-600"
            />
            <span className="text-sm font-medium text-gray-700">All Opportunities</span>
          </label>
        </div>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-sm text-indigo-600 hover:underline flex items-center"
        >
          {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          <span className="ml-1">{showAdvancedFilters ? '↑' : '↓'}</span>
        </button>
      </div>

      <input
        type="search"
        placeholder="Search by title, description, or location..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-700 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
      />

      {showAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="rounded-lg border border-gray-300 p-2 text-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="rounded-lg border border-gray-300 p-2 text-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <label key={skill} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={skillFilters.includes(skill)}
                    onChange={() => {
                      setSkillFilters(prev => 
                        prev.includes(skill) 
                          ? prev.filter(s => s !== skill) 
                          : [...prev, skill]
                      );
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}