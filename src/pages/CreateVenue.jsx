import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createVenue } from '../services/venues';

export default function CreateVenue() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [venueData, setVenueData] = useState({
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
    if (!isAuthenticated || !user?.venueManager) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    if (!venueData.name || venueData.name.length < 3) {
      throw new Error('Venue name must be at least 3 characters long');
    }

    if (!venueData.description || venueData.description.length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    if (!venueData.price || isNaN(venueData.price) || Number(venueData.price) <= 0) {
      throw new Error('Please enter a valid price');
    }

    if (!venueData.maxGuests || isNaN(venueData.maxGuests) || Number(venueData.maxGuests) <= 0) {
      throw new Error('Please enter a valid number of guests');
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('meta.')) {
      const metaField = name.split('.')[1];
      setVenueData(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          [metaField]: checked
        }
      }));
    } else if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setVenueData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setVenueData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form
      validateForm();
      
      const formattedData = {
        ...venueData,
        price: Number(venueData.price),
        maxGuests: Number(venueData.maxGuests),
        rating: Number(venueData.rating) || 0,
        location: {
          ...venueData.location,
          lat: Number(venueData.location.lat) || 0,
          lng: Number(venueData.location.lng) || 0
        }
      };

      // Remove any undefined or null values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });


      await createVenue(formattedData);
      
      setSuccess('Venue created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create venue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user?.venueManager) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Venue</h1>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Venue Name *
          </label>
          <input
            type="text"
            name="name"
            value={venueData.name}
            onChange={handleChange}
            className="input mt-1 w-full"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            name="description"
            value={venueData.description}
            onChange={handleChange}
            rows="4"
            className="input mt-1 w-full"
            required
            minLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price per Night *
          </label>
          <input
            type="number"
            name="price"
            value={venueData.price}
            onChange={handleChange}
            className="input mt-1 w-full"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maximum Guests *
          </label>
          <input
            type="number"
            name="maxGuests"
            value={venueData.maxGuests}
            onChange={handleChange}
            className="input mt-1 w-full"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="meta.wifi"
                checked={venueData.meta.wifi}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">WiFi</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="meta.parking"
                checked={venueData.meta.parking}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Parking</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="meta.breakfast"
                checked={venueData.meta.breakfast}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Breakfast</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="meta.pets"
                checked={venueData.meta.pets}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="location.address"
              value={venueData.location.address}
              onChange={handleChange}
              placeholder="Address"
              className="input"
            />
            <input
              type="text"
              name="location.city"
              value={venueData.location.city}
              onChange={handleChange}
              placeholder="City"
              className="input"
            />
            <input
              type="text"
              name="location.zip"
              value={venueData.location.zip}
              onChange={handleChange}
              placeholder="ZIP Code"
              className="input"
            />
            <input
              type="text"
              name="location.country"
              value={venueData.location.country}
              onChange={handleChange}
              placeholder="Country"
              className="input"
            />
            <input
              type="text"
              name="location.continent"
              value={venueData.location.continent}
              onChange={handleChange}
              placeholder="Continent"
              className="input"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="location.lat"
                value={venueData.location.lat}
                onChange={handleChange}
                placeholder="Latitude"
                className="input"
                step="any"
              />
              <input
                type="number"
                name="location.lng"
                value={venueData.location.lng}
                onChange={handleChange}
                placeholder="Longitude"
                className="input"
                step="any"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Venue'}
          </button>
        </div>
      </form>
    </div>
  );
} 