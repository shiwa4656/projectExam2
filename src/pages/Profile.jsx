import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVenuesByProfile } from '../services/venues';
import VenueCard from '../components/VenueCard';
import { updateProfile } from '../services/auth';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: {
      url: '',
      alt: ''
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: {
          url: user.avatar?.url || '',
          alt: user.avatar?.alt || ''
        }
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load venues for venue managers
      if (user.venueManager) {
        console.log('Loading venues for venue manager:', user.name);
        const venuesData = await getVenuesByProfile(user.name);
        console.log('Venues data:', venuesData);
        setVenues(Array.isArray(venuesData) ? venuesData : []);
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueDelete = (venueId) => {
    setVenues((prevVenues) => prevVenues.filter((venue) => venue.id !== venueId));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('avatar.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        avatar: {
          ...prev.avatar,
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateProfile(profileData);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
        <p className="text-gray-600">
          {user.venueManager ? 'Venue Manager Dashboard' : 'User Profile'}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Venues Section for Venue Managers */}
      {user.venueManager ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Venues</h2>
            <button
              onClick={() => navigate('/venues/create')}
              className="btn btn-primary"
            >
              Create New Venue
            </button>
          </div>
          {venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <VenueCard 
                  key={venue.id} 
                  venue={venue} 
                  onDelete={handleVenueDelete}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              You haven't created any venues yet.
            </p>
          )}
        </div>
      ) : (
        /* Profile Section for Regular Users */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <div className="mt-2 flex items-center space-x-4">
                    {profileData.avatar.url ? (
                      <img
                        src={profileData.avatar.url}
                        alt={profileData.avatar.alt || 'Profile picture'}
                        className="w-20 h-20 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">
                          {profileData.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="url"
                        name="avatar.url"
                        value={profileData.avatar.url}
                        onChange={handleChange}
                        placeholder="Profile picture URL"
                        className="input w-full"
                      />
                      <input
                        type="text"
                        name="avatar.alt"
                        value={profileData.avatar.alt}
                        onChange={handleChange}
                        placeholder="Image description"
                        className="input w-full mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="input mt-1 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="input mt-1 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="input mt-1 w-full"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={profileData.avatar.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    alt={profileData.avatar.alt || 'Profile picture'}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{profileData.name}</h3>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate('/bookings')}
                      className="btn btn-secondary w-full"
                    >
                      View My Bookings
                    </button>
                    <button
                      onClick={() => navigate('/venues')}
                      className="btn btn-secondary w-full"
                    >
                      Browse Venues
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 