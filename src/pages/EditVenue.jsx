import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVenue, updateVenue } from '../services/venues';

export default function EditVenue() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [venue, setVenue] = useState({
    name: '',
    description: '',
    price: '',
    maxGuests: '',
    rating: '',
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false
    },
    location: {
      address: '',
      city: '',
      zip: '',
      country: '',
      continent: '',
      lat: '',
      lng: ''
    }
  });

  useEffect(() => {
    loadVenue();
  }, [id]);

  const loadVenue = async () => {
    try {
      setLoading(true);
      const venueData = await getVenue(id);
      if (venueData) {
        setVenue(venueData);
      } else {
        setError('Venue not found');
      }
    } catch (err) {
      setError('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Clean up venue data before sending
      const cleanedVenue = {
        ...venue,
        price: Number(venue.price),
        maxGuests: Number(venue.maxGuests),
        rating: Number(venue.rating) || 0,
        location: {
          ...venue.location,
          lat: Number(venue.location.lat) || 0,
          lng: Number(venue.location.lng) || 0
        }
      };
      
      await updateVenue(id, cleanedVenue);
      navigate('/profile');
    } catch (err) {
      setError('Failed to update venue. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('meta.')) {
      const metaField = name.split('.')[1];
      setVenue(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          [metaField]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setVenue(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setVenue(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Venue</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Venue Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={venue.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={venue.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing and Capacity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing and Capacity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price per Night
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={venue.price}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700">
                Maximum Guests
              </label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                value={venue.maxGuests}
                onChange={handleChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={venue.location.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={venue.location.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="location.zip" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                id="location.zip"
                name="location.zip"
                value={venue.location.zip}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={venue.location.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="meta.wifi"
                name="meta.wifi"
                checked={venue.meta.wifi}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="meta.wifi" className="ml-2 block text-sm text-gray-700">
                WiFi
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="meta.parking"
                name="meta.parking"
                checked={venue.meta.parking}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="meta.parking" className="ml-2 block text-sm text-gray-700">
                Parking
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="meta.breakfast"
                name="meta.breakfast"
                checked={venue.meta.breakfast}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="meta.breakfast" className="ml-2 block text-sm text-gray-700">
                Breakfast
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="meta.pets"
                name="meta.pets"
                checked={venue.meta.pets}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="meta.pets" className="ml-2 block text-sm text-gray-700">
                Pets Allowed
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 