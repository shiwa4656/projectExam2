import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getVenues, searchVenues } from '../services/venues';

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 12
  });
  const [sorting, setSorting] = useState({
    sort: 'created',
    sortOrder: 'desc'
  });
  const [filters, setFilters] = useState({
    price: '',
    guests: '',
    amenities: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false,
    },
  });

  const loadVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { venues: venuesData, meta } = await getVenues({
        page: pagination.currentPage,
        limit: pagination.limit,
        sort: sorting.sort,
        sortOrder: sorting.sortOrder
      });

      
      if (Array.isArray(venuesData)) {
        setVenues(venuesData);
        setFilteredVenues(venuesData);
        setPagination(prev => ({
          ...prev,
          totalPages: meta.totalPages,
          totalItems: meta.totalItems
        }));
      } else {
        setError('Failed to load venues. Invalid data format.');
        setVenues([]);
        setFilteredVenues([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load venues. Please try again later.');
      setVenues([]);
      setFilteredVenues([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, sorting.sort, sorting.sortOrder]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  // Apply filters to venues
  useEffect(() => {
    let result = [...venues];

    // Apply price filter
    if (filters.price) {
      const maxPrice = parseInt(filters.price);
      result = result.filter(venue => venue.price <= maxPrice);
    }

    // Apply guests filter
    if (filters.guests) {
      const minGuests = parseInt(filters.guests);
      result = result.filter(venue => venue.maxGuests >= minGuests);
    }

    // Apply amenities filters
    if (Object.values(filters.amenities).some(value => value)) {
      result = result.filter(venue => {
        if (!venue.meta) return false;
        
        // Check each selected amenity
        if (filters.amenities.wifi && !venue.meta.wifi) return false;
        if (filters.amenities.parking && !venue.meta.parking) return false;
        if (filters.amenities.breakfast && !venue.meta.breakfast) return false;
        if (filters.amenities.pets && !venue.meta.pets) return false;
        
        return true;
      });
    }

    setFilteredVenues(result);
  }, [venues, filters]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      // If search is empty, load all venues
      loadVenues();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get all venues first
      const { venues: allVenues } = await getVenues({
        limit: 100 // Get more venues for searching
      });

      // Filter venues based on name and description
      const filteredVenues = allVenues.filter(venue => {
        const nameMatch = venue.name && 
          typeof venue.name === 'string' && 
          venue.name.toLowerCase().includes(query);
        
        const descriptionMatch = venue.description && 
          typeof venue.description === 'string' && 
          venue.description.toLowerCase().includes(query);

        return nameMatch || descriptionMatch;
      });



      if (filteredVenues.length > 0) {
        setVenues(filteredVenues);
        setFilteredVenues(filteredVenues);
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: Math.ceil(filteredVenues.length / prev.limit)
        }));
      } else {
        setVenues([]);
        setFilteredVenues([]);
        setError('No venues found matching your search.');
      }
    } catch (err) {
      setError('Failed to search venues. Please try again.');
      setVenues([]);
      setFilteredVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters((prev) => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [name]: checked,
        },
      }));
    } else {
      // Handle numeric inputs
      if (name === 'price' || name === 'guests') {
        const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
        setFilters((prev) => ({
          ...prev,
          [name]: numValue,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSorting(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues..."
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        {/* Sorting Controls */}
        <div className="mb-4 flex gap-4">
          <select
            name="sort"
            value={sorting.sort}
            onChange={handleSortChange}
            className="input"
          >
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="maxGuests">Max Guests</option>
          </select>
          <select
            name="sortOrder"
            value={sorting.sortOrder}
            onChange={handleSortChange}
            className="input"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Price</label>
            <input
              type="number"
              name="price"
              value={filters.price}
              onChange={handleFilterChange}
              className="input mt-1"
              placeholder="Max price"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Guests</label>
            <input
              type="number"
              name="guests"
              value={filters.guests}
              onChange={handleFilterChange}
              className="input mt-1"
              placeholder="Min guests"
              min="1"
              step="1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="wifi"
                  checked={filters.amenities.wifi}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">WiFi</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="parking"
                  checked={filters.amenities.parking}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Parking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="breakfast"
                  checked={filters.amenities.breakfast}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Breakfast</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pets"
                  checked={filters.amenities.pets}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues && filteredVenues.length > 0 ? (
            filteredVenues.map((venue) => (
              <Link
                key={venue.id}
                to={`/venues/${venue.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {venue.media?.[0] ? (
                  <img
                    src={venue.media[0]}
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                    }}
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Default venue image"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
                  <p className="text-gray-600 mb-2">
                    {venue.description?.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-semibold">
                      ${venue.price}/night
                    </span>
                    <span className="text-gray-600">
                      Max guests: {venue.maxGuests}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No venues found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-8 border-t">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                      pageNumber === pagination.currentPage
                        ? 'bg-primary-600 text-white font-semibold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 